# Деплой Salaf Audio на Cloudflare

## Пошаговая инструкция

### 1. Cloudflare Pages (фронтенд)

1. Зайди на [dash.cloudflare.com](https://dash.cloudflare.com)
2. **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
3. Выбери репозиторий `aminmod-bit/audio.salaflibrary`
4. Настройки билда:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Node.js version:** `22`
5. Нажми **Save and Deploy**

### 2. Cloudflare R2 (аудио-файлы)

1. **R2 Object Storage** → **Create bucket**
   - Имя: `salaf-audio`
   - Location: automatic
2. После создания бакета → **Settings** → **API tokens** → **Create API token**
   - Permissions: **Object Read & Write**
   - Токен нужно добавить как переменную окружения

### 3. Cloudflare D1 (база данных)

1. **D1 SQL Database** → **Create database**
   - Имя: `salaf-db`
2. После создания → **Console** → выполни SQL:

```sql
CREATE TABLE lectures (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  scholar TEXT,
  scholar_id TEXT,
  duration TEXT,
  icon TEXT DEFAULT '📚',
  category_id TEXT DEFAULT 'lectures',
  src TEXT,
  cover TEXT,
  tags TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE scholars (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT,
  role TEXT DEFAULT 'Учёный',
  description TEXT,
  image_url TEXT,
  lessons_count INTEGER DEFAULT 0,
  tags TEXT,
  source_url TEXT,
  image_credit TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE playlists (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  cover TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 4. Переменные окружения ( Secrets)

В Cloudflare Pages → **Settings** → **Environment variables**:

```
R2_BUCKET_NAME=salaf-audio
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-r2-access-key
R2_SECRET_ACCESS_KEY=your-r2-secret-key

D1_DATABASE_ID=your-d1-database-id

ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$2a$10$...  # bcrypt hash пароля
JWT_SECRET=random-secret-string
```

### 5. Cloudflare Workers (API)

Для полноценного API создай Worker:

1. **Workers & Pages** → **Create** → **Worker**
2. Имя: `salaf-api`
3. Привяжи к Pages (или используй как отдельный Worker)

Пример Worker для авторизации:

```javascript
export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    if (url.pathname === '/api/login' && request.method === 'POST') {
      const { username, password } = await request.json()
      // Verify credentials against D1
      const user = await env.DB.prepare(
        'SELECT * FROM admin_users WHERE username = ?'
      ).bind(username).first()

      if (user && await verifyPassword(password, user.password_hash)) {
        const token = await createJWT({ userId: user.id }, env.JWT_SECRET)
        return new Response(JSON.stringify({ token }), {
          headers: { 'Content-Type': 'application/json' }
        })
      }
      return new Response('Unauthorized', { status: 401 })
    }

    return new Response('Not found', { status: 404 })
  }
}
```

### 6. Домен

1. **Custom Domains** → **Add custom domain**
2. Добавь `salaflibrary.org` или другой домен
3. Настрой DNS в своём регистраторе:

```
Type: CNAME
Name: @
Target: audio.salaflibrary.pages.dev
Proxy: Yes (облачко)
```

### 7. Localhost → Cloudflare

Для локальной разработки сайт работает через localStorage.
При деплое на Cloudflare:

- **R2** — для хранения MP3 файлов
- **D1** — для метаданных (лекции, учёные, плейлисты)
- **Workers** — для API (авторизация, загрузка)
- **Pages** — для фронтенда

Storage adapter (`src/lib/storage.ts`) уже готов к переключению.
Нужно реализовать `CloudflareStorageAdapter` вместо `LocalStorageAdapter`.

## Структура проекта

```
audio.salaflibrary/
├── src/
│   ├── lib/
│   │   └── storage.ts        # Storage adapter (localStorage → R2/D1)
│   ├── pages/
│   │   └── AdminPage.tsx     # Админ-панель
│   ├── App.tsx               # Основной компонент
│   ├── data.ts               # Типы и данные
│   └── i18n.ts               # Локализация
├── public/
│   ├── audio/                # MP3 файлы (локально)
│   ├── data/
│   │   └── speakers.json     # Данные учёных
│   └── ...
└── wrangler.toml             # Конфигурация Cloudflare (опционально)
```

## Безопасность

- Пароль админки: `admin` / `salaf2024` (изменить в production!)
- В production: bcrypt для хеширования паролей
- JWT токены для авторизации
- CORS для API запросов
- Валидация типов файлов (только аудио)
- Ограничение размера файлов

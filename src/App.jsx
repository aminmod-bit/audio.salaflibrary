import { useState, useRef, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from 'react-router-dom'
import { audioData, categories } from './data.js'

function Sidebar({ currentPath }) {
  const navigate = useNavigate()
  
  const navItems = [
    { path: '/', icon: '🏠', label: 'Главная' },
    { path: '/categories', icon: '📚', label: 'Категории' },
    { path: '/favorites', icon: '❤️', label: 'Избранное' },
    { path: '/recent', icon: '🕐', label: 'Недавние' },
    { path: '/settings', icon: '⚙️', label: 'Настройки' },
  ]

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-icon">☽</div>
          <div>
            <div className="logo-text">Salaf Library</div>
            <div className="logo-subtitle">Исламская аудио библиотека</div>
          </div>
        </div>
      </div>
      <nav className="sidebar-nav">
        {navItems.map(item => (
          <div
            key={item.path}
            className={`nav-item ${currentPath === item.path ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </div>
        ))}
        <div style={{ height: 1, background: 'var(--border)', margin: '16px 0' }} />
        <div className="nav-item" style={{ opacity: 0.5, pointerEvents: 'none' }}>
          <span className="nav-icon">📱</span>
          <span className="nav-label">Telegram Bot</span>
          <span className="nav-badge">скоро</span>
        </div>
      </nav>
    </div>
  )
}

function HomePage({ onPlay, currentTrack }) {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const filteredAudio = audioData.filter(item =>
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.author.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 10)

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <h1 className="page-title">Assalamu alaikum</h1>
        <p className="page-subtitle">Добро пожаловать в исламскую аудио библиотеку</p>
      </div>

      <div className="search-bar">
        <span className="search-icon">🔍</span>
        <input
          className="search-input"
          placeholder="Поиск аудио, лекций, суров..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="section-title">
        <span className="section-icon">◆</span>
        Категории
      </div>
      <div className="category-grid">
        {categories.slice(0, 6).map(cat => (
          <div
            key={cat.id}
            className="category-card"
            onClick={() => navigate(`/category/${cat.id}`)}
          >
            <div className="category-emoji">{cat.icon}</div>
            <div className="category-name">{cat.name}</div>
            <div className="category-count">{cat.count} аудио</div>
          </div>
        ))}
      </div>

      <div className="section-title">
        <span className="section-icon">◆</span>
        Популярное
      </div>
      <div className="audio-list">
        {filteredAudio.map(item => (
          <div
            key={item.id}
            className={`audio-item ${currentTrack?.id === item.id ? 'playing' : ''}`}
            onClick={() => onPlay(item)}
          >
            <div className="audio-cover">{item.icon}</div>
            <div className="audio-info">
              <div className="audio-title">{item.title}</div>
              <div className="audio-meta">{item.author}</div>
            </div>
            <div className="audio-duration">{item.duration}</div>
            <div className="audio-actions">
              <button className="play-btn" onClick={(e) => { e.stopPropagation(); onPlay(item) }}>
                {currentTrack?.id === item.id ? '⏸' : '▶'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function CategoriesPage() {
  const navigate = useNavigate()
  
  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <h1 className="page-title">Категории</h1>
        <p className="page-subtitle">Выберите тему для прослушивания</p>
      </div>
      <div className="category-grid">
        {categories.map(cat => (
          <div
            key={cat.id}
            className="category-card"
            onClick={() => navigate(`/category/${cat.id}`)}
          >
            <div className="category-emoji">{cat.icon}</div>
            <div className="category-name">{cat.name}</div>
            <div className="category-count">{cat.count} аудио</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function CategoryPage({ onPlay, currentTrack }) {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const category = categories.find(c => c.id === id)
  const items = audioData.filter(a => a.categoryId === id)

  if (!category) {
    return (
      <div className="page-container fade-in">
        <button className="back-btn" onClick={() => navigate('/categories')}>
          ← Назад
        </button>
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <div className="empty-text">Категория не найдена</div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container fade-in">
      <button className="back-btn" onClick={() => navigate('/categories')}>
        ← Назад к категориям
      </button>
      
      <div className="category-page-header">
        <div className="category-icon-large">{category.icon}</div>
        <div className="category-details">
          <h1>{category.name}</h1>
          <p>{category.count} аудио записей</p>
        </div>
        {items.length > 0 && (
          <button className="play-all-btn" onClick={() => onPlay(items[0])}>
            ▶ Слушать все
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎵</div>
          <div className="empty-text">Аудио в этой категории пока нет</div>
        </div>
      ) : (
        <div className="audio-list">
          {items.map(item => (
            <div
              key={item.id}
              className={`audio-item ${currentTrack?.id === item.id ? 'playing' : ''}`}
              onClick={() => onPlay(item)}
            >
              <div className="audio-cover">{item.icon}</div>
              <div className="audio-info">
                <div className="audio-title">{item.title}</div>
                <div className="audio-meta">{item.author}</div>
              </div>
              <div className="audio-duration">{item.duration}</div>
              <div className="audio-actions">
                <button className="play-btn" onClick={(e) => { e.stopPropagation(); onPlay(item) }}>
                  {currentTrack?.id === item.id ? '⏸' : '▶'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function FavoritesPage({ onPlay, currentTrack }) {
  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <h1 className="page-title">Избранное</h1>
        <p className="page-subtitle">Ваши сохраненные аудио</p>
      </div>
      <div className="empty-state">
        <div className="empty-icon">❤️</div>
        <div className="empty-text">Добавьте аудио в избранное, нажав на сердечко</div>
      </div>
    </div>
  )
}

function RecentPage({ onPlay, currentTrack }) {
  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <h1 className="page-title">Недавние</h1>
        <p className="page-subtitle">Вы недавно слушали</p>
      </div>
      <div className="empty-state">
        <div className="empty-icon">🕐</div>
        <div className="empty-text">История прослушиваний пуста</div>
      </div>
    </div>
  )
}

function SettingsPage() {
  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <h1 className="page-title">Настройки</h1>
        <p className="page-subtitle">Настройте приложение под себя</p>
      </div>
      <div style={{ 
        background: 'var(--bg-secondary)', 
        borderRadius: 16, 
        border: '1px solid var(--border)',
        padding: 24
      }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>
            Telegram Bot
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Интеграция с Telegram ботом находится в разработке. Скоро вы сможете слушать аудио прямо через Telegram.
          </div>
        </div>
        <div style={{ 
          height: 1, 
          background: 'var(--border)', 
          margin: '20px 0' 
        }} />
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>
            О приложении
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Salaf Library v1.0.0 — Исламская аудио библиотека для изучения религии.
          </div>
        </div>
      </div>
    </div>
  )
}

function PlayerBar({ currentTrack, isPlaying, onPlayPause, progress, duration, onSeek }) {
  const formatTime = (sec) => {
    if (!sec || isNaN(sec)) return '0:00'
    const m = Math.floor(sec / 60)
    const s = Math.floor(sec % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  if (!currentTrack) return null

  return (
    <div className="player-bar">
      <div className="player-info">
        <div className="player-cover">{currentTrack.icon}</div>
        <div className="player-text">
          <div className="player-title">{currentTrack.title}</div>
          <div className="player-artist">{currentTrack.author}</div>
        </div>
      </div>

      <div className="player-controls">
        <div className="player-buttons">
          <button className="ctrl-btn">⏮</button>
          <button className="ctrl-btn main-play" onClick={onPlayPause}>
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button className="ctrl-btn">⏭</button>
        </div>
        <div className="progress-container">
          <span className="progress-time">{formatTime(progress)}</span>
          <div className="progress-bar" onClick={onSeek}>
            <div className="progress-fill" style={{ width: `${duration ? (progress / duration) * 100 : 0}%` }} />
          </div>
          <span className="progress-time">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="player-extra">
        <div className="volume-container">
          <span className="volume-icon">🔊</span>
          <div className="volume-slider">
            <div className="volume-fill" style={{ width: '70%' }} />
          </div>
        </div>
      </div>
    </div>
  )
}

function App() {
  const [currentTrack, setCurrentTrack] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef(null)

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener('timeupdate', (e) => {
        setProgress(e.target.currentTime)
      })
      audioRef.current.addEventListener('loadedmetadata', (e) => {
        setDuration(e.target.duration)
      })
      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false)
      })
    }
  }, [])

  const handlePlay = (track) => {
    if (currentTrack?.id === track.id) {
      setIsPlaying(!isPlaying)
      if (isPlaying) {
        audioRef.current?.pause()
      } else {
        audioRef.current?.play().catch(() => {})
      }
    } else {
      setCurrentTrack(track)
      setIsPlaying(true)
      setProgress(0)
      if (audioRef.current && track.src) {
        audioRef.current.src = track.src
        audioRef.current.play().catch(() => {})
      }
    }
  }

  const handlePlayPause = () => {
    if (isPlaying) {
      audioRef.current?.pause()
    } else {
      audioRef.current?.play().catch(() => {}
      )
    }
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percent = x / rect.width
    const newTime = percent * duration
    if (audioRef.current) {
      audioRef.current.currentTime = newTime
    }
    setProgress(newTime)
  }

  return (
    <Router>
      <audio ref={audioRef} preload="metadata" />
      <RoutesWrapper
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onPlay={handlePlay}
        onPlayPause={handlePlayPause}
        progress={progress}
        duration={duration}
        onSeek={handleSeek}
      />
    </Router>
  )
}

function RoutesWrapper({ currentTrack, isPlaying, onPlay, onPlayPause, progress, duration, onSeek }) {
  const location = window.location.pathname

  return (
    <div className="app-layout">
      <div className="main-layout">
        <Sidebar currentPath={location} />
        <div className="content-area">
          <div className="scroll-content">
            <Routes>
              <Route path="/" element={<HomePage onPlay={onPlay} currentTrack={currentTrack} />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/category/:id" element={<CategoryPage onPlay={onPlay} currentTrack={currentTrack} />} />
              <Route path="/favorites" element={<FavoritesPage onPlay={onPlay} currentTrack={currentTrack} />} />
              <Route path="/recent" element={<RecentPage onPlay={onPlay} currentTrack={currentTrack} />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </div>
        </div>
      </div>
      <PlayerBar
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onPlayPause={onPlayPause}
        progress={progress}
        duration={duration}
        onSeek={onSeek}
      />
    </div>
  )
}

export default App

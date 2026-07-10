import { useState, useEffect } from 'react'
import { getLectures, getScholars, getScholarBooks, saveLectures, saveScholars, saveScholarBooks } from '../data'
import type { Lecture, Scholar, ScholarBook } from '../data'

type AdminTab = 'lectures' | 'scholars' | 'books'

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [activeTab, setActiveTab] = useState<AdminTab>('lectures')

  // Data
  const [lectures, setLectures] = useState<Lecture[]>([])
  const [scholars, setScholars] = useState<Scholar[]>([])
  const [scholarBooks, setScholarBooks] = useState<ScholarBook[]>([])

  // Search
  const [searchQuery, setSearchQuery] = useState('')

  // Edit states
  const [editingLecture, setEditingLecture] = useState<Partial<Lecture> | null>(null)
  const [editingScholar, setEditingScholar] = useState<Partial<Scholar> | null>(null)
  const [editingBook, setEditingBook] = useState<Partial<ScholarBook> | null>(null)

  useEffect(() => {
    const auth = localStorage.getItem('salaf-admin-auth')
    if (auth === 'true') setAuthenticated(true)
  }, [])

  useEffect(() => {
    if (authenticated) reloadData()
  }, [authenticated])

  const reloadData = () => {
    setLectures(getLectures())
    setScholars(getScholars())
    setScholarBooks(getScholarBooks())
  }

  const handleLogin = () => {
    if (username === 'admin' && password === 'salaf2024') {
      setAuthenticated(true)
      localStorage.setItem('salaf-admin-auth', 'true')
    } else {
      setLoginError('Неверный логин или пароль')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('salaf-admin-auth')
    setAuthenticated(false)
  }

  // ─── LECTURES CRUD ───
  const saveLecture = () => {
    if (!editingLecture?.title) return
    const current = getLectures()
    if (editingLecture.id && current.find(l => l.id === editingLecture.id)) {
      const updated = current.map(l => l.id === editingLecture.id ? { ...l, ...editingLecture } as Lecture : l)
      saveLectures(updated)
    } else {
      const newLecture: Lecture = {
        id: `lec-${Date.now()}`,
        title: editingLecture.title || '',
        lessonNumber: editingLecture.lessonNumber || 1,
        scholarId: editingLecture.scholarId || '',
        bookId: editingLecture.bookId || '',
        duration: editingLecture.duration || 0,
        audioUrl: editingLecture.audioUrl || '',
        coverImage: editingLecture.coverImage || '',
        description: editingLecture.description || '',
        tags: editingLecture.tags || [],
      }
      saveLectures([...current, newLecture])
    }
    setEditingLecture(null)
    reloadData()
  }

  const deleteLecture = (id: string) => {
    if (!confirm('Удалить урок?')) return
    saveLectures(getLectures().filter(l => l.id !== id))
    reloadData()
  }

  // ─── SCHOLARS CRUD ───
  const saveScholar = () => {
    if (!editingScholar?.name) return
    const current = getScholars()
    if (editingScholar.id && current.find(s => s.id === editingScholar.id)) {
      const updated = current.map(s => s.id === editingScholar.id ? { ...s, ...editingScholar } as Scholar : s)
      saveScholars(updated)
    } else {
      const newScholar: Scholar = {
        id: `scholar-${Date.now()}`,
        name: editingScholar.name || '',
        nameAr: editingScholar.nameAr || '',
        role: editingScholar.role || 'Учёный',
        description: editingScholar.description || '',
        imageUrl: editingScholar.imageUrl || '',
        tags: editingScholar.tags || [],
      }
      saveScholars([...current, newScholar])
    }
    setEditingScholar(null)
    reloadData()
  }

  const deleteScholar = (id: string) => {
    if (!confirm('Удалить учёного?')) return
    saveScholars(getScholars().filter(s => s.id !== id))
    reloadData()
  }

  // ─── BOOKS CRUD ───
  const saveBook = () => {
    if (!editingBook?.title) return
    const current = getScholarBooks()
    if (editingBook.id && current.find(b => b.id === editingBook.id)) {
      const updated = current.map(b => b.id === editingBook.id ? { ...b, ...editingBook } as ScholarBook : b)
      saveScholarBooks(updated)
    } else {
      const newBook: ScholarBook = {
        id: `book-${Date.now()}`,
        scholarId: editingBook.scholarId || '',
        title: editingBook.title || '',
        titleAr: editingBook.titleAr || '',
        description: editingBook.description || '',
        coverImage: editingBook.coverImage || '',
        order: editingBook.order || current.length + 1,
      }
      saveScholarBooks([...current, newBook])
    }
    setEditingBook(null)
    reloadData()
  }

  const deleteBook = (id: string) => {
    if (!confirm('Удалить книгу?')) return
    saveScholarBooks(getScholarBooks().filter(b => b.id !== id))
    reloadData()
  }

  // ─── EXPORT ───
  const exportJSON = (filename: string, data: any) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  // ─── FILTER ───
  const filteredLectures = lectures.filter(l =>
    !searchQuery || l.title.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const filteredScholars = scholars.filter(s =>
    !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const filteredBooks = scholarBooks.filter(b =>
    !searchQuery || b.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // ─── LOGIN ───
  if (!authenticated) {
    return (
      <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#0a0a0c',color:'#fff'}}>
        <div style={{width:360,padding:32,background:'#18181c',border:'1px solid rgba(255,255,255,0.06)',borderRadius:16}}>
          <h2 style={{marginBottom:24,textAlign:'center',fontSize:20,fontWeight:700}}>Админ-панель</h2>
          {loginError && <div style={{padding:10,background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:8,marginBottom:16,color:'#ef4444',fontSize:13}}>{loginError}</div>}
          <input type="text" placeholder="Логин" value={username} onChange={e => setUsername(e.target.value)}
            style={{width:'100%',padding:'10px 14px',borderRadius:8,border:'1px solid rgba(255,255,255,0.06)',background:'#1c1c20',color:'#fff',marginBottom:12,fontSize:14}} />
          <input type="password" placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{width:'100%',padding:'10px 14px',borderRadius:8,border:'1px solid rgba(255,255,255,0.06)',background:'#1c1c20',color:'#fff',marginBottom:16,fontSize:14}} />
          <button onClick={handleLogin}
            style={{width:'100%',padding:12,borderRadius:8,background:'#7c5cfc',color:'#fff',fontSize:14,fontWeight:600,border:'none',cursor:'pointer'}}>
            Войти
          </button>
          <div style={{marginTop:16,textAlign:'center',fontSize:12,color:'#6b6b73'}}>
            По умолчанию: admin / salaf2024
          </div>
        </div>
      </div>
    )
  }

  // ─── MAIN ───
  return (
    <div style={{minHeight:'100vh',background:'#0a0a0c',color:'#fff',padding:24}}>
      <div style={{maxWidth:1200,margin:'0 auto'}}>
        {/* Header */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24}}>
          <h1 style={{fontSize:24,fontWeight:700}}>Админ-панель</h1>
          <div style={{display:'flex',gap:8}}>
            <button onClick={() => exportJSON('speakers.json', scholars)} style={{padding:'8px 16px',borderRadius:8,border:'1px solid rgba(255,255,255,0.1)',background:'transparent',color:'#a0a0a8',fontSize:13,cursor:'pointer'}}>📥 speakers.json</button>
            <button onClick={() => exportJSON('audio.json', lectures)} style={{padding:'8px 16px',borderRadius:8,border:'1px solid rgba(255,255,255,0.1)',background:'transparent',color:'#a0a0a8',fontSize:13,cursor:'pointer'}}>📥 audio.json</button>
            <button onClick={() => exportJSON('scholar-books.json', scholarBooks)} style={{padding:'8px 16px',borderRadius:8,border:'1px solid rgba(255,255,255,0.1)',background:'transparent',color:'#a0a0a8',fontSize:13,cursor:'pointer'}}>📥 scholar-books.json</button>
            <button onClick={handleLogout} style={{padding:'8px 16px',borderRadius:8,border:'1px solid rgba(255,255,255,0.1)',background:'transparent',color:'#a0a0a8',fontSize:13,cursor:'pointer'}}>Выйти</button>
          </div>
        </div>

        {/* Search */}
        <input type="text" placeholder="Поиск..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          style={{width:'100%',maxWidth:400,padding:'10px 14px',borderRadius:8,border:'1px solid rgba(255,255,255,0.06)',background:'#18181c',color:'#fff',marginBottom:16,fontSize:14}} />

        {/* Tabs */}
        <div style={{display:'flex',gap:8,marginBottom:24}}>
          {(['lectures', 'scholars', 'books'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{padding:'8px 16px',borderRadius:100,fontSize:13,fontWeight:500,border:'1px solid rgba(255,255,255,0.1)',cursor:'pointer',
                background: activeTab === tab ? '#7c5cfc' : 'transparent',
                color: activeTab === tab ? '#fff' : '#a0a0a8',
                borderColor: activeTab === tab ? '#7c5cfc' : 'rgba(255,255,255,0.1)'}}>
              {{lectures:`Уроки (${lectures.length})`, scholars:`Учёные (${scholars.length})`, books:`Книги (${scholarBooks.length})`}[tab]}
            </button>
          ))}
        </div>

        {/* ─── LECTURES ─── */}
        {activeTab === 'lectures' && (
          <div>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:16}}>
              <h2 style={{fontSize:18,fontWeight:600}}>Уроки</h2>
              <button onClick={() => setEditingLecture({title:'',lessonNumber:1,audioUrl:'',duration:0,description:'',tags:[]})}
                style={{padding:'8px 16px',borderRadius:8,background:'#7c5cfc',color:'#fff',fontSize:13,fontWeight:600,border:'none',cursor:'pointer'}}>
                + Добавить урок
              </button>
            </div>

            {editingLecture && (
              <div style={{background:'#18181c',border:'1px solid rgba(255,255,255,0.06)',borderRadius:12,padding:20,marginBottom:16}}>
                <h3 style={{marginBottom:12,fontSize:15,fontWeight:600}}>{editingLecture.id ? 'Редактировать' : 'Новый урок'}</h3>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                  <input placeholder="Название *" value={editingLecture.title || ''} onChange={e => setEditingLecture({...editingLecture, title: e.target.value})}
                    style={{padding:'8px 12px',borderRadius:8,border:'1px solid rgba(255,255,255,0.06)',background:'#1c1c20',color:'#fff',fontSize:13}} />
                  <select value={editingLecture.scholarId || ''} onChange={e => setEditingLecture({...editingLecture, scholarId: e.target.value})}
                    style={{padding:'8px 12px',borderRadius:8,border:'1px solid rgba(255,255,255,0.06)',background:'#1c1c20',color:'#fff',fontSize:13}}>
                    <option value="">Выберите учёного</option>
                    {scholars.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <select value={editingLecture.bookId || ''} onChange={e => setEditingLecture({...editingLecture, bookId: e.target.value})}
                    style={{padding:'8px 12px',borderRadius:8,border:'1px solid rgba(255,255,255,0.06)',background:'#1c1c20',color:'#fff',fontSize:13}}>
                    <option value="">Выберите книгу</option>
                    {scholarBooks.filter(b => !editingLecture.scholarId || b.scholarId === editingLecture.scholarId).map(b => (
                      <option key={b.id} value={b.id}>{b.title}</option>
                    ))}
                  </select>
                  <input placeholder="URL аудио" value={editingLecture.audioUrl || ''} onChange={e => setEditingLecture({...editingLecture, audioUrl: e.target.value})}
                    style={{padding:'8px 12px',borderRadius:8,border:'1px solid rgba(255,255,255,0.06)',background:'#1c1c20',color:'#fff',fontSize:13}} />
                  <input placeholder="Длительность (сек)" type="number" value={editingLecture.duration || ''} onChange={e => setEditingLecture({...editingLecture, duration: parseInt(e.target.value) || 0})}
                    style={{padding:'8px 12px',borderRadius:8,border:'1px solid rgba(255,255,255,0.06)',background:'#1c1c20',color:'#fff',fontSize:13}} />
                  <input placeholder="Номер урока" type="number" value={editingLecture.lessonNumber || ''} onChange={e => setEditingLecture({...editingLecture, lessonNumber: parseInt(e.target.value) || 1})}
                    style={{padding:'8px 12px',borderRadius:8,border:'1px solid rgba(255,255,255,0.06)',background:'#1c1c20',color:'#fff',fontSize:13}} />
                  <input placeholder="Теги (через запятую)" value={editingLecture.tags?.join(', ') || ''} onChange={e => setEditingLecture({...editingLecture, tags: e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})}
                    style={{padding:'8px 12px',borderRadius:8,border:'1px solid rgba(255,255,255,0.06)',background:'#1c1c20',color:'#fff',fontSize:13}} />
                </div>
                <textarea placeholder="Описание" value={editingLecture.description || ''} onChange={e => setEditingLecture({...editingLecture, description: e.target.value})}
                  style={{width:'100%',marginTop:12,padding:'8px 12px',borderRadius:8,border:'1px solid rgba(255,255,255,0.06)',background:'#1c1c20',color:'#fff',fontSize:13,minHeight:60,resize:'vertical'}} />
                <div style={{display:'flex',gap:8,marginTop:12}}>
                  <button onClick={saveLecture} style={{padding:'8px 16px',borderRadius:8,background:'#7c5cfc',color:'#fff',fontSize:13,fontWeight:600,border:'none',cursor:'pointer'}}>Сохранить</button>
                  <button onClick={() => setEditingLecture(null)} style={{padding:'8px 16px',borderRadius:8,border:'1px solid rgba(255,255,255,0.1)',background:'transparent',color:'#a0a0a8',fontSize:13,cursor:'pointer'}}>Отмена</button>
                </div>
              </div>
            )}

            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {filteredLectures.map(l => (
                <div key={l.id} style={{display:'flex',alignItems:'center',gap:12,padding:12,background:'#18181c',border:'1px solid rgba(255,255,255,0.06)',borderRadius:10}}>
                  <div style={{width:32,height:32,borderRadius:8,background:'#222226',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:600,color:'#6b6b73',flexShrink:0}}>
                    {l.lessonNumber}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:14,fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{l.title}</div>
                    <div style={{fontSize:12,color:'#6b6b73'}}>{scholars.find(s=>s.id===l.scholarId)?.name || '—'} · {Math.floor(l.duration/60)}:{String(l.duration%60).padStart(2,'0')}</div>
                  </div>
                  <button onClick={() => setEditingLecture(l)} style={{padding:'6px 12px',borderRadius:6,border:'1px solid rgba(255,255,255,0.1)',background:'transparent',color:'#a0a0a8',fontSize:12,cursor:'pointer'}}>Изменить</button>
                  <button onClick={() => deleteLecture(l.id)} style={{padding:'6px 12px',borderRadius:6,border:'1px solid rgba(239,68,68,0.3)',background:'transparent',color:'#ef4444',fontSize:12,cursor:'pointer'}}>Удалить</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── SCHOLARS ─── */}
        {activeTab === 'scholars' && (
          <div>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:16}}>
              <h2 style={{fontSize:18,fontWeight:600}}>Учёные</h2>
              <button onClick={() => setEditingScholar({name:'',nameAr:'',role:'Учёный',description:'',imageUrl:'',tags:[]})}
                style={{padding:'8px 16px',borderRadius:8,background:'#7c5cfc',color:'#fff',fontSize:13,fontWeight:600,border:'none',cursor:'pointer'}}>
                + Добавить учёного
              </button>
            </div>

            {editingScholar && (
              <div style={{background:'#18181c',border:'1px solid rgba(255,255,255,0.06)',borderRadius:12,padding:20,marginBottom:16}}>
                <h3 style={{marginBottom:12,fontSize:15,fontWeight:600}}>{editingScholar.id ? 'Редактировать' : 'Новый учёный'}</h3>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                  <input placeholder="Имя *" value={editingScholar.name || ''} onChange={e => setEditingScholar({...editingScholar, name: e.target.value})}
                    style={{padding:'8px 12px',borderRadius:8,border:'1px solid rgba(255,255,255,0.06)',background:'#1c1c20',color:'#fff',fontSize:13}} />
                  <input placeholder="Имя (араб.)" value={editingScholar.nameAr || ''} onChange={e => setEditingScholar({...editingScholar, nameAr: e.target.value})}
                    style={{padding:'8px 12px',borderRadius:8,border:'1px solid rgba(255,255,255,0.06)',background:'#1c1c20',color:'#fff',fontSize:13}} />
                  <select value={editingScholar.role || 'Учёный'} onChange={e => setEditingScholar({...editingScholar, role: e.target.value})}
                    style={{padding:'8px 12px',borderRadius:8,border:'1px solid rgba(255,255,255,0.06)',background:'#1c1c20',color:'#fff',fontSize:13}}>
                    <option>Учёный</option><option>Лектор</option><option>Чтец</option>
                  </select>
                  <input placeholder="URL фото" value={editingScholar.imageUrl || ''} onChange={e => setEditingScholar({...editingScholar, imageUrl: e.target.value})}
                    style={{padding:'8px 12px',borderRadius:8,border:'1px solid rgba(255,255,255,0.06)',background:'#1c1c20',color:'#fff',fontSize:13}} />
                </div>
                <textarea placeholder="Описание" value={editingScholar.description || ''} onChange={e => setEditingScholar({...editingScholar, description: e.target.value})}
                  style={{width:'100%',marginTop:12,padding:'8px 12px',borderRadius:8,border:'1px solid rgba(255,255,255,0.06)',background:'#1c1c20',color:'#fff',fontSize:13,minHeight:60,resize:'vertical'}} />
                <div style={{display:'flex',gap:8,marginTop:12}}>
                  <button onClick={saveScholar} style={{padding:'8px 16px',borderRadius:8,background:'#7c5cfc',color:'#fff',fontSize:13,fontWeight:600,border:'none',cursor:'pointer'}}>Сохранить</button>
                  <button onClick={() => setEditingScholar(null)} style={{padding:'8px 16px',borderRadius:8,border:'1px solid rgba(255,255,255,0.1)',background:'transparent',color:'#a0a0a8',fontSize:13,cursor:'pointer'}}>Отмена</button>
                </div>
              </div>
            )}

            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:12}}>
              {filteredScholars.map(s => (
                <div key={s.id} style={{padding:16,background:'#18181c',border:'1px solid rgba(255,255,255,0.06)',borderRadius:12}}>
                  <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:8}}>
                    <div style={{width:48,height:48,borderRadius:'50%',background:'linear-gradient(135deg,#1b4332,#2d6a4f)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,fontSize:16,flexShrink:0}}>
                      {s.name.replace(/^Шейх\s+/, '').split(' ').map(w => w[0]).join('').slice(0,2)}
                    </div>
                    <div>
                      <div style={{fontSize:14,fontWeight:600}}>{s.name}</div>
                      <div style={{fontSize:12,color:'#6b6b73'}}>{s.role}</div>
                    </div>
                  </div>
                  <div style={{fontSize:12,color:'#6b6b73',marginBottom:8}}>{(s.description || '').slice(0,100)}...</div>
                  <div style={{display:'flex',gap:8}}>
                    <button onClick={() => setEditingScholar(s)} style={{padding:'6px 12px',borderRadius:6,border:'1px solid rgba(255,255,255,0.1)',background:'transparent',color:'#a0a0a8',fontSize:12,cursor:'pointer'}}>Изменить</button>
                    <button onClick={() => deleteScholar(s.id)} style={{padding:'6px 12px',borderRadius:6,border:'1px solid rgba(239,68,68,0.3)',background:'transparent',color:'#ef4444',fontSize:12,cursor:'pointer'}}>Удалить</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── BOOKS ─── */}
        {activeTab === 'books' && (
          <div>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:16}}>
              <h2 style={{fontSize:18,fontWeight:600}}>Книги</h2>
              <button onClick={() => setEditingBook({title:'',titleAr:'',description:'',coverImage:'',order:1})}
                style={{padding:'8px 16px',borderRadius:8,background:'#7c5cfc',color:'#fff',fontSize:13,fontWeight:600,border:'none',cursor:'pointer'}}>
                + Добавить книгу
              </button>
            </div>

            {editingBook && (
              <div style={{background:'#18181c',border:'1px solid rgba(255,255,255,0.06)',borderRadius:12,padding:20,marginBottom:16}}>
                <h3 style={{marginBottom:12,fontSize:15,fontWeight:600}}>{editingBook.id ? 'Редактировать' : 'Новая книга'}</h3>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                  <input placeholder="Название *" value={editingBook.title || ''} onChange={e => setEditingBook({...editingBook, title: e.target.value})}
                    style={{padding:'8px 12px',borderRadius:8,border:'1px solid rgba(255,255,255,0.06)',background:'#1c1c20',color:'#fff',fontSize:13}} />
                  <input placeholder="Название (араб.)" value={editingBook.titleAr || ''} onChange={e => setEditingBook({...editingBook, titleAr: e.target.value})}
                    style={{padding:'8px 12px',borderRadius:8,border:'1px solid rgba(255,255,255,0.06)',background:'#1c1c20',color:'#fff',fontSize:13}} />
                  <select value={editingBook.scholarId || ''} onChange={e => setEditingBook({...editingBook, scholarId: e.target.value})}
                    style={{padding:'8px 12px',borderRadius:8,border:'1px solid rgba(255,255,255,0.06)',background:'#1c1c20',color:'#fff',fontSize:13}}>
                    <option value="">Выберите учёного</option>
                    {scholars.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <input placeholder="Порядок" type="number" value={editingBook.order || ''} onChange={e => setEditingBook({...editingBook, order: parseInt(e.target.value) || 1})}
                    style={{padding:'8px 12px',borderRadius:8,border:'1px solid rgba(255,255,255,0.06)',background:'#1c1c20',color:'#fff',fontSize:13}} />
                </div>
                <textarea placeholder="Описание" value={editingBook.description || ''} onChange={e => setEditingBook({...editingBook, description: e.target.value})}
                  style={{width:'100%',marginTop:12,padding:'8px 12px',borderRadius:8,border:'1px solid rgba(255,255,255,0.06)',background:'#1c1c20',color:'#fff',fontSize:13,minHeight:60,resize:'vertical'}} />
                <div style={{display:'flex',gap:8,marginTop:12}}>
                  <button onClick={saveBook} style={{padding:'8px 16px',borderRadius:8,background:'#7c5cfc',color:'#fff',fontSize:13,fontWeight:600,border:'none',cursor:'pointer'}}>Сохранить</button>
                  <button onClick={() => setEditingBook(null)} style={{padding:'8px 16px',borderRadius:8,border:'1px solid rgba(255,255,255,0.1)',background:'transparent',color:'#a0a0a8',fontSize:13,cursor:'pointer'}}>Отмена</button>
                </div>
              </div>
            )}

            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:12}}>
              {filteredBooks.map(b => (
                <div key={b.id} style={{padding:16,background:'#18181c',border:'1px solid rgba(255,255,255,0.06)',borderRadius:12}}>
                  <div style={{fontSize:14,fontWeight:600,marginBottom:4}}>{b.title}</div>
                  {b.titleAr && <div style={{fontSize:12,color:'#6b6b73',direction:'rtl',marginBottom:4}}>{b.titleAr}</div>}
                  <div style={{fontSize:12,color:'#6b6b73',marginBottom:4}}>{b.description || 'Без описания'}</div>
                  <div style={{fontSize:11,color:'#6b6b73'}}>Учёный: {scholars.find(s=>s.id===b.scholarId)?.name || '—'} · Уроков: {lectures.filter(l=>l.bookId===b.id).length}</div>
                  <div style={{display:'flex',gap:8,marginTop:8}}>
                    <button onClick={() => setEditingBook(b)} style={{padding:'6px 12px',borderRadius:6,border:'1px solid rgba(255,255,255,0.1)',background:'transparent',color:'#a0a0a8',fontSize:12,cursor:'pointer'}}>Изменить</button>
                    <button onClick={() => deleteBook(b.id)} style={{padding:'6px 12px',borderRadius:6,border:'1px solid rgba(239,68,68,0.3)',background:'transparent',color:'#ef4444',fontSize:12,cursor:'pointer'}}>Удалить</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

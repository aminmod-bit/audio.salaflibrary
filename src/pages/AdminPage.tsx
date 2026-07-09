import { useState, useEffect, useRef } from 'react'
import { getLectures, getScholars, getSeries, saveLectures, saveScholars, saveSeries } from '../data'
import type { Lecture, Scholar, Series } from '../data'

type AdminTab = 'lectures' | 'scholars' | 'series'

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [activeTab, setActiveTab] = useState<AdminTab>('lectures')

  // Data
  const [lectures, setLectures] = useState<Lecture[]>([])
  const [scholars, setScholars] = useState<Scholar[]>([])
  const [series, setSeries] = useState<Series[]>([])

  // Search
  const [searchQuery, setSearchQuery] = useState('')

  // Edit states
  const [editingLecture, setEditingLecture] = useState<Partial<Lecture> | null>(null)
  const [editingScholar, setEditingScholar] = useState<Partial<Scholar> | null>(null)
  const [editingSeries, setEditingSeries] = useState<Partial<Series> | null>(null)

  // File upload
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadHint, setUploadHint] = useState('')

  useEffect(() => {
    const auth = localStorage.getItem('salaf-admin-auth')
    if (auth === 'true') setAuthenticated(true)
  }, [])

  useEffect(() => {
    if (authenticated) {
      reloadData()
    }
  }, [authenticated])

  const reloadData = () => {
    setLectures(getLectures())
    setScholars(getScholars())
    setSeries(getSeries())
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

  // ─── FILE UPLOAD ───
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const file = files[0]
    const fileName = file.name.replace(/\.[^/.]+$/, '') // Remove extension

    // Auto-fill lecture form
    setEditingLecture({
      title: fileName,
      scholar: '',
      scholarId: undefined,
      duration: '0:00',
      icon: '📚',
      categoryId: 'lectures',
      src: `./audio/${file.name}`,
      cover: undefined,
      tags: [],
      seriesId: undefined,
    })

    setUploadHint(`Файл: ${file.name} (${(file.size / 1024 / 1024).toFixed(1)} MB)`)
    setActiveTab('lectures')

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // ─── LECTURES CRUD ───
  const saveLecture = () => {
    if (!editingLecture?.title) return
    const current = getLectures()
    if (editingLecture.id && current.find(l => l.id === editingLecture.id)) {
      // Update
      const updated = current.map(l => l.id === editingLecture.id ? { ...l, ...editingLecture } as Lecture : l)
      saveLectures(updated)
    } else {
      // Create
      const newLecture: Lecture = {
        id: Date.now(),
        title: editingLecture.title || '',
        scholar: editingLecture.scholar || '',
        scholarId: editingLecture.scholarId,
        duration: editingLecture.duration || '0:00',
        icon: editingLecture.icon || '📚',
        categoryId: editingLecture.categoryId || 'lectures',
        src: editingLecture.src || '',
        cover: editingLecture.cover,
        tags: editingLecture.tags || [],
        seriesId: editingLecture.seriesId,
      }
      saveLectures([...current, newLecture])
    }
    setEditingLecture(null)
    setUploadHint('')
    reloadData()
  }

  const deleteLecture = (id: number) => {
    if (!confirm('Удалить лекцию?')) return
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
        lessonsCount: 0,
        tags: editingScholar.tags || [],
        sourceUrl: editingScholar.sourceUrl || '',
        imageCredit: editingScholar.imageCredit || '',
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

  // ─── SERIES CRUD ───
  const saveSeriesItem = () => {
    if (!editingSeries?.name) return
    const current = getSeries()
    if (editingSeries.id && current.find(s => s.id === editingSeries.id)) {
      const updated = current.map(s => s.id === editingSeries.id ? { ...s, ...editingSeries } as Series : s)
      saveSeries(updated)
    } else {
      const newSeries: Series = {
        id: `series-${Date.now()}`,
        name: editingSeries.name || '',
        description: editingSeries.description || '',
        cover: editingSeries.cover,
        scholarId: editingSeries.scholarId,
        tags: editingSeries.tags || [],
      }
      saveSeries([...current, newSeries])
    }
    setEditingSeries(null)
    reloadData()
  }

  const deleteSeriesItem = (id: string) => {
    if (!confirm('Удалить серию?')) return
    saveSeries(getSeries().filter(s => s.id !== id))
    reloadData()
  }

  // ─── EXPORT JSON ───
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
    !searchQuery || l.title.toLowerCase().includes(searchQuery.toLowerCase()) || l.scholar.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const filteredScholars = scholars.filter(s =>
    !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.nameAr.includes(searchQuery)
  )
  const filteredSeries = series.filter(s =>
    !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // ─── LOGIN FORM ───
  if (!authenticated) {
    return (
      <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg)'}}>
        <div style={{width:360,padding:32,background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:16}}>
          <h2 style={{marginBottom:24,textAlign:'center',fontSize:20,fontWeight:700}}>Админ-панель</h2>
          {loginError && <div style={{padding:10,background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:8,marginBottom:16,color:'#ef4444',fontSize:13}}>{loginError}</div>}
          <input type="text" placeholder="Логин" value={username} onChange={e => setUsername(e.target.value)}
            style={{width:'100%',padding:'10px 14px',borderRadius:8,border:'1px solid var(--border)',background:'var(--bg4)',color:'var(--text)',marginBottom:12,fontSize:14}} />
          <input type="password" placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{width:'100%',padding:'10px 14px',borderRadius:8,border:'1px solid var(--border)',background:'var(--bg4)',color:'var(--text)',marginBottom:16,fontSize:14}} />
          <button onClick={handleLogin}
            style={{width:'100%',padding:12,borderRadius:8,background:'var(--accent)',color:'#fff',fontSize:14,fontWeight:600,border:'none',cursor:'pointer'}}>
            Войти
          </button>
          <div style={{marginTop:16,textAlign:'center',fontSize:12,color:'var(--text3)'}}>
            По умолчанию: admin / salaf2024
          </div>
        </div>
      </div>
    )
  }

  // ─── MAIN ADMIN UI ───
  return (
    <div style={{minHeight:'100vh',background:'var(--bg)',color:'var(--text)',padding:24}}>
      <div style={{maxWidth:1200,margin:'0 auto'}}>
        {/* Header */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24}}>
          <h1 style={{fontSize:24,fontWeight:700}}>Админ-панель Salaf Audio</h1>
          <div style={{display:'flex',gap:8}}>
            <button onClick={() => exportJSON('speakers.json', scholars)} style={{padding:'8px 16px',borderRadius:8,border:'1px solid var(--border)',background:'transparent',color:'var(--text2)',fontSize:13,cursor:'pointer'}}>
              📥 speakers.json
            </button>
            <button onClick={() => exportJSON('audio.json', lectures)} style={{padding:'8px 16px',borderRadius:8,border:'1px solid var(--border)',background:'transparent',color:'var(--text2)',fontSize:13,cursor:'pointer'}}>
              📥 audio.json
            </button>
            <button onClick={() => exportJSON('series.json', series)} style={{padding:'8px 16px',borderRadius:8,border:'1px solid var(--border)',background:'transparent',color:'var(--text2)',fontSize:13,cursor:'pointer'}}>
              📥 series.json
            </button>
            <button onClick={handleLogout} style={{padding:'8px 16px',borderRadius:8,border:'1px solid var(--border)',background:'transparent',color:'var(--text2)',cursor:'pointer',fontSize:13}}>
              Выйти
            </button>
          </div>
        </div>

        {/* Search */}
        <input type="text" placeholder="Поиск..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          style={{width:'100%',maxWidth:400,padding:'10px 14px',borderRadius:8,border:'1px solid var(--border)',background:'var(--bg3)',color:'var(--text)',marginBottom:16,fontSize:14}} />

        {/* Upload Button */}
        <div style={{marginBottom:24}}>
          <input ref={fileInputRef} type="file" accept="audio/*,.mp3,.m4a,.ogg,.wav" onChange={handleFileSelect} style={{display:'none'}} />
          <button onClick={() => fileInputRef.current?.click()}
            style={{padding:'12px 24px',borderRadius:8,background:'linear-gradient(135deg,#1b4332,#2d6a4f)',color:'#fff',fontSize:14,fontWeight:600,border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:8}}>
            📁 Добавить аудио с компьютера
          </button>
          {uploadHint && (
            <div style={{marginTop:8,padding:'8px 12px',background:'rgba(34,197,94,0.1)',border:'1px solid rgba(34,197,94,0.3)',borderRadius:8,fontSize:12,color:'#22c55e'}}>
              {uploadHint}
            </div>
          )}
          <div style={{marginTop:8,fontSize:12,color:'var(--text3)'}}>
            Поддерживаемые форматы: MP3, M4A, OGG, WAV
          </div>
        </div>

        {/* Tabs */}
        <div style={{display:'flex',gap:8,marginBottom:24}}>
          {(['lectures', 'scholars', 'series'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{padding:'8px 16px',borderRadius:100,fontSize:13,fontWeight:500,border:'1px solid var(--border)',cursor:'pointer',
                background: activeTab === tab ? 'var(--accent)' : 'transparent',
                color: activeTab === tab ? '#fff' : 'var(--text2)',
                borderColor: activeTab === tab ? 'var(--accent)' : 'var(--border)'}}>
              {{lectures:`Лекции (${lectures.length})`, scholars:`Учёные (${scholars.length})`, series:`Серии (${series.length})`}[tab]}
            </button>
          ))}
        </div>

        {/* ─── LECTURES TAB ─── */}
        {activeTab === 'lectures' && (
          <div>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:16}}>
              <h2 style={{fontSize:18,fontWeight:600}}>Лекции</h2>
              <button onClick={() => setEditingLecture({title:'',scholar:'',duration:'0:00',icon:'📚',categoryId:'lectures',src:'',tags:[]})}
                style={{padding:'8px 16px',borderRadius:8,background:'var(--accent)',color:'#fff',fontSize:13,fontWeight:600,border:'none',cursor:'pointer'}}>
                + Добавить лекцию вручную
              </button>
            </div>

            {editingLecture && (
              <div style={{background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:12,padding:20,marginBottom:16}}>
                <h3 style={{marginBottom:12,fontSize:15,fontWeight:600}}>{editingLecture.id ? 'Редактировать' : 'Новая лекция'}</h3>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                  <input placeholder="Название *" value={editingLecture.title || ''} onChange={e => setEditingLecture({...editingLecture, title: e.target.value})}
                    style={{padding:'8px 12px',borderRadius:8,border:'1px solid var(--border)',background:'var(--bg4)',color:'var(--text)',fontSize:13}} />
                  <select value={editingLecture.scholarId || ''} onChange={e => {
                    const s = scholars.find(s => s.id === e.target.value)
                    setEditingLecture({...editingLecture, scholarId: e.target.value, scholar: s?.name || ''})
                  }}
                    style={{padding:'8px 12px',borderRadius:8,border:'1px solid var(--border)',background:'var(--bg4)',color:'var(--text)',fontSize:13}}>
                    <option value="">Выберите учёного</option>
                    {scholars.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <input placeholder="URL аудио" value={editingLecture.src || ''} onChange={e => setEditingLecture({...editingLecture, src: e.target.value})}
                    style={{padding:'8px 12px',borderRadius:8,border:'1px solid var(--border)',background:'var(--bg4)',color:'var(--text)',fontSize:13}} />
                  <select value={editingLecture.seriesId || ''} onChange={e => setEditingLecture({...editingLecture, seriesId: e.target.value})}
                    style={{padding:'8px 12px',borderRadius:8,border:'1px solid var(--border)',background:'var(--bg4)',color:'var(--text)',fontSize:13}}>
                    <option value="">Без серии</option>
                    {series.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <select value={editingLecture.categoryId || 'lectures'} onChange={e => setEditingLecture({...editingLecture, categoryId: e.target.value})}
                    style={{padding:'8px 12px',borderRadius:8,border:'1px solid var(--border)',background:'var(--bg4)',color:'var(--text)',fontSize:13}}>
                    <option value="lectures">Лекции</option>
                    <option value="series">Серии</option>
                    <option value="reminders">Напоминания</option>
                  </select>
                  <input placeholder="Длительность (0:00)" value={editingLecture.duration || ''} onChange={e => setEditingLecture({...editingLecture, duration: e.target.value})}
                    style={{padding:'8px 12px',borderRadius:8,border:'1px solid var(--border)',background:'var(--bg4)',color:'var(--text)',fontSize:13}} />
                  <input placeholder="Теги (через запятую)" value={editingLecture.tags?.join(', ') || ''} onChange={e => setEditingLecture({...editingLecture, tags: e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})}
                    style={{padding:'8px 12px',borderRadius:8,border:'1px solid var(--border)',background:'var(--bg4)',color:'var(--text)',fontSize:13}} />
                  <input placeholder="URL обложки" value={editingLecture.cover || ''} onChange={e => setEditingLecture({...editingLecture, cover: e.target.value})}
                    style={{padding:'8px 12px',borderRadius:8,border:'1px solid var(--border)',background:'var(--bg4)',color:'var(--text)',fontSize:13}} />
                </div>
                {editingLecture.src && (
                  <div style={{marginTop:12,padding:'8px 12px',background:'rgba(59,130,246,0.1)',border:'1px solid rgba(59,130,246,0.3)',borderRadius:8,fontSize:12,color:'#3b82f6'}}>
                    💡 Чтобы аудио работало постоянно, положите файл в <code>public/audio/</code> с таким же именем.
                  </div>
                )}
                <div style={{display:'flex',gap:8,marginTop:12}}>
                  <button onClick={saveLecture} style={{padding:'8px 16px',borderRadius:8,background:'var(--accent)',color:'#fff',fontSize:13,fontWeight:600,border:'none',cursor:'pointer'}}>Сохранить</button>
                  <button onClick={() => { setEditingLecture(null); setUploadHint('') }} style={{padding:'8px 16px',borderRadius:8,border:'1px solid var(--border)',background:'transparent',color:'var(--text2)',fontSize:13,cursor:'pointer'}}>Отмена</button>
                </div>
              </div>
            )}

            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {filteredLectures.map(l => (
                <div key={l.id} style={{display:'flex',alignItems:'center',gap:12,padding:12,background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:10}}>
                  <div style={{width:40,height:40,borderRadius:8,background:'var(--bg5)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>{l.icon}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:14,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{l.title}</div>
                    <div style={{fontSize:12,color:'var(--text3)'}}>{l.scholar} · {l.duration} {l.seriesId ? `· ${series.find(s=>s.id===l.seriesId)?.name || ''}` : ''}</div>
                  </div>
                  <button onClick={() => setEditingLecture(l)} style={{padding:'6px 12px',borderRadius:6,border:'1px solid var(--border)',background:'transparent',color:'var(--text2)',fontSize:12,cursor:'pointer'}}>Изменить</button>
                  <button onClick={() => deleteLecture(l.id)} style={{padding:'6px 12px',borderRadius:6,border:'1px solid rgba(239,68,68,0.3)',background:'transparent',color:'#ef4444',fontSize:12,cursor:'pointer'}}>Удалить</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── SCHOLARS TAB ─── */}
        {activeTab === 'scholars' && (
          <div>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:16}}>
              <h2 style={{fontSize:18,fontWeight:600}}>Учёные</h2>
              <button onClick={() => setEditingScholar({name:'',nameAr:'',role:'Учёный',description:'',imageUrl:'',tags:[]})}
                style={{padding:'8px 16px',borderRadius:8,background:'var(--accent)',color:'#fff',fontSize:13,fontWeight:600,border:'none',cursor:'pointer'}}>
                + Добавить учёного
              </button>
            </div>

            {editingScholar && (
              <div style={{background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:12,padding:20,marginBottom:16}}>
                <h3 style={{marginBottom:12,fontSize:15,fontWeight:600}}>{editingScholar.id ? 'Редактировать' : 'Новый учёный'}</h3>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                  <input placeholder="Имя *" value={editingScholar.name || ''} onChange={e => setEditingScholar({...editingScholar, name: e.target.value})}
                    style={{padding:'8px 12px',borderRadius:8,border:'1px solid var(--border)',background:'var(--bg4)',color:'var(--text)',fontSize:13}} />
                  <input placeholder="Имя (араб.)" value={editingScholar.nameAr || ''} onChange={e => setEditingScholar({...editingScholar, nameAr: e.target.value})}
                    style={{padding:'8px 12px',borderRadius:8,border:'1px solid var(--border)',background:'var(--bg4)',color:'var(--text)',fontSize:13}} />
                  <select value={editingScholar.role || 'Учёный'} onChange={e => setEditingScholar({...editingScholar, role: e.target.value})}
                    style={{padding:'8px 12px',borderRadius:8,border:'1px solid var(--border)',background:'var(--bg4)',color:'var(--text)',fontSize:13}}>
                    <option>Учёный</option>
                    <option>Лектор</option>
                    <option>Чтец</option>
                  </select>
                  <input placeholder="URL фото (оставьте пустым для инициалов)" value={editingScholar.imageUrl || ''} onChange={e => setEditingScholar({...editingScholar, imageUrl: e.target.value})}
                    style={{padding:'8px 12px',borderRadius:8,border:'1px solid var(--border)',background:'var(--bg4)',color:'var(--text)',fontSize:13}} />
                </div>
                <textarea placeholder="Описание" value={editingScholar.description || ''} onChange={e => setEditingScholar({...editingScholar, description: e.target.value})}
                  style={{width:'100%',marginTop:12,padding:'8px 12px',borderRadius:8,border:'1px solid var(--border)',background:'var(--bg4)',color:'var(--text)',fontSize:13,minHeight:80,resize:'vertical'}} />
                <div style={{display:'flex',gap:8,marginTop:12}}>
                  <button onClick={saveScholar} style={{padding:'8px 16px',borderRadius:8,background:'var(--accent)',color:'#fff',fontSize:13,fontWeight:600,border:'none',cursor:'pointer'}}>Сохранить</button>
                  <button onClick={() => setEditingScholar(null)} style={{padding:'8px 16px',borderRadius:8,border:'1px solid var(--border)',background:'transparent',color:'var(--text2)',fontSize:13,cursor:'pointer'}}>Отмена</button>
                </div>
              </div>
            )}

            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:12}}>
              {filteredScholars.map(s => (
                <div key={s.id} style={{padding:16,background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:12}}>
                  <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:8}}>
                    <div style={{width:48,height:48,borderRadius:'50%',background:'linear-gradient(135deg,#1b4332,#2d6a4f)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,fontSize:16,flexShrink:0}}>
                      {s.name.replace(/^Шейх\s+/, '').split(' ').map(w => w[0]).join('').slice(0,2)}
                    </div>
                    <div>
                      <div style={{fontSize:14,fontWeight:600}}>{s.name}</div>
                      <div style={{fontSize:12,color:'var(--text3)'}}>{s.role} {s.nameAr && `· ${s.nameAr}`}</div>
                    </div>
                  </div>
                  <div style={{fontSize:12,color:'var(--text3)',marginBottom:8,lineHeight:1.4}}>{(s.description || '').slice(0,100)}{s.description?.length > 100 ? '...' : ''}</div>
                  <div style={{fontSize:11,color:'var(--text3)'}}>Уроков: {lectures.filter(l => l.scholarId === s.id).length}</div>
                  <div style={{display:'flex',gap:8,marginTop:8}}>
                    <button onClick={() => setEditingScholar(s)} style={{padding:'6px 12px',borderRadius:6,border:'1px solid var(--border)',background:'transparent',color:'var(--text2)',fontSize:12,cursor:'pointer'}}>Изменить</button>
                    <button onClick={() => deleteScholar(s.id)} style={{padding:'6px 12px',borderRadius:6,border:'1px solid rgba(239,68,68,0.3)',background:'transparent',color:'#ef4444',fontSize:12,cursor:'pointer'}}>Удалить</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── SERIES TAB ─── */}
        {activeTab === 'series' && (
          <div>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:16}}>
              <h2 style={{fontSize:18,fontWeight:600}}>Серии</h2>
              <button onClick={() => setEditingSeries({name:'',description:'',tags:[]})}
                style={{padding:'8px 16px',borderRadius:8,background:'var(--accent)',color:'#fff',fontSize:13,fontWeight:600,border:'none',cursor:'pointer'}}>
                + Добавить серию
              </button>
            </div>

            {editingSeries && (
              <div style={{background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:12,padding:20,marginBottom:16}}>
                <h3 style={{marginBottom:12,fontSize:15,fontWeight:600}}>{editingSeries.id ? 'Редактировать' : 'Новая серия'}</h3>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                  <input placeholder="Название *" value={editingSeries.name || ''} onChange={e => setEditingSeries({...editingSeries, name: e.target.value})}
                    style={{padding:'8px 12px',borderRadius:8,border:'1px solid var(--border)',background:'var(--bg4)',color:'var(--text)',fontSize:13}} />
                  <select value={editingSeries.scholarId || ''} onChange={e => setEditingSeries({...editingSeries, scholarId: e.target.value})}
                    style={{padding:'8px 12px',borderRadius:8,border:'1px solid var(--border)',background:'var(--bg4)',color:'var(--text)',fontSize:13}}>
                    <option value="">Без учёного</option>
                    {scholars.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <textarea placeholder="Описание" value={editingSeries.description || ''} onChange={e => setEditingSeries({...editingSeries, description: e.target.value})}
                  style={{width:'100%',marginTop:12,padding:'8px 12px',borderRadius:8,border:'1px solid var(--border)',background:'var(--bg4)',color:'var(--text)',fontSize:13,minHeight:80,resize:'vertical'}} />
                <div style={{display:'flex',gap:8,marginTop:12}}>
                  <button onClick={saveSeriesItem} style={{padding:'8px 16px',borderRadius:8,background:'var(--accent)',color:'#fff',fontSize:13,fontWeight:600,border:'none',cursor:'pointer'}}>Сохранить</button>
                  <button onClick={() => setEditingSeries(null)} style={{padding:'8px 16px',borderRadius:8,border:'1px solid var(--border)',background:'transparent',color:'var(--text2)',fontSize:13,cursor:'pointer'}}>Отмена</button>
                </div>
              </div>
            )}

            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:12}}>
              {filteredSeries.map(s => (
                <div key={s.id} style={{padding:16,background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:12}}>
                  <div style={{fontSize:14,fontWeight:600,marginBottom:4}}>{s.name}</div>
                  <div style={{fontSize:12,color:'var(--text3)',marginBottom:4}}>{s.description || 'Без описания'}</div>
                  <div style={{fontSize:11,color:'var(--text3)'}}>
                    Учёный: {scholars.find(sc => sc.id === s.scholarId)?.name || '—'} · Уроков: {lectures.filter(l => l.seriesId === s.id).length}
                  </div>
                  <div style={{display:'flex',gap:8,marginTop:8}}>
                    <button onClick={() => setEditingSeries(s)} style={{padding:'6px 12px',borderRadius:6,border:'1px solid var(--border)',background:'transparent',color:'var(--text2)',fontSize:12,cursor:'pointer'}}>Изменить</button>
                    <button onClick={() => deleteSeriesItem(s.id)} style={{padding:'6px 12px',borderRadius:6,border:'1px solid rgba(239,68,68,0.3)',background:'transparent',color:'#ef4444',fontSize:12,cursor:'pointer'}}>Удалить</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div style={{marginTop:32,padding:20,background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:12}}>
          <h3 style={{fontSize:14,fontWeight:600,marginBottom:8}}>Как добавить аудио:</h3>
          <ol style={{fontSize:13,color:'var(--text2)',lineHeight:1.8,paddingLeft:20}}>
            <li>Нажмите "📁 Добавить аудио с компьютера"</li>
            <li>Выберите MP3/M4A/OGG/WAV файл</li>
            <li>Название заполнится автоматически из имени файла</li>
            <li>Выберите учёного и серию (если нужно)</li>
            <li>Нажмите "Сохранить"</li>
            <li>Аудио сразу появится на сайте</li>
          </ol>
          <h3 style={{fontSize:14,fontWeight:600,marginTop:16,marginBottom:8}}>Как сохранить навсегда:</h3>
          <ol style={{fontSize:13,color:'var(--text2)',lineHeight:1.8,paddingLeft:20}}>
            <li>Скачайте JSON файлы кнопками "📥"</li>
            <li>Скопируйте файлы в <code>public/data/</code></li>
            <li>Скопируйте аудио файлы в <code>public/audio/</code></li>
            <li>Выполните <code>git add . && git commit -m "Update" && git push</code></li>
          </ol>
        </div>
      </div>
    </div>
  )
}

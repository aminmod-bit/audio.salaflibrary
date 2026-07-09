import { useState, useEffect, useRef } from 'react'
import { getLectures, getScholars, getSeries, saveLectures, saveScholars, saveSeries } from '../data'
import type { Lecture, Scholar, Series } from '../data'
import { readAudioMetadata, getNextLessonNumber, formatFileSize } from '../lib/audioMetadata'

type AdminTab = 'lectures' | 'scholars' | 'series'

interface DraftLecture {
  file: File
  title: string
  lessonNumber: number
  scholarId: string
  scholar: string
  seriesId: string
  categoryId: string
  duration: string
  coverImage: string
  fileType: string
  size: number
}

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

  // Batch upload
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [drafts, setDrafts] = useState<DraftLecture[]>([])
  const [batchSpeakerId, setBatchSpeakerId] = useState('')
  const [batchSeriesId, setBatchSeriesId] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadHint, setUploadHint] = useState('')

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
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setIsProcessing(true)
    const newDrafts: DraftLecture[] = []

    for (const file of files) {
      const metadata = await readAudioMetadata(file)
      newDrafts.push({
        file,
        title: metadata.title,
        lessonNumber: metadata.lessonNumber,
        scholarId: batchSpeakerId || '',
        scholar: scholars.find(s => s.id === (batchSpeakerId || ''))?.name || '',
        seriesId: batchSeriesId || '',
        categoryId: 'lectures',
        duration: metadata.duration,
        coverImage: '',
        fileType: metadata.fileType,
        size: metadata.size,
      })
    }

    // Sort by lesson number
    newDrafts.sort((a, b) => a.lessonNumber - b.lessonNumber)

    // Auto-assign lesson numbers if missing
    const currentLectures = getLectures()
    let nextNum = getNextLessonNumber(currentLectures, batchSeriesId || undefined)
    for (const draft of newDrafts) {
      if (draft.lessonNumber === 0) {
        draft.lessonNumber = nextNum
      }
      nextNum++
    }

    setDrafts(newDrafts)
    setIsProcessing(false)
    setUploadHint(`Выбрано файлов: ${files.length}`)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const updateDraft = (index: number, updates: Partial<DraftLecture>) => {
    setDrafts(prev => prev.map((d, i) => i === index ? { ...d, ...updates } : d))
  }

  const removeDraft = (index: number) => {
    setDrafts(prev => prev.filter((_, i) => i !== index))
  }

  const saveAllDrafts = () => {
    const current = getLectures()
    const newLectures: Lecture[] = drafts.map(d => ({
      id: Date.now() + Math.random() * 1000,
      title: d.title,
      scholar: d.scholar,
      scholarId: d.scholarId || undefined,
      duration: d.duration,
      icon: '📚',
      categoryId: d.categoryId,
      src: `./audio/${d.file.name}`,
      cover: undefined,
      coverImage: d.coverImage,
      tags: [],
      seriesId: d.seriesId || undefined,
      lessonNumber: d.lessonNumber,
      fileType: d.fileType,
      fileSize: d.size,
    }))

    saveLectures([...current, ...newLectures])
    setDrafts([])
    setUploadHint(`Сохранено: ${newLectures.length} лекций`)
    reloadData()
  }

  // ─── SINGLE LECTURE CRUD ───
  const saveLecture = () => {
    if (!editingLecture?.title) return
    const current = getLectures()
    if (editingLecture.id && current.find(l => l.id === editingLecture.id)) {
      const updated = current.map(l => l.id === editingLecture.id ? { ...l, ...editingLecture } as Lecture : l)
      saveLectures(updated)
    } else {
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
        coverImage: editingLecture.coverImage,
        tags: editingLecture.tags || [],
        seriesId: editingLecture.seriesId,
        lessonNumber: editingLecture.lessonNumber,
      }
      saveLectures([...current, newLecture])
    }
    setEditingLecture(null)
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

  // ─── LOGIN ───
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

  // ─── MAIN ───
  return (
    <div style={{minHeight:'100vh',background:'var(--bg)',color:'var(--text)',padding:24}}>
      <div style={{maxWidth:1200,margin:'0 auto'}}>
        {/* Header */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24}}>
          <h1 style={{fontSize:24,fontWeight:700}}>Админ-панель</h1>
          <div style={{display:'flex',gap:8}}>
            <button onClick={() => exportJSON('speakers.json', scholars)} style={{padding:'8px 16px',borderRadius:8,border:'1px solid var(--border)',background:'transparent',color:'var(--text2)',fontSize:13,cursor:'pointer'}}>📥 speakers.json</button>
            <button onClick={() => exportJSON('audio.json', lectures)} style={{padding:'8px 16px',borderRadius:8,border:'1px solid var(--border)',background:'transparent',color:'var(--text2)',fontSize:13,cursor:'pointer'}}>📥 audio.json</button>
            <button onClick={() => exportJSON('series.json', series)} style={{padding:'8px 16px',borderRadius:8,border:'1px solid var(--border)',background:'transparent',color:'var(--text2)',fontSize:13,cursor:'pointer'}}>📥 series.json</button>
            <button onClick={handleLogout} style={{padding:'8px 16px',borderRadius:8,border:'1px solid var(--border)',background:'transparent',color:'var(--text2)',fontSize:13,cursor:'pointer'}}>Выйти</button>
          </div>
        </div>

        {/* Search */}
        <input type="text" placeholder="Поиск..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          style={{width:'100%',maxWidth:400,padding:'10px 14px',borderRadius:8,border:'1px solid var(--border)',background:'var(--bg3)',color:'var(--text)',marginBottom:16,fontSize:14}} />

        {/* Batch Speaker/Series Select */}
        <div style={{display:'flex',gap:12,marginBottom:16}}>
          <select value={batchSpeakerId} onChange={e => setBatchSpeakerId(e.target.value)}
            style={{padding:'8px 12px',borderRadius:8,border:'1px solid var(--border)',background:'var(--bg3)',color:'var(--text)',fontSize:13}}>
            <option value="">Все учёные (по умолчанию)</option>
            {scholars.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select value={batchSeriesId} onChange={e => setBatchSeriesId(e.target.value)}
            style={{padding:'8px 12px',borderRadius:8,border:'1px solid var(--border)',background:'var(--bg3)',color:'var(--text)',fontSize:13}}>
            <option value="">Без серии</option>
            {series.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        {/* Upload Button */}
        <div style={{marginBottom:24}}>
          <input ref={fileInputRef} type="file" accept="audio/*,.mp3,.m4a,.ogg,.wav" multiple onChange={handleFileSelect} style={{display:'none'}} />
          <button onClick={() => fileInputRef.current?.click()} disabled={isProcessing}
            style={{padding:'12px 24px',borderRadius:8,background:isProcessing ? 'var(--bg5)' : 'linear-gradient(135deg,#1b4332,#2d6a4f)',color:'#fff',fontSize:14,fontWeight:600,border:'none',cursor:isProcessing ? 'default' : 'pointer',display:'flex',alignItems:'center',gap:8}}>
            {isProcessing ? '⏳ Обработка...' : '📁 Добавить аудио с компьютера'}
          </button>
          {uploadHint && <div style={{marginTop:8,fontSize:12,color:'var(--accent)'}}>{uploadHint}</div>}
          <div style={{marginTop:8,fontSize:12,color:'var(--text3)'}}>Поддержка: MP3, M4A, OGG, WAV · Можно выбрать несколько файлов</div>
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

        {/* ─── DRAFTS (Batch Upload) ─── */}
        {drafts.length > 0 && (
          <div style={{marginBottom:24,padding:20,background:'var(--bg3)',border:'2px solid var(--accent)',borderRadius:12}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:16}}>
              <h2 style={{fontSize:18,fontWeight:600}}>Черновики ({drafts.length})</h2>
              <div style={{display:'flex',gap:8}}>
                <button onClick={saveAllDrafts} style={{padding:'8px 16px',borderRadius:8,background:'var(--accent)',color:'#fff',fontSize:13,fontWeight:600,border:'none',cursor:'pointer'}}>
                  💾 Сохранить все
                </button>
                <button onClick={() => setDrafts([])} style={{padding:'8px 16px',borderRadius:8,border:'1px solid var(--border)',background:'transparent',color:'var(--text2)',fontSize:13,cursor:'pointer'}}>
                  Очистить
                </button>
              </div>
            </div>

            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              {drafts.map((draft, i) => (
                <div key={i} style={{padding:16,background:'var(--bg4)',border:'1px solid var(--border)',borderRadius:10}}>
                  <div style={{display:'grid',gridTemplateColumns:'60px 1fr 1fr 1fr 80px',gap:12,alignItems:'center'}}>
                    {/* Number */}
                    <input type="number" value={draft.lessonNumber} onChange={e => updateDraft(i, { lessonNumber: parseInt(e.target.value) || 0 })}
                      style={{padding:'6px 8px',borderRadius:6,border:'1px solid var(--border)',background:'var(--bg5)',color:'var(--text)',fontSize:13,width:'100%'}} />

                    {/* Title */}
                    <input value={draft.title} onChange={e => updateDraft(i, { title: e.target.value })}
                      style={{padding:'6px 10px',borderRadius:6,border:'1px solid var(--border)',background:'var(--bg5)',color:'var(--text)',fontSize:13}} />

                    {/* Speaker */}
                    <select value={draft.scholarId} onChange={e => {
                      const s = scholars.find(s => s.id === e.target.value)
                      updateDraft(i, { scholarId: e.target.value, scholar: s?.name || '' })
                    }}
                      style={{padding:'6px 10px',borderRadius:6,border:'1px solid var(--border)',background:'var(--bg5)',color:'var(--text)',fontSize:13}}>
                      <option value="">Без учёного</option>
                      {scholars.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>

                    {/* Series */}
                    <select value={draft.seriesId} onChange={e => updateDraft(i, { seriesId: e.target.value })}
                      style={{padding:'6px 10px',borderRadius:6,border:'1px solid var(--border)',background:'var(--bg5)',color:'var(--text)',fontSize:13}}>
                      <option value="">Без серии</option>
                      {series.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>

                    {/* Remove */}
                    <button onClick={() => removeDraft(i)} style={{padding:'6px',borderRadius:6,border:'1px solid rgba(239,68,68,0.3)',background:'transparent',color:'#ef4444',fontSize:12,cursor:'pointer'}}>✕</button>
                  </div>

                  {/* Info row */}
                  <div style={{display:'flex',gap:16,marginTop:8,fontSize:11,color:'var(--text3)'}}>
                    <span>📁 {draft.file.name}</span>
                    <span>📏 {formatFileSize(draft.size)}</span>
                    <span>⏱ {draft.duration}</span>
                    <span>🎵 {draft.fileType.toUpperCase()}</span>
                    {draft.coverImage && <span>🖼 Есть обложка</span>}
                  </div>

                  {/* Cover preview */}
                  {draft.coverImage && (
                    <div style={{marginTop:8}}>
                      <img src={draft.coverImage} alt="Cover" style={{width:48,height:48,borderRadius:6,objectFit:'cover'}} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── LECTURES TAB ─── */}
        {activeTab === 'lectures' && (
          <div>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:16}}>
              <h2 style={{fontSize:18,fontWeight:600}}>Лекции</h2>
              <button onClick={() => setEditingLecture({title:'',scholar:'',duration:'0:00',icon:'📚',categoryId:'lectures',src:'',tags:[]})}
                style={{padding:'8px 16px',borderRadius:8,background:'var(--accent)',color:'#fff',fontSize:13,fontWeight:600,border:'none',cursor:'pointer'}}>
                + Вручную
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
                  <input placeholder="Длительность" value={editingLecture.duration || ''} onChange={e => setEditingLecture({...editingLecture, duration: e.target.value})}
                    style={{padding:'8px 12px',borderRadius:8,border:'1px solid var(--border)',background:'var(--bg4)',color:'var(--text)',fontSize:13}} />
                  <input placeholder="Номер урока" type="number" value={editingLecture.lessonNumber || ''} onChange={e => setEditingLecture({...editingLecture, lessonNumber: parseInt(e.target.value) || 0})}
                    style={{padding:'8px 12px',borderRadius:8,border:'1px solid var(--border)',background:'var(--bg4)',color:'var(--text)',fontSize:13}} />
                </div>
                <div style={{display:'flex',gap:8,marginTop:12}}>
                  <button onClick={saveLecture} style={{padding:'8px 16px',borderRadius:8,background:'var(--accent)',color:'#fff',fontSize:13,fontWeight:600,border:'none',cursor:'pointer'}}>Сохранить</button>
                  <button onClick={() => setEditingLecture(null)} style={{padding:'8px 16px',borderRadius:8,border:'1px solid var(--border)',background:'transparent',color:'var(--text2)',fontSize:13,cursor:'pointer'}}>Отмена</button>
                </div>
              </div>
            )}

            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {filteredLectures.map(l => (
                <div key={l.id} style={{display:'flex',alignItems:'center',gap:12,padding:12,background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:10}}>
                  {l.coverImage ? (
                    <img src={l.coverImage} alt="" style={{width:40,height:40,borderRadius:6,objectFit:'cover',flexShrink:0}} />
                  ) : (
                    <div style={{width:40,height:40,borderRadius:8,background:'var(--bg5)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>{l.icon}</div>
                  )}
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:14,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                      {l.lessonNumber ? `${l.lessonNumber}. ` : ''}{l.title}
                    </div>
                    <div style={{fontSize:12,color:'var(--text3)'}}>
                      {l.scholar || 'Без учёного'} · {l.duration}
                      {l.seriesId ? ` · ${series.find(s=>s.id===l.seriesId)?.name || ''}` : ''}
                    </div>
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
                + Добавить
              </button>
            </div>
            {editingScholar && (
              <div style={{background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:12,padding:20,marginBottom:16}}>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                  <input placeholder="Имя *" value={editingScholar.name || ''} onChange={e => setEditingScholar({...editingScholar, name: e.target.value})}
                    style={{padding:'8px 12px',borderRadius:8,border:'1px solid var(--border)',background:'var(--bg4)',color:'var(--text)',fontSize:13}} />
                  <input placeholder="Имя (араб.)" value={editingScholar.nameAr || ''} onChange={e => setEditingScholar({...editingScholar, nameAr: e.target.value})}
                    style={{padding:'8px 12px',borderRadius:8,border:'1px solid var(--border)',background:'var(--bg4)',color:'var(--text)',fontSize:13}} />
                  <select value={editingScholar.role || 'Учёный'} onChange={e => setEditingScholar({...editingScholar, role: e.target.value})}
                    style={{padding:'8px 12px',borderRadius:8,border:'1px solid var(--border)',background:'var(--bg4)',color:'var(--text)',fontSize:13}}>
                    <option>Учёный</option><option>Лектор</option><option>Чтец</option>
                  </select>
                  <input placeholder="URL фото" value={editingScholar.imageUrl || ''} onChange={e => setEditingScholar({...editingScholar, imageUrl: e.target.value})}
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
                      <div style={{fontSize:12,color:'var(--text3)'}}>{s.role}</div>
                    </div>
                  </div>
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
                + Добавить
              </button>
            </div>
            {editingSeries && (
              <div style={{background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:12,padding:20,marginBottom:16}}>
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
                  <div style={{fontSize:11,color:'var(--text3)'}}>Уроков: {lectures.filter(l => l.seriesId === s.id).length}</div>
                  <div style={{display:'flex',gap:8,marginTop:8}}>
                    <button onClick={() => setEditingSeries(s)} style={{padding:'6px 12px',borderRadius:6,border:'1px solid var(--border)',background:'transparent',color:'var(--text2)',fontSize:12,cursor:'pointer'}}>Изменить</button>
                    <button onClick={() => deleteSeriesItem(s.id)} style={{padding:'6px 12px',borderRadius:6,border:'1px solid rgba(239,68,68,0.3)',background:'transparent',color:'#ef4444',fontSize:12,cursor:'pointer'}}>Удалить</button>
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

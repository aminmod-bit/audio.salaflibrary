import { useState, useEffect, useRef, useCallback } from 'react'
import { storage } from '../lib/storage'

interface AdminLecture {
  id: number
  title: string
  scholar: string
  scholarId?: string
  duration: string
  icon: string
  categoryId: string
  src: string
  cover?: string
  tags?: string[]
}

interface AdminScholar {
  id: string
  name: string
  nameAr: string
  role: string
  description: string
  imageUrl: string
  lessonsCount: number
  tags: string[]
}

interface UploadFile {
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'done' | 'error'
  error?: string
  metadata?: Partial<AdminLecture>
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [activeTab, setActiveTab] = useState<'lectures' | 'scholars' | 'upload'>('lectures')
  const [lectures, setLectures] = useState<AdminLecture[]>([])
  const [scholars, setScholars] = useState<AdminScholar[]>([])
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([])
  const [editingLecture, setEditingLecture] = useState<AdminLecture | null>(null)
  const [editingScholar, setEditingScholar] = useState<AdminScholar | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    storage.isAuthenticated().then(auth => setAuthenticated(auth))
  }, [])

  useEffect(() => {
    if (authenticated) {
      storage.getLectures().then(setLectures)
      storage.getScholars().then(setScholars)
    }
  }, [authenticated])

  const handleLogin = async () => {
    const success = await storage.login(username, password)
    if (success) {
      setAuthenticated(true)
      localStorage.setItem('salaf-admin-auth', 'true')
    } else {
      setLoginError('Неверный логин или пароль')
    }
  }

  const handleLogout = async () => {
    await storage.logout()
    setAuthenticated(false)
  }

  // Batch upload
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const newUploads: UploadFile[] = files.map(file => ({
      file,
      progress: 0,
      status: 'pending' as const,
      metadata: {
        title: file.name.replace(/\.[^/.]+$/, ''),
        scholar: 'Неизвестный',
        duration: '0:00',
        icon: '📚',
        categoryId: 'lectures',
        src: '',
      }
    }))
    setUploadFiles(prev => [...prev, ...newUploads])
  }

  const processUpload = useCallback(async () => {
    setIsUploading(true)
    const pending = uploadFiles.filter(f => f.status === 'pending')

    for (let i = 0; i < pending.length; i++) {
      const upload = pending[i]
      setUploadFiles(prev => prev.map(f =>
        f.file === upload.file ? { ...f, status: 'uploading', progress: 0 } : f
      ))

      try {
        // Simulate progress
        for (let p = 0; p <= 100; p += 10) {
          await new Promise(r => setTimeout(r, 50))
          setUploadFiles(prev => prev.map(f =>
            f.file === upload.file ? { ...f, progress: p } : f
          ))
        }

        const result = await storage.uploadAudio(upload.file)
        const newLecture: AdminLecture = {
          id: Date.now() + i,
          title: upload.metadata?.title || upload.file.name,
          scholar: upload.metadata?.scholar || 'Неизвестный',
          duration: upload.metadata?.duration || '0:00',
          icon: '📚',
          categoryId: upload.metadata?.categoryId || 'lectures',
          src: result.url,
          tags: upload.metadata?.tags || [],
        }
        await storage.addLecture(newLecture)

        setUploadFiles(prev => prev.map(f =>
          f.file === upload.file ? { ...f, status: 'done', progress: 100 } : f
        ))
      } catch (err) {
        setUploadFiles(prev => prev.map(f =>
          f.file === upload.file ? { ...f, status: 'error', error: String(err) } : f
        ))
      }
    }

    // Refresh lectures list
    const updated = await storage.getLectures()
    setLectures(updated)
    setIsUploading(false)
  }, [uploadFiles])

  // Edit lecture
  const saveLecture = async () => {
    if (!editingLecture) return
    if (editingLecture.id) {
      await storage.updateLecture(editingLecture.id, editingLecture)
    } else {
      await storage.addLecture({ ...editingLecture, id: Date.now() })
    }
    setLectures(await storage.getLectures())
    setEditingLecture(null)
  }

  const deleteLecture = async (id: number) => {
    if (!confirm('Удалить лекцию?')) return
    await storage.deleteLecture(id)
    setLectures(await storage.getLectures())
  }

  // Edit scholar
  const saveScholar = async () => {
    if (!editingScholar) return
    if (editingScholar.id) {
      await storage.updateScholar(editingScholar.id, editingScholar)
    } else {
      await storage.addScholar({ ...editingScholar, id: `scholar-${Date.now()}` })
    }
    setScholars(await storage.getScholars())
    setEditingScholar(null)
  }

  const deleteScholar = async (id: string) => {
    if (!confirm('Удалить учёного?')) return
    await storage.deleteScholar(id)
    setScholars(await storage.getScholars())
  }

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

  return (
    <div style={{minHeight:'100vh',background:'var(--bg)',color:'var(--text)',padding:24}}>
      <div style={{maxWidth:1200,margin:'0 auto'}}>
        {/* Header */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24}}>
          <h1 style={{fontSize:24,fontWeight:700}}>Админ-панель Salaf Audio</h1>
          <button onClick={handleLogout} style={{padding:'8px 16px',borderRadius:8,border:'1px solid var(--border)',background:'transparent',color:'var(--text2)',cursor:'pointer',fontSize:13}}>
            Выйти
          </button>
        </div>

        {/* Tabs */}
        <div style={{display:'flex',gap:8,marginBottom:24}}>
          {(['lectures', 'scholars', 'upload'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{padding:'8px 16px',borderRadius:100,fontSize:13,fontWeight:500,border:'1px solid var(--border)',cursor:'pointer',
                background: activeTab === tab ? 'var(--accent)' : 'transparent',
                color: activeTab === tab ? '#fff' : 'var(--text2)',
                borderColor: activeTab === tab ? 'var(--accent)' : 'var(--border)'}}>
              {{lectures:'Лекции', scholars:'Учёные', upload:'Загрузка'}[tab]}
            </button>
          ))}
        </div>

        {/* Lectures Tab */}
        {activeTab === 'lectures' && (
          <div>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:16}}>
              <h2 style={{fontSize:18,fontWeight:600}}>Лекции ({lectures.length})</h2>
              <button onClick={() => setEditingLecture({id:0,title:'',scholar:'',duration:'0:00',icon:'📚',categoryId:'lectures',src:'',tags:[]})}
                style={{padding:'8px 16px',borderRadius:8,background:'var(--accent)',color:'#fff',fontSize:13,fontWeight:600,border:'none',cursor:'pointer'}}>
                + Добавить лекцию
              </button>
            </div>

            {editingLecture && (
              <div style={{background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:12,padding:20,marginBottom:16}}>
                <h3 style={{marginBottom:12,fontSize:15,fontWeight:600}}>{editingLecture.id ? 'Редактировать' : 'Новая лекция'}</h3>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                  <input placeholder="Название" value={editingLecture.title} onChange={e => setEditingLecture({...editingLecture, title: e.target.value})}
                    style={{padding:'8px 12px',borderRadius:8,border:'1px solid var(--border)',background:'var(--bg4)',color:'var(--text)',fontSize:13}} />
                  <input placeholder="Шейх/Учёный" value={editingLecture.scholar} onChange={e => setEditingLecture({...editingLecture, scholar: e.target.value})}
                    style={{padding:'8px 12px',borderRadius:8,border:'1px solid var(--border)',background:'var(--bg4)',color:'var(--text)',fontSize:13}} />
                  <input placeholder="URL аудио" value={editingLecture.src} onChange={e => setEditingLecture({...editingLecture, src: e.target.value})}
                    style={{padding:'8px 12px',borderRadius:8,border:'1px solid var(--border)',background:'var(--bg4)',color:'var(--text)',fontSize:13}} />
                  <input placeholder="Теги (через запятую)" value={editingLecture.tags?.join(', ') || ''} onChange={e => setEditingLecture({...editingLecture, tags: e.target.value.split(',').map(s=>s.trim())})}
                    style={{padding:'8px 12px',borderRadius:8,border:'1px solid var(--border)',background:'var(--bg4)',color:'var(--text)',fontSize:13}} />
                </div>
                <div style={{display:'flex',gap:8,marginTop:12}}>
                  <button onClick={saveLecture} style={{padding:'8px 16px',borderRadius:8,background:'var(--accent)',color:'#fff',fontSize:13,fontWeight:600,border:'none',cursor:'pointer'}}>Сохранить</button>
                  <button onClick={() => setEditingLecture(null)} style={{padding:'8px 16px',borderRadius:8,border:'1px solid var(--border)',background:'transparent',color:'var(--text2)',fontSize:13,cursor:'pointer'}}>Отмена</button>
                </div>
              </div>
            )}

            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {lectures.map(l => (
                <div key={l.id} style={{display:'flex',alignItems:'center',gap:12,padding:12,background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:10}}>
                  <div style={{width:40,height:40,borderRadius:8,background:'var(--bg5)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>{l.icon}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:14,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{l.title}</div>
                    <div style={{fontSize:12,color:'var(--text3)'}}>{l.scholar} · {l.duration}</div>
                  </div>
                  <button onClick={() => setEditingLecture(l)} style={{padding:'6px 12px',borderRadius:6,border:'1px solid var(--border)',background:'transparent',color:'var(--text2)',fontSize:12,cursor:'pointer'}}>Изменить</button>
                  <button onClick={() => deleteLecture(l.id)} style={{padding:'6px 12px',borderRadius:6,border:'1px solid rgba(239,68,68,0.3)',background:'transparent',color:'#ef4444',fontSize:12,cursor:'pointer'}}>Удалить</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Scholars Tab */}
        {activeTab === 'scholars' && (
          <div>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:16}}>
              <h2 style={{fontSize:18,fontWeight:600}}>Учёные ({scholars.length})</h2>
              <button onClick={() => setEditingScholar({id:'',name:'',nameAr:'',role:'Учёный',description:'',imageUrl:'',lessonsCount:0,tags:[]})}
                style={{padding:'8px 16px',borderRadius:8,background:'var(--accent)',color:'#fff',fontSize:13,fontWeight:600,border:'none',cursor:'pointer'}}>
                + Добавить учёного
              </button>
            </div>

            {editingScholar && (
              <div style={{background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:12,padding:20,marginBottom:16}}>
                <h3 style={{marginBottom:12,fontSize:15,fontWeight:600}}>{editingScholar.id ? 'Редактировать' : 'Новый учёный'}</h3>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                  <input placeholder="Имя" value={editingScholar.name} onChange={e => setEditingScholar({...editingScholar, name: e.target.value})}
                    style={{padding:'8px 12px',borderRadius:8,border:'1px solid var(--border)',background:'var(--bg4)',color:'var(--text)',fontSize:13}} />
                  <input placeholder="Имя (араб.)" value={editingScholar.nameAr} onChange={e => setEditingScholar({...editingScholar, nameAr: e.target.value})}
                    style={{padding:'8px 12px',borderRadius:8,border:'1px solid var(--border)',background:'var(--bg4)',color:'var(--text)',fontSize:13}} />
                  <select value={editingScholar.role} onChange={e => setEditingScholar({...editingScholar, role: e.target.value})}
                    style={{padding:'8px 12px',borderRadius:8,border:'1px solid var(--border)',background:'var(--bg4)',color:'var(--text)',fontSize:13}}>
                    <option>Учёный</option>
                    <option>Лектор</option>
                    <option>Чтец</option>
                  </select>
                  <input placeholder="URL фото (оставьте пустым для инициалов)" value={editingScholar.imageUrl} onChange={e => setEditingScholar({...editingScholar, imageUrl: e.target.value})}
                    style={{padding:'8px 12px',borderRadius:8,border:'1px solid var(--border)',background:'var(--bg4)',color:'var(--text)',fontSize:13}} />
                </div>
                <textarea placeholder="Описание" value={editingScholar.description} onChange={e => setEditingScholar({...editingScholar, description: e.target.value})}
                  style={{width:'100%',marginTop:12,padding:'8px 12px',borderRadius:8,border:'1px solid var(--border)',background:'var(--bg4)',color:'var(--text)',fontSize:13,minHeight:80,resize:'vertical'}} />
                <div style={{display:'flex',gap:8,marginTop:12}}>
                  <button onClick={saveScholar} style={{padding:'8px 16px',borderRadius:8,background:'var(--accent)',color:'#fff',fontSize:13,fontWeight:600,border:'none',cursor:'pointer'}}>Сохранить</button>
                  <button onClick={() => setEditingScholar(null)} style={{padding:'8px 16px',borderRadius:8,border:'1px solid var(--border)',background:'transparent',color:'var(--text2)',fontSize:13,cursor:'pointer'}}>Отмена</button>
                </div>
              </div>
            )}

            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:12}}>
              {scholars.map(s => (
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
                  <div style={{fontSize:12,color:'var(--text3)',marginBottom:8,lineHeight:1.4}}>{s.description.slice(0,100)}...</div>
                  <div style={{display:'flex',gap:8}}>
                    <button onClick={() => setEditingScholar(s)} style={{padding:'6px 12px',borderRadius:6,border:'1px solid var(--border)',background:'transparent',color:'var(--text2)',fontSize:12,cursor:'pointer'}}>Изменить</button>
                    <button onClick={() => deleteScholar(s.id)} style={{padding:'6px 12px',borderRadius:6,border:'1px solid rgba(239,68,68,0.3)',background:'transparent',color:'#ef4444',fontSize:12,cursor:'pointer'}}>Удалить</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div>
            <h2 style={{fontSize:18,fontWeight:600,marginBottom:16}}>Массовая загрузка аудио</h2>

            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={e => { e.preventDefault(); const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('audio/')); if (files.length) { const input = fileInputRef.current!; const dt = new DataTransfer(); files.forEach(f => dt.items.add(f)); input.files = dt.files; handleFileSelect({target: {files: dt.files}} as any) } }}
              onDragOver={e => e.preventDefault()}
              style={{border:'2px dashed var(--border)',borderRadius:12,padding:40,textAlign:'center',cursor:'pointer',marginBottom:24,transition:'border-color .2s'}}
            >
              <div style={{fontSize:32,marginBottom:8}}>📁</div>
              <div style={{fontSize:14,fontWeight:600,marginBottom:4}}>Перетащите аудио-файлы сюда</div>
              <div style={{fontSize:12,color:'var(--text3)'}}>или нажмите для выбора · MP3, WAV, OGG · до 100 файлов за раз</div>
              <input ref={fileInputRef} type="file" multiple accept="audio/*" onChange={handleFileSelect} style={{display:'none'}} />
            </div>

            {uploadFiles.length > 0 && (
              <div>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                  <span style={{fontSize:14,fontWeight:600}}>Файлов: {uploadFiles.length}</span>
                  <button onClick={processUpload} disabled={isUploading}
                    style={{padding:'8px 16px',borderRadius:8,background:isUploading ? 'var(--bg5)' : 'var(--accent)',color:'#fff',fontSize:13,fontWeight:600,border:'none',cursor:isUploading ? 'default' : 'pointer'}}>
                    {isUploading ? 'Загрузка...' : 'Начать загрузку'}
                  </button>
                </div>

                <div style={{display:'flex',flexDirection:'column',gap:8}}>
                  {uploadFiles.map((uf, i) => (
                    <div key={i} style={{padding:12,background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:10}}>
                      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:8}}>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:13,fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{uf.file.name}</div>
                          <div style={{fontSize:11,color:'var(--text3)'}}>{(uf.file.size / 1024 / 1024).toFixed(1)} MB</div>
                        </div>
                        <div style={{fontSize:11,fontWeight:600,color:uf.status==='done'?'#22c55e':uf.status==='error'?'#ef4444':'var(--text3)'}}>
                          {{pending:'Ожидает',uploading:'Загрузка',done:'Готово',error:'Ошибка'}[uf.status]}
                        </div>
                      </div>
                      {uf.status === 'uploading' && (
                        <div style={{height:4,background:'var(--bg5)',borderRadius:2,overflow:'hidden'}}>
                          <div style={{height:'100%',width:`${uf.progress}%`,background:'var(--accent)',transition:'width .1s'}} />
                        </div>
                      )}
                      {/* Metadata edit */}
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginTop:8}}>
                        <input placeholder="Название" value={uf.metadata?.title || ''} onChange={e => {
                          const meta = {...(uf.metadata || {}), title: e.target.value}
                          setUploadFiles(prev => prev.map((f,j) => j===i ? {...f, metadata: meta} : f))
                        }} style={{padding:'6px 10px',borderRadius:6,border:'1px solid var(--border)',background:'var(--bg4)',color:'var(--text)',fontSize:12}} />
                        <input placeholder="Шейх/Учёный" value={uf.metadata?.scholar || ''} onChange={e => {
                          const meta = {...(uf.metadata || {}), scholar: e.target.value}
                          setUploadFiles(prev => prev.map((f,j) => j===i ? {...f, metadata: meta} : f))
                        }} style={{padding:'6px 10px',borderRadius:6,border:'1px solid var(--border)',background:'var(--bg4)',color:'var(--text)',fontSize:12}} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

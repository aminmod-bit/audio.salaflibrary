import { useState, useRef, useEffect, useCallback } from 'react'
import { categories, audioData } from './data'
import type { AudioTrack, Category, Speaker } from './data'
import TiltSpotlightCard from './components/effects/TiltSpotlightCard'
import CursorGlow from './components/effects/CursorGlow'
import NatureBackground from './components/effects/NatureBackground'
import { t, type Lang } from './i18n'
import './App.css'

/* ─── SVG Icons ─── */
const Ico = {
  home: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  search: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  library: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>,
  sparkles: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>,
  headphones: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/></svg>,
  user: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  heart: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>,
  heartFill: <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>,
  play: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.14v14l11-7-11-7z"/></svg>,
  pause: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>,
  prev: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>,
  next: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>,
  shuffle: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22"/><path d="m18 2 4 4-4 4"/><path d="M2 6h1.9c1.5 0 2.9.9 3.6 2.2"/><path d="M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8"/><path d="m18 14 4 4-4 4"/></svg>,
  repeat: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></svg>,
  vol: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>,
  volMute: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M23 9l-6 6M17 9l6 6"/></svg>,
  expand: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="m21 3-7 7"/><path d="m3 21 7-7"/></svg>,
  close: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>,
  chevDown: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>,
  chevRight: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>,
  list: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15V6"/><path d="M18.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"/><path d="M12 12V3"/><path d="M9.5 15a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"/><path d="M3 9V0"/><path d="M.5 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"/></svg>,
  radio: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"/><circle cx="12" cy="12" r="2"/><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"/><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"/></svg>,
  download: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>,
  share: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></svg>,
  dots: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>,
  grip: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>,
  plus: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>,
  mic: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>,
  logout: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>,
  trash: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>,
  eq: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="4" y1="21" y2="14"/><line x1="4" x2="4" y1="10" y2="3"/><line x1="12" x2="12" y1="21" y2="12"/><line x1="12" x2="12" y1="8" y2="3"/><line x1="20" x2="20" y1="21" y2="16"/><line x1="20" x2="20" y1="12" y2="3"/><line x1="2" x2="6" y1="14" y2="14"/><line x1="10" x2="14" y1="8" y2="8"/><line x1="18" x2="22" y1="16" y2="16"/></svg>,
  back: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>,
  upload: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>,
  link: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  monitor: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>,
  mail: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>,
  refresh: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>,
  clock: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  music: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>,
}

/* ─── Helpers ─── */
function parseDur(d: string): number {
  const p = d.split(':').map(Number)
  return p.length === 3 ? p[0]*3600+p[1]*60+p[2] : p[0]*60+p[1]
}
function fmtTime(s: number): string {
  const h = Math.floor(s/3600), m = Math.floor((s%3600)/60), sec = Math.floor(s%60)
  return h > 0 ? `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}` : `${m}:${String(sec).padStart(2,'0')}`
}
function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 6) return 'Доброй ночи'
  if (h < 12) return 'Доброе утро'
  if (h < 18) return 'Добрый день'
  return 'Добрый вечер'
}

function getInitials(name: string): string {
  return name.replace(/^Шейх\s+/, '').split(' ').map(w => w[0]).join('').slice(0, 2)
}

function getSpeakerGradient(id: string): string {
  const gradients: Record<string, string> = {
    'ibn-uthaymeen': 'linear-gradient(135deg, #1b4332, #2d6a4f)',
    'ibn-baz': 'linear-gradient(135deg, #3c096c, #7b2cbf)',
    'al-albani': 'linear-gradient(135deg, #bc6c25, #606c38)',
    'al-fawzan': 'linear-gradient(135deg, #1b4332, #40916c)',
    'al-munajjid': 'linear-gradient(135deg, #7c5cfc, #a78bfa)',
    'al-fuleij': 'linear-gradient(135deg, #2d6a4f, #52b788)',
    'al-badr': 'linear-gradient(135deg, #5a189a, #9d4edd)',
    'ar-ruhaili': 'linear-gradient(135deg, #b5179e, #f72585)',
    'al-khamis': 'linear-gradient(135deg, #023e8a, #0077b6)',
    'al-abbad': 'linear-gradient(135deg, #d4af37, #c9a84c)',
  }
  return gradients[id] || 'linear-gradient(135deg, #333, #555)'
}

type Page = 'home' | 'search' | 'library' | 'category' | 'profile' | 'favorites' | 'ai-playlist' | 'rooms' | 'daily-playlist' | 'speakers' | 'speaker'

/* ─── App ─── */
export default function App() {
  const [page, setPage] = useState<Page>('home')
  const [activeCategory, setActiveCategory] = useState<Category | null>(null)
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(0.75)
  const [muted, setMuted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [queueOpen, setQueueOpen] = useState(false)
  const [queue, setQueue] = useState<AudioTrack[]>([])
  const [nowPlaying, setNowPlaying] = useState(false)
  const [liked, setLiked] = useState<Set<string | number>>(new Set())
  const [libTab, setLibTab] = useState<'playlists'|'albums'|'artists'|'downloaded'>('playlists')
  const [npView, setNpView] = useState<'main'|'lyrics'|'eq'>('main')
  const [ctxMenu, setCtxMenu] = useState<{x:number;y:number}|null>(null)
  const [eqPreset, setEqPreset] = useState('Без обработки')
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiTrackCount, setAiTrackCount] = useState(20)
  const [waveSettingsOpen, setWaveSettingsOpen] = useState(false)
  const [waveMood, setWaveMood] = useState('Без настроения')
  const [themeOpen, setThemeOpen] = useState(false)
  const [currentTheme, setCurrentTheme] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('salaf-theme') || 'dark-green'
    return 'dark-green'
  })
  const [lang, setLang] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('salaf-lang') || 'ru'
    return 'ru'
  })
  const [selectedDailyPlaylist, setSelectedDailyPlaylist] = useState<number | null>(null)
  const [speakers, setSpeakers] = useState<Speaker[]>([])
  const [selectedSpeaker, setSelectedSpeaker] = useState<Speaker | null>(null)
  const [speakerSearch, setSpeakerSearch] = useState('')
  const [speakerRoleFilter, setSpeakerRoleFilter] = useState<string>('all')
  const scrollRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  /* Theme & Language */
  const setTheme = (t: string) => {
    setCurrentTheme(t)
    document.documentElement.setAttribute('data-theme', t)
    localStorage.setItem('salaf-theme', t)
  }

  const setLangHandler = (l: string) => {
    setLang(l)
    localStorage.setItem('salaf-lang', l)
  }

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme)
  }, [currentTheme])

  useEffect(() => {
    fetch('/data/speakers.json').then(r => r.json()).then((data: Speaker[]) => setSpeakers(data)).catch(() => {})
  }, [])

  const trackBg = (t: AudioTrack) => categories.find(c => c.id === t.categoryId)?.gradient || 'linear-gradient(135deg,#333,#555)'
  const catBg = (c: Category) => c.gradient

  const dailyPlaylists = [
    { name:'Знакомое', desc:'Любимые артисты и близкие к ним новинки', icon:'📖', gradient: catBg(categories[0]), tracks: audioData.slice(0,8) },
    { name:'Открытия', desc:'То, что ты ещё не слышал, но точно зайдёт', icon:'📝', gradient: catBg(categories[1]), tracks: audioData.slice(10,18) },
    { name:'Под настроение', desc:'Подобрано под твой обычный вайб', icon:'🎶', gradient: catBg(categories[2]), tracks: audioData.slice(0,3) },
  ]

  const goto = (p: Page) => { setPage(p); setNowPlaying(false); scrollRef.current?.scrollTo(0,0) }
  const T = (key: string) => t(lang as Lang, key)

  const filteredTracks = searchQuery.trim()
    ? audioData.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.author.toLowerCase().includes(searchQuery.toLowerCase()))
    : audioData

  const toggleLike = (id: string | number) => setLiked(prev => { const n = new Set(prev); if (n.has(id)) { n.delete(id) } else { n.add(id) }; return n })

  /* ─── Playback ─── */
  const playTrack = useCallback((track: AudioTrack, list?: AudioTrack[]) => {
    if (currentTrack?.id === track.id) {
      // Toggle play/pause
      if (audioRef.current) {
        if (audioRef.current.paused) { audioRef.current.play(); setIsPlaying(true) }
        else { audioRef.current.pause(); setIsPlaying(false) }
      }
      return
    }
    setCurrentTrack(track); setIsPlaying(true); setProgress(0); setCurrentTime(0)
    const tracks = list || filteredTracks
    const idx = tracks.findIndex(t => t.id === track.id)
    if (idx >= 0) setQueue(tracks.slice(idx))
    // Load and play audio
    if (audioRef.current) {
      audioRef.current.src = track.src
      audioRef.current.load()
      audioRef.current.play().catch(() => {})
    }
  }, [currentTrack, filteredTracks])

  const playNext = useCallback(() => {
    if (!currentTrack || queue.length === 0) return
    const idx = queue.findIndex(t => t.id === currentTrack.id)
    if (idx < queue.length - 1) {
      const n = queue[idx+1]; setCurrentTrack(n); setIsPlaying(true); setProgress(0); setCurrentTime(0)
      if (audioRef.current) { audioRef.current.src = n.src; audioRef.current.load(); audioRef.current.play().catch(() => {}) }
    }
  }, [currentTrack, queue])

  const playPrev = useCallback(() => {
    if (!currentTrack || queue.length === 0) return
    const idx = queue.findIndex(t => t.id === currentTrack.id)
    if (idx > 0) {
      const p = queue[idx-1]; setCurrentTrack(p); setIsPlaying(true); setProgress(0); setCurrentTime(0)
      if (audioRef.current) { audioRef.current.src = p.src; audioRef.current.load(); audioRef.current.play().catch(() => {}) }
    }
  }, [currentTrack, queue])

  /* ─── Audio sync ─── */
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onTimeUpdate = () => {
      if (audio.duration) {
        setProgress(audio.currentTime / audio.duration)
        setCurrentTime(audio.currentTime)
      }
    }
    const onEnded = () => playNext()
    const onLoadedMetadata = () => {
      if (currentTrack && audio.duration) {
        // Update duration display
      }
    }
    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('loadedmetadata', onLoadedMetadata)
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('loadedmetadata', onLoadedMetadata)
    }
  }, [currentTrack, playNext])

  /* ─── Play/Pause sync ─── */
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentTrack) return
    if (isPlaying) { audio.play().catch(() => {}) }
    else { audio.pause() }
  }, [isPlaying, currentTrack])

  const [dragging, setDragging] = useState<'progress' | 'volume' | null>(null)
  const [shuffled, setShuffled] = useState(false)
  const [repeated, setRepeated] = useState(false)

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!currentTrack) return
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = (e.clientX - rect.left) / rect.width
    const total = parseDur(currentTrack.duration)
    setCurrentTime(pct * total); setProgress(pct)
  }

  const handleVolClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    setVolume(pct); if (pct > 0) setMuted(false)
  }

  const handleDragStart = (type: 'progress' | 'volume') => (e: React.MouseEvent) => {
    e.preventDefault()
    setDragging(type)
  }

  useEffect(() => {
    if (!dragging) return
    const onMove = (e: MouseEvent) => {
      if (dragging === 'progress' && currentTrack) {
        const bar = document.querySelector('.player-progress-bar, .np-progress-bar')
        if (!bar) return
        const rect = bar.getBoundingClientRect()
        const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
        const total = parseDur(currentTrack.duration)
        setCurrentTime(pct * total); setProgress(pct)
      } else if (dragging === 'volume') {
        const bar = document.querySelector('.player-vol-bar, .np-volume-bar')
        if (!bar) return
        const rect = bar.getBoundingClientRect()
        const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
        setVolume(pct); if (pct > 0) setMuted(false)
      }
    }
    const onUp = () => setDragging(null)
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    return () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp) }
  }, [dragging, currentTrack])

  /* ─── Close context menu on click outside ─── */
  useEffect(() => {
    if (ctxMenu) {
      const close = () => setCtxMenu(null)
      window.addEventListener('click', close)
      return () => window.removeEventListener('click', close)
    }
  }, [ctxMenu])

  /* ─── EQ presets ─── */
  const eqPresets = ['Без обработки','Бас-буст','Минус бас','Плюс высокие','Вокал','Громкость','Мягко','Рок','Поп','Хип-хоп','Электроника','Танцы','Джаз','Акустика','Классика','Кино']
  const eqFreqs = ['31','62','125','250','500','1k','2k','4k','8k','16k']

  /* ─── Remove from queue ─── */
  const removeFromQueue = (id: number) => setQueue(q => q.filter(t => t.id !== id))

  return (
    <div className="app">
      <audio ref={audioRef} preload="auto" />
      <CursorGlow />
      {currentTheme === 'nature' && <NatureBackground />}
      {/* ─── Sidebar ─── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="dot" /> SALAF LIBRARY
          <button className="theme-toggle-btn" onClick={() => setThemeOpen(!themeOpen)} title="Сменить тему">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Z" fill="none"/><path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7Z"/><circle cx="9" cy="11" r="1" fill="currentColor"/><circle cx="12" cy="8" r="1" fill="currentColor"/><circle cx="15" cy="11" r="1" fill="currentColor"/></svg>
          </button>
        </div>
        {themeOpen && (
          <div className="theme-dropdown">
            <div className="theme-dropdown-title">Внешний вид</div>
            {[
              {id:'dark-green',name:'Ночь Медины',desc:'Тёмно-зелёная классика',color:'#18181c'},
              {id:'olive',name:'Олива и песок',desc:'Тёплые оливковые тона',color:'#25281e'},
              {id:'sky-marble',name:'Небо и мрамор',desc:'Фиолетовый холодный',color:'#201e30'},
              {id:'gold-qibla',name:'Золото киблы',desc:'Тёмно-золотой',color:'#221e16'},
              {id:'rose',name:'Нежная роза',desc:'Розовый тёмный',color:'#2a1a20'},
              {id:'lilac',name:'Лиловый жемчуг',desc:'Лиловый тёмный',color:'#1e1c30'},
              {id:'ivory',name:'Слоновая кость',desc:'Светлый тёплый',color:'#f0ece4'},
              {id:'mint',name:'Кремовая мята',desc:'Светлый мячный',color:'#e8f0ec'},
              {id:'editorial',name:'Editorial',desc:'Чистый минимализм',color:'#fafafa'},
              {id:'amoled',name:'Полный чёрный',desc:'Для чтения ночью',color:'#000'},
              {id:'nature',name:'Природа',desc:'Мягкий живой фон с природной атмосферой',color:'#132619'},
            ].map(t => (
              <button key={t.id} className={`theme-dropdown-item ${currentTheme===t.id?'active':''}`} onClick={() => { setTheme(t.id); setThemeOpen(false) }}>
                <span className="theme-dropdown-swatch" style={{background:t.color,borderColor:currentTheme===t.id?'var(--accent)':'var(--border2)'}} />
                <div>
                  <div className="theme-dropdown-name">{t.name}</div>
                  <div className="theme-dropdown-desc">{t.desc}</div>
                </div>
                {currentTheme===t.id && <span className="theme-dropdown-check">✓</span>}
              </button>
            ))}
          </div>
        )}
        <nav className="sidebar-nav">
          <button className={`sidebar-nav-item ${page==='home'&&!activeCategory?'active':''}`} onClick={() => { setActiveCategory(null); goto('home') }}>{Ico.home} {T('nav_home')}</button>
          <button className={`sidebar-nav-item ${page==='search'?'active':''}`} onClick={() => goto('search')}>{Ico.search} {T('nav_search')}</button>
          <button className={`sidebar-nav-item ${page==='ai-playlist'?'active':''}`} onClick={() => goto('ai-playlist')}>{Ico.library} {T('nav_playlist')}</button>
          <button className={`sidebar-nav-item ${page==='library'?'active':''}`} onClick={() => goto('library')}>{Ico.library} {T('nav_library')}</button>
          <button className={`sidebar-nav-item ${page==='speakers'?'active':''}`} onClick={() => goto('speakers')}>{Ico.user} Лекторы</button>
          <button className={`sidebar-nav-item ${page==='profile'?'active':''}`} onClick={() => goto('profile')}>{Ico.user} {T('nav_profile')}</button>
        </nav>
        <div className="sidebar-pin">
          <div className="sidebar-pin-label">{T('pinned')}</div>
          <nav className="sidebar-nav">
            <button className={`sidebar-nav-item ${page==='favorites'?'active':''}`} onClick={() => goto('favorites')}>{Ico.heart} {T('nav_favorites')}</button>
          </nav>
        </div>

      </aside>

      {/* ─── Main ─── */}
      <div className="main-area">
        <div className="main-scroll" ref={scrollRef}>
          <div className="main-content">

            {/* ═══ HOME ═══ */}
            {page === 'home' && !activeCategory && (
              <>
                <div className="greeting"><span className="greeting-icon">✨</span> {T(`greeting_${getGreeting().includes('утро')?'morning':getGreeting().includes('день')?'afternoon':getGreeting().includes('вечер')?'evening':'night'}`)}, {T('greeting_suffix')}</div>
                <h1 className="page-title">{T('hero_title_line1')} <em>{T('hero_title_italic')}</em>,<br/>{T('hero_title_line2')}</h1>

                <TiltSpotlightCard
                  style={{background: 'linear-gradient(135deg, rgba(124,92,252,0.15), rgba(139,92,246,0.08))', marginTop: 24, borderRadius: 16, border: '1px solid rgba(139,92,246,0.2)'}}
                  maxTilt={8}
                  glowColor="rgba(168,85,247,0.3)"
                >
                  <div className="hero-card" style={{background:'transparent',border:'none',margin:0}}>
                    <div style={{position:'relative',zIndex:1}}>
                      <div className="hero-card-badge">{Ico.sparkles} {T('hero_badge')}</div>
                    <h2 className="hero-card-title">{T('hero_subtitle')} <em>{T('hero_subtitle_italic')}</em> {T('hero_subtitle_end')}</h2>
                    <p className="hero-card-desc">{T('hero_desc')}</p>
                    <div className="hero-card-actions">
                      <button className="hero-btn hero-btn-primary" onClick={() => { playTrack(audioData[0], audioData) }}>▶ {T('btn_continue')}</button>
                      <button className="hero-btn hero-btn-secondary" onClick={() => goto('search')}>🔎 {T('btn_catalog')}</button>
                      <button className="hero-btn hero-btn-secondary" onClick={() => setWaveSettingsOpen(true)}>⚙ {T('btn_configure')}</button>
                    </div>
                    <div className="hero-tracks">
                      {audioData.slice(0, 6).map(t => (
                        <div key={t.id} className={`hero-track ${currentTrack?.id===t.id?'playing':''}`} onClick={() => playTrack(t)}>
                          <div className="hero-track-icon" style={{background: trackBg(t)}}>{t.icon}</div>
                          <div>
                            <div className="hero-track-title">{t.title}</div>
                            <div className="hero-track-author">{t.author}</div>
                          </div>
                          <div className="hero-track-play">{Ico.play}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="hero-card-art"><div className="hero-card-art-inner" style={{background:'linear-gradient(135deg,var(--accent),#7b2cbf)'}}>🕌</div></div>
                  </div>
                </TiltSpotlightCard>

                {/* AI Banner */}
                <TiltSpotlightCard maxTilt={6} glowColor="rgba(139,92,246,0.2)" style={{borderRadius:14,marginBottom:40}}>
                  <div className="ai-banner glow-card" style={{margin:0,border:'none'}} onClick={() => goto('ai-playlist')}>
                    <div className="ai-banner-icon">{Ico.sparkles}</div>
                    <div>
                      <div className="ai-banner-label">Плейлист</div>
                      <div className="ai-banner-title">Опиши настроение — соберу плейлист</div>
                      <div className="ai-banner-desc">Жанры, артисты и эпохи на русском и английском за один шаг.</div>
                    </div>
                    <div className="ai-banner-right">
                      <span className="ai-banner-link">Попробовать {Ico.chevRight}</span>
                    </div>
                  </div>
                </TiltSpotlightCard>

                <div className="section-header">
                  <span className="section-badge">{Ico.list} {T('daily_badge')}</span>
                </div>
                <h3 className="section-title">{T('daily_title')}</h3>
                <p className="section-desc">{T('daily_desc')}</p>
                <div className="daily-grid">
                  {dailyPlaylists.map((pl, i) => (
                    <TiltSpotlightCard key={i} maxTilt={6} glowColor="rgba(168,85,247,0.25)" style={{borderRadius:14}}>
                      <div className="daily-card" style={{margin:0,border:'none'}} onClick={() => { setSelectedDailyPlaylist(i); goto('daily-playlist') }}>
                        <div className="daily-card-art" style={{background: pl.gradient}}>
                          <div className="daily-card-art-bg">{pl.icon}</div>
                          <div className="daily-card-play" onClick={e => { e.stopPropagation(); playTrack(pl.tracks[0], pl.tracks) }}>▶</div>
                          <div className="daily-card-badge">♥ {pl.name}</div>
                        </div>
                        <div className="daily-card-body">
                          <div className="daily-card-name">{pl.name}</div>
                          <div className="daily-card-desc">{pl.desc}</div>
                        <div className="daily-card-count">{T('daily_50')}</div>
                        <div className="daily-card-btns">
                          <button className="daily-card-btn daily-card-btn-play" onClick={e => { e.stopPropagation(); playTrack(pl.tracks[0], pl.tracks) }}>▶ {i===0?T('btn_continue'):T('btn_listen')}</button>
                          <button className="daily-card-btn daily-card-btn-lib">{Ico.library} {T('btn_to_lib')}</button>
                          </div>
                        </div>
                      </div>
                    </TiltSpotlightCard>
                  ))}
                </div>

                {/* Speakers Section */}
                <div className="section-header" style={{marginTop:48}}>
                  <span className="section-badge">{Ico.user} Учёные и лекторы</span>
                </div>
                <h3 className="section-title">Лекторы и чтецы</h3>
                <p className="section-desc">Известные учёные и лекторы ислама</p>
                <div className="speakers-scroll">
                  {speakers.slice(0, 8).map(s => (
                    <div key={s.id} className="speaker-card" onClick={() => { setSelectedSpeaker(s); goto('speaker') }}>
                      <div className="speaker-avatar" style={{background: getSpeakerGradient(s.id)}}>
                        {s.imageUrl ? <img src={s.imageUrl} alt={s.name} /> : <span className="speaker-initials">{getInitials(s.name)}</span>}
                      </div>
                      <div className="speaker-name">{s.name}</div>
                      <div className="speaker-role">{s.role}</div>
                    </div>
                  ))}
                </div>
                <div style={{textAlign:'right',margin:'12px 0 40px'}}>
                  <button className="hero-btn hero-btn-secondary" onClick={() => goto('speakers')}>Показать все {Ico.chevRight}</button>
                </div>
              </>
            )}

            {/* ═══ SEARCH ═══ */}
            {page === 'search' && (
              <>
                <div className="page-eyebrow">Подборки от Salaf Library</div>
                <h1 className="page-title" style={{marginBottom:20}}>{T('search_title')}</h1>
                <div className="search-bar">
                  {Ico.search}
                  <input type="text" placeholder={T('search_placeholder')} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>
                {searchQuery.trim() ? (
                  <>
                    <p className="section-desc">{T('search_found')}: {filteredTracks.length}</p>
                    <TrackList tracks={filteredTracks} currentTrack={currentTrack} isPlaying={isPlaying} onPlay={playTrack} />
                  </>
                ) : (
                  <>
                    <div className="tag-group">
                      <div className="tag-group-header">{Ico.library} Разделы</div>
                      <div className="tag-group-tags">
                        {categories.map(c => (
                          <button key={c.id} className="tag" onClick={() => { setActiveCategory(c); goto('category') }}>{c.icon} {c.name}</button>
                        ))}
                      </div>
                    </div>
                    <div className="tag-group">
                      <div className="tag-group-header">{Ico.headphones} Настроения</div>
                      <div className="tag-group-tags">
                        {['Для изучения','Перед сном','Утреннее','Для семьи','Для молодёжи','Для познания','Для покаяния','Для терпения','Для радости','Для утешения'].map(t => (
                          <button key={t} className="tag" onClick={() => setSearchQuery(t)}>🕯 {t}</button>
                        ))}
                      </div>
                    </div>
                    <div className="tag-group">
                      <div className="tag-group-header">{Ico.clock} Периоды</div>
                      <div className="tag-group-tags">
                        {['Ранний Ислам','Средневековье','Современность','До хиджры','После хиджры'].map(t => (
                          <button key={t} className="tag" onClick={() => setSearchQuery(t)}>{t}</button>
                        ))}
                      </div>
                    </div>
                    <div className="tag-group">
                      <div className="tag-group-header">{Ico.sparkles} Популярные темы</div>
                      <div className="tag-group-tags">
                        {['Намаз','Закяат','Хадж','Таухид','Сира','Терпение','Покаяние','Смирение','Братство','Знание','Семья','Молодёжь'].map(t => (
                          <button key={t} className="tag" onClick={() => setSearchQuery(t)}>🏷 {t}</button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            {/* ═══ AI PLAYLIST ═══ */}
            {page === 'ai-playlist' && (
              <>
                <div className="ai-page-header">
                  <div className="section-badge" style={{marginBottom:12}}>{Ico.library} {T('playlist_badge')}</div>
                  <h1 className="ai-page-title">{T('playlist_title')} <em>{T('playlist_title_italic')}</em><br/>{T('playlist_title_end')}</h1>
                  <p className="ai-page-desc">{T('playlist_desc')}</p>
                </div>
                <div className="ai-input-card">
                  <textarea className="ai-input" placeholder={T('playlist_placeholder')} value={aiPrompt} onChange={e => setAiPrompt(e.target.value.slice(0,200))} />
                  <div className="ai-suggestions">
                    {['Напоминания для namaz','Коран для медитации','Насхиды для дороги','Лекции о терпении','Дуа перед сном'].map(s => (
                      <button key={s} className="ai-suggestion" onClick={() => setAiPrompt(s)}>💡 {s}</button>
                    ))}
                  </div>
                  <div className="ai-input-footer" style={{marginTop:16}}>
                    <div className="ai-track-count">
                      <span className="ai-track-count-label">{T('playlist_records')}</span>
                      {[20,30,40].map(n => (
                        <button key={n} className={`ai-track-count-btn ${aiTrackCount===n?'active':''}`} onClick={() => setAiTrackCount(n)}>{n}</button>
                      ))}
                    </div>
                    <button className="ai-generate-btn" onClick={() => { if(aiPrompt.trim()) { playTrack(audioData[0], audioData) } }}>{Ico.sparkles} {T('playlist_generate')}</button>
                  </div>
                </div>
              </>
            )}

            {/* ═══ LIBRARY ═══ */}
            {page === 'library' && (
              <>
                <div style={{display:'flex',alignItems:'flex-end',marginBottom:24}}>
                  <div style={{flex:1}}>
                    <div className="page-eyebrow">{T('library_collection')}</div>
                    <h1 className="page-title">{T('library_title')}</h1>
                  </div>
                </div>
                <div className="lib-tabs">
                  {(['playlists','albums','artists','downloaded'] as const).map(t => (
                    <button key={t} className={`lib-tab ${libTab===t?'active':''}`} onClick={() => setLibTab(t)}>
                      {{playlists:T('lib_tab_lectures'),albums:T('lib_tab_fav'),artists:T('lib_tab_lectors'),downloaded:T('lib_tab_downloaded')}[t]}
                    </button>
                  ))}
                </div>
                {libTab === 'playlists' && (
                  <>
                    <div className="lib-item">
                      <div className="lib-item-icon">{Ico.upload}</div>
                      <div className="lib-item-info">
                        <div className="lib-item-title">{T('lib_downloaded')}</div>
                        <div className="lib-item-desc">{T('lib_downloaded_desc')}</div>
                      </div>
                    </div>
                    <div className="lib-item">
                      <div className="lib-item-icon">{Ico.link}</div>
                      <div className="lib-item-info">
                        <div className="lib-item-title">{T('lib_import')}</div>
                        <div className="lib-item-desc">{T('lib_import_desc')}</div>
                      </div>
                    </div>
                    <div className="lib-item">
                      <div className="lib-item-icon">{Ico.heart}</div>
                      <div className="lib-item-info">
                        <div className="lib-item-title">{T('lib_favorites')}</div>
                        <div className="lib-item-desc">{liked.size} {T('lib_favorites_desc')}</div>
                      </div>
                    </div>
                  </>
                )}
                {libTab === 'albums' && (
                  liked.size > 0 ? (
                    <TrackList tracks={audioData.filter(t => liked.has(t.id))} currentTrack={currentTrack} isPlaying={isPlaying} onPlay={playTrack} />
                  ) : (
                    <div className="lib-empty">
                      <div className="lib-empty-icon">❤️</div>
                      <div className="lib-empty-title">Нет сохранённых</div>
                      <div className="lib-empty-desc">Нажмите сердечко на странице трека</div>
                    </div>
                  )
                )}
                {libTab === 'artists' && (
                  <div className="lib-empty">
                    <div className="lib-empty-icon">👤</div>
                    <div className="lib-empty-title">Артисты</div>
                    <div className="lib-empty-desc">Все артисты представлены в разделах</div>
                  </div>
                )}
                {libTab === 'downloaded' && (
                  <div className="lib-empty">
                    <div className="lib-empty-icon">⬇️</div>
                    <div className="lib-empty-title">Пока ничего не сохранено оффлайн</div>
                    <div className="lib-empty-desc">Откройте трек и нажмите «Слушать оффлайн»</div>
                  </div>
                )}
              </>
            )}

            {/* ═══ CATEGORY ═══ */}
            {page === 'category' && activeCategory && (
              <>
                <div className="cat-header">
                  <div className="cat-header-art" style={{background:catBg(activeCategory)}}>{activeCategory.icon}</div>
                  <div className="cat-header-info">
                    <div className="cat-header-label">Раздел</div>
                    <div className="cat-header-name">{activeCategory.name}</div>
                    <div className="cat-header-count">{activeCategory.count} аудио записей</div>
                    <div className="cat-header-actions">
                      <button className="cat-play-btn" onClick={() => { const tracks = audioData.filter(t=>t.categoryId===activeCategory.id); playTrack(tracks[0], tracks) }}>▶ Слушать</button>
                      <button className="cat-icon-btn" onClick={() => toggleLike(activeCategory.id)}>{liked.has(activeCategory.id) ? Ico.heartFill : Ico.heart}</button>
                      <button className="cat-icon-btn">{Ico.radio}</button>
                      <button className="cat-icon-btn">{Ico.share}</button>
                    </div>
                  </div>
                </div>
                <h3 className="section-title" style={{marginBottom:12}}>Популярные треки</h3>
                <TrackList tracks={audioData.filter(t=>t.categoryId===activeCategory.id)} currentTrack={currentTrack} isPlaying={isPlaying} onPlay={playTrack} />
              </>
            )}

            {/* ═══ FAVORITES ═══ */}
            {page === 'favorites' && (
              <>
                <div style={{display:'flex',alignItems:'flex-end',gap:20,marginBottom:32}}>
                  <div style={{width:160,height:160,borderRadius:14,background:'var(--bg4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:56,flexShrink:0}}>♥</div>
                  <div>
                    <div className="page-eyebrow">{T('playlist_badge')}</div>
                    <h1 className="page-title">{T('favorites_title')}</h1>
                    <div style={{fontSize:14,color:'var(--text3)'}}>{liked.size} {T('lib_favorites_desc')}</div>
                  </div>
                </div>
                {liked.size > 0 ? (
                  <TrackList tracks={audioData.filter(t => liked.has(t.id))} currentTrack={currentTrack} isPlaying={isPlaying} onPlay={playTrack} />
                ) : (
                  <div className="lib-empty">
                    <div className="lib-empty-icon">❤️</div>
                    <div className="lib-empty-title">{T('favorites_empty')}</div>
                    <div className="lib-empty-desc">{T('favorites_empty_desc')}</div>
                  </div>
                )}
              </>
            )}

            {/* ═══ PROFILE ═══ */}
            {page === 'profile' && (
              <>
                {/* Profile card */}
                <div className="profile-card">
                  <div className="profile-top">
                    <div className="profile-avatar">АК</div>
                    <div className="profile-info">
                      <div className="profile-label">Профиль</div>
                      <div className="profile-name">Abu Katana</div>
                      <div className="profile-handle">@abusaliх</div>
                    </div>
                    <button className="theme-toggle">🌙 Тёмная</button>
                  </div>
                </div>

                {/* Playback settings */}

                {/* Language */}
                <div className="settings-card">
                  <div className="settings-card-header">
                    <div className="settings-card-icon">🌍</div>
                    <div className="settings-card-title">Язык</div>
                  </div>
                  <div className="settings-card-desc">Меняет язык всех текстов в приложении.</div>
                  <div className="lang-switcher">
                    <button className={`lang-btn ${lang==='ru'?'active':''}`} onClick={() => setLangHandler('ru')}>Русский</button>
                    <button className={`lang-btn ${lang==='en'?'active':''}`} onClick={() => setLangHandler('en')}>English</button>
                    <button className={`lang-btn ${lang==='tg'?'active':''}`} onClick={() => setLangHandler('tg')}>Тоҷикӣ</button>
                  </div>
                </div>


                {/* Hidden from recs */}
                <div className="settings-card">
                  <div className="settings-card-header">
                    <div className="settings-card-icon">{Ico.close}</div>
                    <div className="settings-card-title">Скрытые из рекомендаций</div>
                  </div>
                  <div className="settings-card-desc">Не попадают в волну, дневные плейлисты и AI-подборки.</div>
                </div>

                {/* Account */}
                <div className="settings-card">
                  <div className="settings-card-header">
                    <div className="settings-card-icon">{Ico.user}</div>
                    <div className="settings-card-title">Аккаунт</div>
                  </div>
                  <div className="account-item">
                    <div className="account-item-icon">📱</div>
                    <div className="account-item-info">
                      <div className="account-item-title">Telegram</div>
                      <div className="account-item-desc">@abusaliх</div>
                    </div>
                    <span className="account-item-badge">ПРИВЯЗАН</span>
                  </div>
                  <div className="account-item">
                    <div className="account-item-icon">{Ico.mail}</div>
                    <div className="account-item-info">
                      <div className="account-item-title">Email</div>
                      <div className="account-item-desc">Не привязан</div>
                    </div>
                    <span className="account-item-action">{Ico.link} Привязать</span>
                  </div>
                </div>

                {/* Sessions */}
                <div className="settings-card">
                  <div className="settings-card-header">
                    <div className="account-item-icon">{Ico.monitor}</div>
                    <div className="settings-card-title">Сессии</div>
                  </div>
                  <div className="settings-card-desc">Список устройств, которые сейчас вошли в твой аккаунт.</div>
                  <div className="account-item">
                    <div className="account-item-icon">{Ico.monitor}</div>
                    <div className="account-item-info">
                      <div className="account-item-title">Yandex Browser · Windows <span className="account-item-badge" style={{marginLeft:6}}>ТЕКУЩАЯ</span></div>
                      <div className="account-item-desc">Последняя активность: 30 минут назад</div>
                    </div>
                  </div>
                  <div className="account-item">
                    <div className="account-item-icon">📱</div>
                    <div className="account-item-info">
                      <div className="account-item-title">Браузер · iPhone</div>
                      <div className="account-item-desc">Последняя активность: 3 дня назад</div>
                    </div>
                    <span className="account-item-action">{Ico.logout} Завершить</span>
                  </div>
                  <div className="account-action-row">
                    <button className="account-logout-btn">{Ico.logout} Выйти со всех других устройств</button>
                  </div>
                </div>

                {/* Install app */}
                <div className="account-item" style={{marginBottom:16}}>
                  <div className="account-item-icon">{Ico.download}</div>
                  <div className="account-item-info">
                    <div className="account-item-title">Установить приложение</div>
                    <div className="account-item-desc">Добавьте SALAF LIBRARY на рабочий стол для быстрого доступа.</div>
                  </div>
                  <span className="account-item-action">⬇ Установить</span>
                </div>

                {/* Logout */}
                <div className="account-item" style={{marginBottom:40}}>
                  <div className="account-item-icon">{Ico.logout}</div>
                  <div className="account-item-info">
                    <div className="account-item-title">Выйти</div>
                    <div className="account-item-desc">Сохранённые настройки останутся в облаке.</div>
                  </div>
                  <span className="account-item-action">{Ico.logout} Выйти</span>
                </div>
              </>
            )}

            {/* ═══ DAILY PLAYLIST ═══ */}
            {page === 'daily-playlist' && selectedDailyPlaylist !== null && (
              <>
                <button className="back-btn" onClick={() => goto('home')}>{Ico.back} Назад</button>
                <div className="daily-playlist-header">
                  <div className="daily-playlist-art" style={{background: dailyPlaylists[selectedDailyPlaylist].gradient}}>
                    {dailyPlaylists[selectedDailyPlaylist].icon}
                  </div>
                  <div className="daily-playlist-info">
                    <div className="page-eyebrow">Плейлист дня · {dailyPlaylists[selectedDailyPlaylist].name}</div>
                    <h1 className="page-title">{dailyPlaylists[selectedDailyPlaylist].name}</h1>
                    <p className="page-subtitle">{dailyPlaylists[selectedDailyPlaylist].desc}</p>
                    <div className="daily-playlist-count">50 треков</div>
                    <div className="daily-playlist-actions">
                      <button className="cat-play-btn" onClick={() => playTrack(dailyPlaylists[selectedDailyPlaylist].tracks[0], dailyPlaylists[selectedDailyPlaylist].tracks)}>▶ Слушать</button>
                      <button className="cat-icon-btn">{Ico.library} В библиотеку</button>
                    </div>
                  </div>
                </div>
                <TrackList tracks={dailyPlaylists[selectedDailyPlaylist].tracks} currentTrack={currentTrack} isPlaying={isPlaying} onPlay={playTrack} />
              </>
            )}

            {/* ═══ SPEAKERS LIST ═══ */}
            {page === 'speakers' && (
              <>
                <div className="page-eyebrow">Коллекция</div>
                <h1 className="page-title" style={{marginBottom:20}}>Учёные, лекторы и чтецы</h1>
                <div className="search-bar">
                  {Ico.search}
                  <input type="text" placeholder="Поиск лекторов..." value={speakerSearch} onChange={e => setSpeakerSearch(e.target.value)} />
                </div>
                <div className="lib-tabs" style={{marginBottom:20}}>
                  {['all', 'Учёный', 'Лектор', 'Чтец'].map(r => (
                    <button key={r} className={`lib-tab ${speakerRoleFilter===r?'active':''}`} onClick={() => setSpeakerRoleFilter(r)}>
                      {r === 'all' ? 'Все' : r}
                    </button>
                  ))}
                </div>
                <div className="speakers-grid">
                  {speakers
                    .filter(s => speakerRoleFilter === 'all' || s.role === speakerRoleFilter)
                    .filter(s => !speakerSearch.trim() || s.name.toLowerCase().includes(speakerSearch.toLowerCase()) || s.nameAr.includes(speakerSearch))
                    .map(s => (
                      <div key={s.id} className="speaker-card-lg" onClick={() => { setSelectedSpeaker(s); goto('speaker') }}>
                        <div className="speaker-avatar-lg" style={{background: getSpeakerGradient(s.id)}}>
                          {s.imageUrl ? <img src={s.imageUrl} alt={s.name} /> : <span className="speaker-initials-lg">{getInitials(s.name)}</span>}
                        </div>
                        <div className="speaker-card-info">
                          <div className="speaker-card-name">{s.name}</div>
                          {s.nameAr && <div className="speaker-card-ar">{s.nameAr}</div>}
                          <div className="speaker-card-role">{s.role}</div>
                          <div className="speaker-card-desc">{s.description.slice(0, 80)}...</div>
                          <div className="speaker-card-tags">{s.tags.map(t => <span key={t} className="speaker-tag">{t}</span>)}</div>
                        </div>
                      </div>
                    ))}
                </div>
              </>
            )}

            {/* ═══ SINGLE SPEAKER ═══ */}
            {page === 'speaker' && selectedSpeaker && (
              <>
                <button className="back-btn" onClick={() => goto('speakers')}>{Ico.back} Назад</button>
                <div className="speaker-detail">
                  <div className="speaker-detail-avatar" style={{background: getSpeakerGradient(selectedSpeaker.id)}}>
                    {selectedSpeaker.imageUrl ? <img src={selectedSpeaker.imageUrl} alt={selectedSpeaker.name} /> : <span className="speaker-initials-detail">{getInitials(selectedSpeaker.name)}</span>}
                  </div>
                  <div className="speaker-detail-info">
                    <div className="page-eyebrow">{selectedSpeaker.role}</div>
                    <h1 className="page-title" style={{marginBottom:4}}>{selectedSpeaker.name}</h1>
                    {selectedSpeaker.nameAr && <div className="speaker-detail-ar">{selectedSpeaker.nameAr}</div>}
                    <p className="page-subtitle" style={{marginBottom:16}}>{selectedSpeaker.description}</p>
                    <div className="speaker-detail-tags">{selectedSpeaker.tags.map(t => <span key={t} className="speaker-tag">{t}</span>)}</div>
                  </div>
                </div>
                <h3 className="section-title" style={{margin:'24px 0 12px'}}>Уроки</h3>
                {audioData.filter(t => t.speakerId === selectedSpeaker.id).length > 0 ? (
                  <TrackList tracks={audioData.filter(t => t.speakerId === selectedSpeaker.id)} currentTrack={currentTrack} isPlaying={isPlaying} onPlay={playTrack} />
                ) : (
                  <div className="lib-empty">
                    <div className="lib-empty-icon">📚</div>
                    <div className="lib-empty-title">Уроки будут добавлены</div>
                    <div className="lib-empty-desc">Следите за обновлениями</div>
                  </div>
                )}
              </>
            )}

            {/* ═══ ROOMS ═══ */}
            {page === 'rooms' && (
              <>
                <div className="page-eyebrow">Совместное прослушивание</div>
                <h1 className="page-title">Комнаты на двоих и больше</h1>
                <p className="page-subtitle" style={{maxWidth:600,marginBottom:24}}>Создай комнату и слушай в одном такте с друзьями. Любой участник может ставить треки и управлять плеером, кроссфейд и шаффл здесь не работают — это страхует от рассинхрона.</p>
                <div className="rooms-tabs">
                  <button className="rooms-tab active">{Ico.sparkles} Создать</button>
                  <button className="rooms-tab">{Ico.link} По коду</button>
                </div>
                <div className="rooms-create-row">
                  <input className="rooms-input" placeholder="Название (необязательно)" />
                  <button className="rooms-create-btn">+ Создать</button>
                </div>
                <div className="rooms-list-header">{Ico.user} Мои комнаты</div>
                <div className="lib-empty" style={{marginTop:12}}>
                  <div className="lib-empty-desc">Пока нет ни одной комнаты. Создай новую или войди по коду от друга.</div>
                </div>
              </>
            )}

          </div>
        </div>

        {/* ─── Bottom Player ─── */}
        <div className={`player ${isPlaying?'playing':''}`}>
          <div className="player-left">
            <div className="player-thumb" style={currentTrack ? {background:trackBg(currentTrack)} : {}} onClick={() => currentTrack && setNowPlaying(true)}>
              {currentTrack ? currentTrack.icon : '🎵'}
            </div>
            <div className="player-track-info">
              <div className="player-track-title" onClick={() => currentTrack && setNowPlaying(true)}>{currentTrack?.title || T('player_select')}</div>
              <div className="player-track-author" onClick={() => currentTrack && setNowPlaying(true)}>{currentTrack?.author || T('player_for')}</div>
            </div>
          </div>
          <div className="player-center">
            <div className="player-btns">
              <button className={`player-btn ${shuffled?'active':''}`} onClick={() => setShuffled(s => !s)}>{Ico.shuffle}</button>
              <button className="player-btn" onClick={playPrev}>{Ico.prev}</button>
              <button className="player-btn player-btn-play" onClick={() => currentTrack && setIsPlaying(p => !p)}>
                {isPlaying ? Ico.pause : Ico.play}
              </button>
              <button className="player-btn" onClick={playNext}>{Ico.next}</button>
              <button className={`player-btn ${repeated?'active':''}`} onClick={() => setRepeated(r => !r)}>{Ico.repeat}</button>
            </div>
            <div className="player-progress">
              <span className="player-time">{fmtTime(currentTime)}</span>
              <div className="player-progress-bar" onClick={handleProgressClick} onMouseDown={handleDragStart('progress')}>
                <div className="player-progress-fill" style={{width:`${progress*100}%`}} />
              </div>
              <span className="player-time">{currentTrack ? (audioRef.current?.duration ? fmtTime(audioRef.current.duration) : currentTrack.duration) : '0:00'}</span>
            </div>
          </div>
          <div className="player-right">
            <div className="player-extra-btns">
              <button className="player-extra-btn" onClick={() => currentTrack && setNowPlaying(true)}>{Ico.heart}</button>
              <button className="player-extra-btn" onClick={() => setQueueOpen(true)}>{Ico.list}</button>
              <button className="player-extra-btn" onClick={(e) => { e.stopPropagation(); const rect = e.currentTarget.getBoundingClientRect(); setCtxMenu({x: Math.min(rect.left, window.innerWidth - 240), y: Math.max(8, rect.top - 320)}) }}>{Ico.dots}</button>
            </div>
            <div className="player-vol">
              <div onClick={() => setMuted(m => !m)}>{muted ? Ico.volMute : Ico.vol}</div>
              <div className="player-vol-bar" onClick={handleVolClick} onMouseDown={handleDragStart('volume')}>
                <div className="player-vol-fill" style={{width:`${(muted?0:volume)*100}%`}} />
              </div>
            </div>
            <div className="player-expand" onClick={() => currentTrack && setNowPlaying(true)}>{Ico.expand}</div>
          </div>
        </div>
      </div>

      {/* ─── Mobile Nav ─── */}
      <nav className="mobile-nav">
        <div className="mobile-nav-items">
          <button className={`mobile-nav-item ${page==='home'?'active':''}`} onClick={() => { setActiveCategory(null); goto('home') }}>{Ico.home}<span>Главная</span></button>
          <button className={`mobile-nav-item ${page==='search'?'active':''}`} onClick={() => goto('search')}>{Ico.search}<span>Поиск</span></button>
          <button className={`mobile-nav-item ${page==='library'?'active':''}`} onClick={() => goto('library')}>{Ico.library}<span>Библиотека</span></button>
          <button className={`mobile-nav-item ${page==='profile'?'active':''}`} onClick={() => goto('profile')}>{Ico.user}<span>Профиль</span></button>
        </div>
      </nav>

      {/* ─── Wave Settings Modal ─── */}
      {waveSettingsOpen && (
        <>
          <div className="eq-overlay open" onClick={() => setWaveSettingsOpen(false)} />
          <div className="wave-modal" onClick={e => e.stopPropagation()}>
            <div className="wave-modal-header">
              <span style={{display:'flex',alignItems:'center',gap:8,fontSize:16,fontWeight:700}}>{Ico.eq} Настроить мою волну</span>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <button className="eq-close" onClick={() => setWaveSettingsOpen(false)}>{Ico.refresh}</button>
                <button className="eq-close" onClick={() => setWaveSettingsOpen(false)}>{Ico.close}</button>
              </div>
            </div>
            <div className="wave-section-label">Под настроение</div>
            <div className="eq-presets">
              {['Без настроения','Спокойно','Энергично','Сосредоточенно','Вечеринка','Старая школа'].map(m => (
                <button key={m} className={`eq-preset ${waveMood===m?'active':''}`} onClick={() => setWaveMood(m)}>{m}</button>
              ))}
            </div>
            <div className="wave-section-label">По характеру</div>
            <div className="eq-presets">
              {['Повторять','Всё новое','Смешанное'].map(m => (
                <button key={m} className="eq-preset">{m}</button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ─── Queue Panel (centered modal) ─── */}
      <div className={`queue-overlay ${queueOpen?'open':''}`} onClick={() => setQueueOpen(false)}>
        <div className="queue-modal" onClick={e => e.stopPropagation()}>
          <div className="queue-header">
            <span className="queue-title">{Ico.list} {T('queue_title')} <span className="queue-count">· {queue.length}</span></span>
            <button className="queue-close" onClick={() => setQueueOpen(false)}>{Ico.close}</button>
          </div>
          <div className="queue-list">
            {queue.map((t,i) => (
              <div key={`${t.id}-${i}`} className={`queue-item ${currentTrack?.id===t.id?'playing':''}`} onClick={() => playTrack(t)}>
                <div className="queue-item-drag">{Ico.grip}</div>
                <div className="queue-item-thumb" style={{background: categories.find(c=>c.id===t.categoryId)?.gradient || '#333'}}>{t.icon}</div>
                <div className="queue-item-info">
                  <div className="queue-item-title">{t.title}</div>
                  <div className="queue-item-author">{t.author}</div>
                </div>
                <div className="queue-item-actions">
                  <button className="queue-item-btn" onClick={e => {e.stopPropagation();removeFromQueue(t.id)}}>{Ico.trash}</button>
                </div>
              </div>
            ))}
            {queue.length === 0 && <div className="lib-empty" style={{margin:20}}><div className="lib-empty-icon">🎶</div><div className="lib-empty-desc">{T('queue_empty')}</div></div>}
          </div>
        </div>
      </div>

      {/* ─── Context Menu ─── */}
      {ctxMenu && (
        <>
          <div className="ctx-overlay" onClick={() => setCtxMenu(null)} />
          <div className="ctx-menu" style={{left: ctxMenu.x, top: ctxMenu.y}} onClick={e => e.stopPropagation()}>
            <div className="ctx-item" onClick={() => { setQueueOpen(true); setCtxMenu(null) }}>{Ico.list} {T('ctx_queue')}</div>
            <div className="ctx-item" onClick={() => setCtxMenu(null)}>{Ico.library} {T('ctx_add_playlist')}</div>
            <div className="ctx-item" onClick={() => setCtxMenu(null)}>{Ico.sparkles} {T('ctx_start_wave')}</div>
            <div className="ctx-divider" />
            <div className="ctx-item" onClick={() => setCtxMenu(null)}>{Ico.download} {T('ctx_offline')}</div>
            <div className="ctx-item" onClick={() => setCtxMenu(null)}>{Ico.download} {T('ctx_download')}</div>
            <div className="ctx-item" onClick={() => setCtxMenu(null)}>{Ico.upload} {T('ctx_upload')}</div>
            <div className="ctx-divider" />
            <div className="ctx-item" onClick={() => setCtxMenu(null)}>{Ico.share} {T('ctx_share')}</div>
            <div className="ctx-item" onClick={() => setCtxMenu(null)}>{Ico.user} {T('ctx_artist')} {Ico.chevRight}</div>
            <div className="ctx-item" onClick={() => setCtxMenu(null)}>{Ico.library} {T('ctx_album')}</div>
            <div className="ctx-divider" />
            <div className="ctx-item" onClick={() => setCtxMenu(null)}>{Ico.close} {T('ctx_hide_track')}</div>
            <div className="ctx-item" onClick={() => setCtxMenu(null)}>{Ico.close} {T('ctx_hide_artist')} {Ico.chevRight}</div>
          </div>
        </>
      )}

      {/* ─── Equalizer Panel ─── */}
      <div className={`eq-overlay ${npView==='eq'?'open':''}`} onClick={() => setNpView('main')}>
        <div className={`eq-panel ${npView==='eq'?'open':''}`} onClick={e => e.stopPropagation()}>
          <div className="eq-header">
            <div className="eq-header-left">
              <div className="eq-header-icon">{Ico.eq}</div>
              <div>
                <div className="eq-header-title">Эквалайзер</div>
                <div className="eq-header-preset">{eqPreset}</div>
              </div>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <button className="eq-reset" onClick={() => setEqPreset('Без обработки')}>{Ico.refresh} Сброс</button>
              <button className="eq-close" onClick={() => setNpView('main')}>{Ico.close}</button>
            </div>
          </div>
          <div className="eq-presets">
            {eqPresets.map(p => (
              <button key={p} className={`eq-preset ${eqPreset===p?'active':''}`} onClick={() => setEqPreset(p)}>{p}</button>
            ))}
          </div>
          <div className="eq-sliders">
            {eqFreqs.map((f) => (
              <div key={f} className="eq-slider-col">
                <div className="eq-slider">
                  <div className="eq-slider-fill" style={{height:'50%'}} />
                  <div className="eq-slider-dot" style={{bottom:'calc(50% - 7px)'}} />
                </div>
              </div>
            ))}
          </div>
          <div className="eq-labels">
            {eqFreqs.map(f => (
              <div key={f} className="eq-label">
                <div className="eq-label-freq">{f}</div>
                <div className="eq-label-val">0.0</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Now Playing (fullscreen) ─── */}
      {nowPlaying && currentTrack && (
        <div className="now-playing">
          <div className="np-bg"><div className="np-bg-blur" style={{background: trackBg(currentTrack)}} /></div>
          <div className="np-top">
            <button className="np-top-btn" onClick={() => setNowPlaying(false)}>{Ico.chevDown}</button>
            <span className="np-top-title">{T('np_now')}</span>
            <div className="np-top-actions">
              <button className={`np-top-action ${npView==='main'?'active':''}`} onClick={() => setNpView('main')} title="Обложка">{Ico.music}</button>
              <button className={`np-top-action ${queueOpen?'active':''}`} onClick={() => setQueueOpen(true)} title="Очередь">{Ico.list}</button>
              <button className={`np-top-action ${npView==='lyrics'?'active':''}`} onClick={() => setNpView(npView==='lyrics'?'main':'lyrics')} title="Текст">{Ico.mic}</button>
              <button className={`np-top-action ${npView==='eq'?'active':''}`} onClick={() => setNpView(npView==='eq'?'main':'eq')} title="Эквалайзер">{Ico.eq}</button>
              <button className="np-top-action" onClick={(e) => { e.stopPropagation(); const rect = e.currentTarget.getBoundingClientRect(); setCtxMenu({x: Math.min(rect.left, window.innerWidth - 240), y: rect.bottom + 8}) }} title="Ещё">{Ico.dots}</button>
            </div>
          </div>

          {npView === 'main' && (
            <>
              <div className="np-art">
                <div className="np-art-inner" style={{background:trackBg(currentTrack)}}>{currentTrack.icon}</div>
              </div>
              <div className="np-info">
                <div className="np-track-title">{currentTrack.title}</div>
                <div className="np-track-author">{currentTrack.author}</div>
              </div>
              <div className="np-actions-row">
                <button className={`np-action-btn ${liked.has(currentTrack.id)?'liked':''}`} onClick={() => toggleLike(currentTrack.id)}>
                  {liked.has(currentTrack.id) ? Ico.heartFill : Ico.heart}
                </button>
              </div>
            </>
          )}

          {npView === 'lyrics' && (
            <div className="np-lyrics">
              <div className="np-lyrics-line past">Сура Аль-Фатиха</div>
              <div className="np-lyrics-line past">Во имя Аллаха, Милостивого, Милосердного</div>
              <div className="np-lyrics-line active">Хвала Аллаху, Господу миров</div>
              <div className="np-lyrics-line">Милостивому, Милосердному</div>
              <div className="np-lyrics-line">Владыке Дня воздаяния</div>
              <div className="np-lyrics-line">Тебе поклоняемся и Тебе просим помощи</div>
              <div className="np-lyrics-line">Веди нас прямым путём</div>
              <div className="np-lyrics-line">Путём тех, whom Ты облагодетельствовал</div>
              <div className="np-lyrics-line">Не тех, на кого гнев Твой, и не заблудших</div>
            </div>
          )}

          <div className="np-progress">
            <div className="np-progress-bar" onClick={handleProgressClick} onMouseDown={handleDragStart('progress')}>
              <div className="np-progress-fill" style={{width:`${progress*100}%`}} />
            </div>
            <div className="np-progress-times">
              <span>{fmtTime(currentTime)}</span>
              <span>{audioRef.current?.duration ? fmtTime(audioRef.current.duration) : currentTrack.duration}</span>
            </div>
          </div>
          <div className="np-controls">
            <button className="np-ctrl" onClick={playPrev}>{Ico.shuffle}</button>
            <button className="np-ctrl" onClick={playPrev}>{Ico.prev}</button>
            <button className="np-ctrl np-ctrl-main" onClick={() => setIsPlaying(p => !p)}>
              {isPlaying ? Ico.pause : Ico.play}
            </button>
            <button className="np-ctrl" onClick={playNext}>{Ico.next}</button>
            <button className="np-ctrl">{Ico.repeat}</button>
          </div>
          <div className="np-volume">
            <div onClick={() => setMuted(m => !m)}>{muted ? Ico.volMute : Ico.vol}</div>
            <div className="np-volume-bar" onClick={handleVolClick} onMouseDown={handleDragStart('volume')}>
              <div className="np-volume-fill" style={{width:`${(muted?0:volume)*100}%`}} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── TrackList ─── */
function TrackList({ tracks, currentTrack, isPlaying, onPlay }: {
  tracks: AudioTrack[]; currentTrack: AudioTrack | null; isPlaying: boolean; onPlay: (t: AudioTrack) => void
}) {
  if (!tracks.length) return <div className="lib-empty"><div className="lib-empty-icon">🔍</div><div className="lib-empty-title">Ничего не найдено</div></div>
  return (
    <div className="track-list">
      <div className="track-list-header"><span>#</span><span>Название</span><span style={{textAlign:'right'}}>Длит.</span><span></span></div>
      {tracks.map((t, i) => {
        const active = currentTrack?.id === t.id
        const playing = active && isPlaying
        return (
          <div key={t.id} className={`track-row ${active?'playing':''}`} onDoubleClick={() => onPlay(t)}>
            <div className="track-num">
              <span className="num">{i+1}</span>
              <span className="play-ind" onClick={() => onPlay(t)}>{playing ? Ico.pause : Ico.play}</span>
              <span className="playing-anim">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--accent)"><rect x="6" y="4" width="4" height="16" rx="1"><animate attributeName="height" values="16;8;16" dur=".8s" repeatCount="indefinite"/><animate attributeName="y" values="4;8;4" dur=".8s" repeatCount="indefinite"/></rect><rect x="14" y="4" width="4" height="16" rx="1"><animate attributeName="height" values="8;16;8" dur=".8s" repeatCount="indefinite"/><animate attributeName="y" values="8;4;8" dur=".8s" repeatCount="indefinite"/></rect></svg>
              </span>
            </div>
            <div className="track-title-wrap" onClick={() => onPlay(t)}>
              <div className="track-thumb" style={{background: categories.find(c=>c.id===t.categoryId)?.gradient || '#333'}}>{t.icon}</div>
              <div className="track-title-info">
                <div className="track-title">{t.title}</div>
                <div className="track-author">{t.author}</div>
              </div>
            </div>
            <div className="track-duration">{t.duration}</div>
            <div className="track-action"><button className="track-action-btn" onClick={e => {e.stopPropagation();onPlay(t)}}>{playing ? Ico.pause : Ico.play}</button></div>
          </div>
        )
      })}
    </div>
  )
}

export interface Category {
  id: string
  name: string
  icon: string
  count: number
  color: string
  gradient: string
}

export interface Lecture {
  id: number
  title: string
  scholar: string
  scholarId?: string
  duration: string
  icon: string
  categoryId: string
  src: string
  cover?: string
  coverImage?: string
  tags?: string[]
  seriesId?: string
  lessonNumber?: number
  fileType?: string
  fileSize?: number
}

export interface Scholar {
  id: string
  name: string
  nameAr: string
  role: string
  description: string
  imageUrl: string
  lessonsCount: number
  tags: string[]
  sourceUrl: string
  imageCredit: string
}

export interface Series {
  id: string
  name: string
  description: string
  cover?: string
  scholarId?: string
  tags?: string[]
}

export interface Playlist {
  id: string
  name: string
  description: string
  lectures: Lecture[]
  cover?: string
}

export const categories: Category[] = [
  { id: 'lectures', name: 'Лекции', icon: '📚', count: 3, color: '#1b4332', gradient: 'linear-gradient(135deg, #1b4332, #2d6a4f)' },
  { id: 'series', name: 'Серии', icon: '📖', count: 0, color: '#3c096c', gradient: 'linear-gradient(135deg, #3c096c, #7b2cbf)' },
  { id: 'reminders', name: 'Напоминания', icon: '💡', count: 0, color: '#bc6c25', gradient: 'linear-gradient(135deg, #606c38, #bc6c25)' },
]

// Load from localStorage override or use default
function loadFromStorage<T>(key: string, defaultData: T): T {
  try {
    const stored = localStorage.getItem(key)
    if (stored) {
      return JSON.parse(stored) as T
    }
  } catch {}
  return defaultData
}

export function getLectures(): Lecture[] {
  return loadFromStorage<Lecture[]>('salaf-admin-lectures', defaultLectures)
}

export function getScholars(): Scholar[] {
  return loadFromStorage<Scholar[]>('salaf-admin-scholars', defaultScholars)
}

export function getSeries(): Series[] {
  return loadFromStorage<Series[]>('salaf-admin-series', defaultSeries)
}

export function saveLectures(lectures: Lecture[]): void {
  localStorage.setItem('salaf-admin-lectures', JSON.stringify(lectures))
  window.dispatchEvent(new Event('salaf-audio-data-updated'))
}

export function saveScholars(scholars: Scholar[]): void {
  localStorage.setItem('salaf-admin-scholars', JSON.stringify(scholars))
  window.dispatchEvent(new Event('salaf-audio-data-updated'))
}

export function saveSeries(series: Series[]): void {
  localStorage.setItem('salaf-admin-series', JSON.stringify(series))
  window.dispatchEvent(new Event('salaf-audio-data-updated'))
}

const defaultScholars: Scholar[] = []

const defaultSeries: Series[] = []

const defaultLectures: Lecture[] = [
  {
    id: 1,
    title: 'Открытие Палестины — Часть 1',
    scholar: 'Лектор',
    duration: '0:00',
    icon: '📚',
    categoryId: 'lectures',
    src: '/audio/01 Открытие Палестины.mp3',
    cover: '',
    tags: ['сيرة', 'история'],
  },
  {
    id: 2,
    title: 'Открытие Палестины — Часть 2',
    scholar: 'Лектор',
    duration: '0:00',
    icon: '📚',
    categoryId: 'lectures',
    src: '/audio/02 Открытие Палестины.mp3',
    cover: '',
    tags: ['сيرة', 'история'],
  },
  {
    id: 3,
    title: 'Открытие Палестины — Часть 3',
    scholar: 'Лектор',
    duration: '0:00',
    icon: '📚',
    categoryId: 'lectures',
    src: '/audio/03 Открытие Палестины.mp3',
    cover: '',
    tags: ['сيرة', 'история'],
  },
]

export const lectures = getLectures()
export const scholars = getScholars()
export const series = getSeries()

// Legacy alias
export const audioData = lectures

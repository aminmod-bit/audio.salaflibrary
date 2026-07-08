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
  tags?: string[]
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

export const lectures: Lecture[] = [
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

// Legacy alias for backward compatibility
export const audioData = lectures

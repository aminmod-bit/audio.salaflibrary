export interface Category {
  id: string
  name: string
  icon: string
  count: number
  color: string
  gradient: string
}

export interface AudioTrack {
  id: number
  title: string
  author: string
  duration: string
  icon: string
  categoryId: string
  src: string
  cover?: string
}

export const categories: Category[] = [
  { id: 'lectures', name: 'Лекции', icon: '📚', count: 3, color: '#1b4332', gradient: 'linear-gradient(135deg, #1b4332, #2d6a4f)' },
  { id: 'series', name: 'Серии', icon: '📖', count: 0, color: '#3c096c', gradient: 'linear-gradient(135deg, #3c096c, #7b2cbf)' },
  { id: 'reminders', name: 'Напоминания', icon: '💡', count: 0, color: '#bc6c25', gradient: 'linear-gradient(135deg, #606c38, #bc6c25)' },
]

export const audioData: AudioTrack[] = [
  {
    id: 1,
    title: 'Открытие Палестины — Часть 1',
    author: 'Лектор',
    duration: '0:00',
    icon: '📚',
    categoryId: 'lectures',
    src: '/audio/01 Открытие Палестины.mp3',
    cover: '',
  },
  {
    id: 2,
    title: 'Открытие Палестины — Часть 2',
    author: 'Лектор',
    duration: '0:00',
    icon: '📚',
    categoryId: 'lectures',
    src: '/audio/02 Открытие Палестины.mp3',
    cover: '',
  },
  {
    id: 3,
    title: 'Открытие Палестины — Часть 3',
    author: 'Лектор',
    duration: '0:00',
    icon: '📚',
    categoryId: 'lectures',
    src: '/audio/03 Открытие Палестины.mp3',
    cover: '',
  },
]

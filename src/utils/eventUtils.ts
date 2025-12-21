import type { EventCategory, EventCoverVariant, EventItem } from '../types/event'

export const generateId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
}

export const getRandomCoverVariant = (): EventCoverVariant => {
  const variants: EventCoverVariant[] = ['mint', 'lavender', 'peach', 'sky']
  return variants[Math.floor(Math.random() * variants.length)]
}

export const createEvent = (payload: {
  title: string
  startsAt: string
  coverFileName: string | null
  category: EventCategory
  description: string
  author: string
}): EventItem => {
  return {
    id: generateId(),
    title: payload.title,
    category: payload.category,
    startsAt: payload.startsAt,
    coverVariant: getRandomCoverVariant(),
    description: payload.description || 'Описание мероприятия отсутствует',
    author: payload.author,
  }
}

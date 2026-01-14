export type EventCategory = 'Спорт' | 'Культура' | 'Еда' | 'Прогулка' | 'Другое'

export type EventCoverVariant = 'mint' | 'lavender' | 'peach' | 'sky'

export type EventItem = {
  id: string
  title: string
  category: EventCategory
  categories?: EventCategory[]
  startsAt: string
  coverVariant: EventCoverVariant
  customCover?: string
  description: string
  author: string
  participantsCount?: number
}

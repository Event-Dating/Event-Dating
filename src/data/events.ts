import { CreateEventRequest as APICreateEventRequest, Event as APIEvent, EventsAPI } from '../services/api'
import type { EventCategory, EventCoverVariant, EventItem } from '../types/event'

export type Event = APIEvent & {
  createdAt?: string
}

export type CreateEventRequest = APICreateEventRequest

class EventsService {
  async getEvents(): Promise<EventItem[]> {
    try {
      const apiEvents = await EventsAPI.getEvents()
      
      return apiEvents.map(event => ({
        id: event.id,
        title: event.title,
        category: event.category as EventCategory,
        startsAt: event.startsAt,
        coverVariant: event.coverVariant as EventCoverVariant,
        description: event.description || '',
        author: event.author
      }))
    } catch (error) {
      console.error('Failed to fetch events:', error)
      // Возвращаем пустой массив в случае ошибки
      return []
    }
  }

  async createEvent(eventData: CreateEventRequest, currentUserEmail: string): Promise<EventItem> {
    try {
      // Находим ID пользователя по email (в реальном приложении лучше хранить ID)
      const apiEvent = await EventsAPI.createEvent(eventData)
      
      return {
        id: apiEvent.id,
        title: apiEvent.title,
        category: apiEvent.category as EventCategory,
        startsAt: apiEvent.startsAt,
        coverVariant: apiEvent.coverVariant as EventCoverVariant,
        description: apiEvent.description || '',
        author: currentUserEmail
      }
    } catch (error) {
      console.error('Failed to create event:', error)
      throw error
    }
  }

  // Временные заглушки для остальных методов
  async updateEvent(_id: string, _updates: Partial<EventItem>): Promise<EventItem | null> {
    console.log('updateEvent not implemented with API yet')
    return null
  }

  async deleteEvent(_id: string): Promise<boolean> {
    console.log('deleteEvent not implemented with API yet')
    return false
  }

  async joinEvent(_eventId: string, _userId: string): Promise<boolean> {
    console.log('joinEvent not implemented with API yet')
    return false
  }

  async leaveEvent(_eventId: string, _userId: string): Promise<boolean> {
    console.log('leaveEvent not implemented with API yet')
    return false
  }
}

export const eventsService = new EventsService()

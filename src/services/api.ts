// API сервис для работы с бэкендом

const API_BASE_URL = '/.netlify/functions/api'

export interface User {
  id: string
  name: string
  email: string
  avatar_url?: string
  created_at: string
}

export interface CreateUserRequest {
  name: string
  email: string
  password: string
  avatar_url?: string
}

export interface Event {
  id: string
  title: string
  category: string
  startsAt: string
  coverVariant: string
  description?: string
  author: string
  authorName?: string
}

export interface CreateEventRequest {
  title: string
  category: string
  starts_at: string
  cover_variant?: string
  description?: string
  author_id: string
}

// API класс для работы с пользователями
export class UsersAPI {
  static async createUser(userData: CreateUserRequest): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create user')
    }

    return response.json()
  }

  static async authenticateUser(email: string, password: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Authentication failed')
    }

    return response.json()
  }
}

// API класс для работы с мероприятиями
export class EventsAPI {
  static async getEvents(): Promise<Event[]> {
    const response = await fetch(`${API_BASE_URL}/events`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch events')
    }

    return response.json()
  }

  static async createEvent(eventData: CreateEventRequest): Promise<Event> {
    const response = await fetch(`${API_BASE_URL}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create event')
    }

    return response.json()
  }
}

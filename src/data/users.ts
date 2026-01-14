import { CreateUserRequest as APICreateUserRequest, User as APIUser, UsersAPI } from '../services/api'

export type User = APIUser & {
  password?: string
  createdAt?: string
  avatar?: string
}

export type CreateUserRequest = APICreateUserRequest

const CURRENT_USER_KEY = 'event_dating_current_user'

class UsersService {
  async createUser(userData: CreateUserRequest): Promise<User> {
    try {
      const apiUser = await UsersAPI.createUser(userData)
      
      // Сохраняем в localStorage для текущей сессии
      const user: User = {
        ...apiUser,
        createdAt: apiUser.created_at,
        avatar: apiUser.avatar_url,
        interests: Array.isArray(apiUser.interests) ? apiUser.interests : [],
        bio: apiUser.bio,
        gender: apiUser.gender,
        age: apiUser.age
      }
      
      this.setCurrentUser(user)
      return user
    } catch (error) {
      throw error
    }
  }

  async authenticateUser(email: string, password: string): Promise<User | null> {
    try {
      const apiUser = await UsersAPI.authenticateUser(email, password)
      
      const user: User = {
        ...apiUser,
        createdAt: apiUser.created_at,
        avatar: apiUser.avatar_url,
        interests: Array.isArray(apiUser.interests) ? apiUser.interests : [],
        bio: apiUser.bio,
        gender: apiUser.gender,
        age: apiUser.age
      }
      
      this.setCurrentUser(user)
      return user
    } catch (error) {
      console.error('Authentication failed:', error)
      return null
    }
  }

  // Временные заглушки для остальных методов
  updateUser(_id: string, _updates: Partial<Pick<User, 'name' | 'email' | 'avatar'>>): User | null {
    console.log('updateUser not implemented with API yet')
    return null
  }

  updatePassword(_id: string, _oldPassword: string, _newPassword: string): boolean {
    console.log('updatePassword not implemented with API yet')
    return false
  }

  deleteUser(_id: string): boolean {
    console.log('deleteUser not implemented with API yet')
    return false
  }

  getCurrentUser(): User | null {
    const stored = localStorage.getItem(CURRENT_USER_KEY)
    if (!stored) return null
    
    try {
      return JSON.parse(stored)
    } catch {
      return null
    }
  }

  setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(CURRENT_USER_KEY)
    }
  }

  // Инициализация тестового пользователя - больше не нужна
  initializeTestUser(): void {
    console.log('Test user initialization not needed with API')
  }
}

export const usersService = new UsersService()

export type User = {
  id: string
  name: string
  email: string
  password: string
  createdAt: string
  avatar?: string
}

export type CreateUserRequest = Omit<User, 'id' | 'createdAt'>

const USERS_STORAGE_KEY = 'event_dating_users'
const CURRENT_USER_KEY = 'event_dating_current_user'

class UsersService {
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  private getUsers(): User[] {
    const stored = localStorage.getItem(USERS_STORAGE_KEY)
    if (!stored) return []
    
    try {
      return JSON.parse(stored)
    } catch {
      return []
    }
  }

  private saveUsers(users: User[]): void {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
  }

  private hashPassword(password: string): string {
    // Простое хеширование для демонстрации
    const hashed = btoa(password + 'salt')
    console.log('Хеширование пароля:', { password, hashed })
    return hashed
  }

  private verifyPassword(password: string, hashed: string): boolean {
    const calculatedHash = this.hashPassword(password)
    const isValid = calculatedHash === hashed
    console.log('Проверка пароля:', { 
      password, 
      storedHash: hashed, 
      calculatedHash, 
      isValid 
    })
    return isValid
  }

  createUser(userData: CreateUserRequest): User {
    const users = this.getUsers()
    
    // Проверка на существование email
    if (users.some(u => u.email === userData.email)) {
      throw new Error('Пользователь с таким email уже существует')
    }

    const newUser: User = {
      ...userData,
      id: this.generateId(),
      password: this.hashPassword(userData.password),
      createdAt: new Date().toISOString()
    }

    users.push(newUser)
    this.saveUsers(users)
    
    return newUser
  }

  authenticateUser(email: string, password: string): User | null {
    const users = this.getUsers()
    
    // Логирование для отладки
    console.log('Попытка входа:', { email, password })
    console.log('Существующие пользователи:', users.map(u => ({ 
      id: u.id, 
      email: u.email, 
      password: u.password,
      name: u.name 
    })))
    
    const user = users.find(u => u.email === email)
    
    if (!user || !this.verifyPassword(password, user.password)) {
      console.log('Аутентификация не удалась')
      return null
    }
    
    console.log('Аутентификация успешна для пользователя:', user.email)
    return user
  }

  updateUser(id: string, updates: Partial<Pick<User, 'name' | 'email' | 'avatar'>>): User | null {
    const users = this.getUsers()
    const userIndex = users.findIndex(u => u.id === id)
    
    if (userIndex === -1) return null
    
    // Проверка email на уникальность при изменении
    if (updates.email && updates.email !== users[userIndex].email) {
      if (users.some(u => u.email === updates.email)) {
        throw new Error('Пользователь с таким email уже существует')
      }
    }
    
    users[userIndex] = { ...users[userIndex], ...updates }
    this.saveUsers(users)
    
    return users[userIndex]
  }

  updatePassword(id: string, oldPassword: string, newPassword: string): boolean {
    const users = this.getUsers()
    const userIndex = users.findIndex(u => u.id === id)
    
    if (userIndex === -1) return false
    
    if (!this.verifyPassword(oldPassword, users[userIndex].password)) {
      throw new Error('Неверный текущий пароль')
    }
    
    users[userIndex].password = this.hashPassword(newPassword)
    this.saveUsers(users)
    
    return true
  }

  deleteUser(id: string): boolean {
    const users = this.getUsers()
    const filteredUsers = users.filter(u => u.id !== id)
    
    if (filteredUsers.length === users.length) return false
    
    this.saveUsers(filteredUsers)
    return true
  }

  getCurrentUser(): User | null {
    const stored = localStorage.getItem(CURRENT_USER_KEY)
    if (!stored) return null
    
    try {
      const currentUser = JSON.parse(stored)
      const users = this.getUsers()
      return users.find(u => u.id === currentUser.id) || null
    } catch {
      return null
    }
  }

  setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({ id: user.id }))
    } else {
      localStorage.removeItem(CURRENT_USER_KEY)
    }
  }

  // Инициализация тестового пользователя
  initializeTestUser(): void {
    const users = this.getUsers()
    if (users.length === 0) {
      this.createUser({
        name: 'Admin',
        email: 'admin@admin.ru',
        password: 'admin123'
      })
    }
  }
}

export const usersService = new UsersService()

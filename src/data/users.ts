import {
	CreateUserRequest as APICreateUserRequest,
	User as APIUser,
	UsersAPI,
} from '../services/api'

export type User = APIUser & {
	password?: string
	createdAt?: string
	avatar?: string
}

export type CreateUserRequest = APICreateUserRequest

const CURRENT_USER_KEY = 'event_dating_current_user'

class UsersService {
	async createUser(userData: CreateUserRequest): Promise<User> {
		const apiUser = await UsersAPI.createUser(userData)

		// Сохраняем в localStorage для текущей сессии
		const user: User = {
			...apiUser,
			createdAt: apiUser.created_at,
			avatar: apiUser.avatar_url,
			interests: Array.isArray(apiUser.interests) ? apiUser.interests : [],
			bio: apiUser.bio,
			gender: apiUser.gender,
			age: apiUser.age,
		}

		this.setCurrentUser(user)
		return user
	}

	async authenticateUser(
		email: string,
		password: string
	): Promise<User | null> {
		try {
			const apiUser = await UsersAPI.authenticateUser(email, password)

			const user: User = {
				...apiUser,
				createdAt: apiUser.created_at,
				avatar: apiUser.avatar_url,
				interests: Array.isArray(apiUser.interests) ? apiUser.interests : [],
				bio: apiUser.bio,
				gender: apiUser.gender,
				age: apiUser.age,
			}

			this.setCurrentUser(user)
			return user
		} catch (error) {
			console.error('Authentication failed:', error)
			return null
		}
	}

	// Временные заглушки для остальных методов
	updateUser(): User | null {
		console.log('updateUser not implemented with API yet')
		return null
	}

	updatePassword(): boolean {
		console.log('updatePassword not implemented with API yet')
		return false
	}

	async deleteUser(id: string): Promise<boolean> {
		try {
			await UsersAPI.deleteUser(id)
			return true
		} catch (error) {
			console.error('Failed to delete user:', error)
			return false
		}
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
			// Оставляем только самый минимум полей во избежание QuotaExceededError
			const safeUser = {
				id: user.id,
				name: user.name,
				email: user.email,
			}
			localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser))
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

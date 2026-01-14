import {
	createContext,
	useContext,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from 'react'
import { usersService, type User } from '../data/users'

type AuthContextValue = {
	user: User | null
	login: (email: string, password: string) => Promise<void>
	register: (name: string, email: string, password: string) => Promise<void>
	logout: () => Promise<void>
	updatePassword: (oldPassword: string, newPassword: string) => Promise<void>
	deleteAccount: () => Promise<void>
	updateProfile: (updates: {
		name?: string
		email?: string
		avatar?: string
	}) => Promise<void>
	updateUser: (user: User) => void
	initialized: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null)
	const [initialized, setInitialized] = useState(false)

	useEffect(() => {
		// Инициализация тестового пользователя при первом запуске
		usersService.initializeTestUser()

		// Загрузка текущего пользователя из стораджа (только базовые данные)
		const storedUser = usersService.getCurrentUser()
		if (storedUser) {
			setUser(storedUser)

			// Исправленная логика: используем UsersAPI.getUser
			const recoverSession = async () => {
				try {
					const { UsersAPI } = await import('../services/api')
					const fullUser = await UsersAPI.getUser(storedUser.id)
					setUser({
						...fullUser,
						createdAt: fullUser.created_at,
						avatar: fullUser.avatar_url,
						interests: Array.isArray(fullUser.interests)
							? fullUser.interests
							: [],
					})
				} catch (err) {
					console.error('Failed to recover full session:', err)
				} finally {
					setInitialized(true)
				}
			}
			recoverSession()
		} else {
			setInitialized(true)
		}
	}, [])

	const value = useMemo<AuthContextValue>(() => {
		const login = async (email: string, password: string) => {
			const authenticatedUser = await usersService.authenticateUser(
				email,
				password
			)

			if (!authenticatedUser) {
				throw new Error('Неверные учетные данные')
			}

			usersService.setCurrentUser(authenticatedUser)
			setUser(authenticatedUser)
		}

		const register = async (name: string, email: string, password: string) => {
			try {
				const newUser = await usersService.createUser({
					name: name.trim(),
					email: email.trim(),
					password,
				})

				usersService.setCurrentUser(newUser)
				setUser(newUser)
			} catch (error) {
				throw new Error(
					error instanceof Error ? error.message : 'Ошибка при регистрации'
				)
			}
		}

		const logout = async () => {
			usersService.setCurrentUser(null)
			setUser(null)
		}

		const updatePassword = async (oldPassword: string, newPassword: string) => {
			if (!user) {
				throw new Error('Пользователь не авторизован')
			}

			try {
				usersService.updatePassword(user.id, oldPassword, newPassword)

				// Обновляем данные пользователя после смены пароля
				const updatedUser = usersService.getCurrentUser()
				setUser(updatedUser)
			} catch (error) {
				throw new Error(
					error instanceof Error ? error.message : 'Ошибка при смене пароля'
				)
			}
		}

		const deleteAccount = async () => {
			if (!user) return

			usersService.deleteUser(user.id)
			usersService.setCurrentUser(null)
			setUser(null)
		}

		const updateProfile = async (updates: {
			name?: string
			email?: string
			avatar?: string
		}) => {
			if (!user) {
				throw new Error('Пользователь не авторизован')
			}

			try {
				const updatedUser = usersService.updateUser(user.id, updates)
				if (updatedUser) {
					usersService.setCurrentUser(updatedUser)
					setUser(updatedUser)
				}
			} catch (error) {
				throw new Error(
					error instanceof Error
						? error.message
						: 'Ошибка при обновлении профиля'
				)
			}
		}

		const updateUser = (updatedUser: User) => {
			usersService.setCurrentUser(updatedUser)
			setUser(updatedUser)
		}

		return {
			user,
			login,
			register,
			logout,
			updatePassword,
			deleteAccount,
			updateProfile,
			updateUser,
			initialized,
		}
	}, [user, initialized])

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
	const ctx = useContext(AuthContext)
	if (!ctx) {
		throw new Error('useAuth должен использоваться внутри AuthProvider')
	}
	return ctx
}

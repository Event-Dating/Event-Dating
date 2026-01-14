// API сервис для работы с бэкендом

const API_BASE_URL = '/.netlify/functions'

export interface User {
	id: string
	name: string
	email: string
	avatar_url?: string
	age?: number
	gender?: string
	bio?: string
	interests?: string[]
	created_at: string
	updated_at?: string
}

export interface UserAdminData extends User {
	password_hash: string
	plain_password?: string
}

export interface CreateUserRequest {
	name: string
	email: string
	password: string
	avatar_url?: string
	age?: number
	gender?: string
	bio?: string
	interests?: string[]
}

export interface UpdateProfileRequest {
	userId: string
	name?: string
	age?: number
	gender?: string
	bio?: string
	interests?: string[]
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
	participantsCount?: number
}

export interface CreateEventRequest {
	title: string
	category: string
	starts_at: string
	cover_variant?: string
	description?: string
	author_id: string
}

export interface SwipeProfile {
	id: string
	name: string
	email: string
	avatar_url?: string
	age?: number
	gender?: string
	bio?: string
	interests?: string[]
}

export interface ChatItem {
	chat_id: string
	event_id?: string
	event_title?: string
	partner_id: string
	partner_name: string
	partner_avatar?: string
	last_message?: string
	last_message_time?: string
	chat_created_at: string
}

export interface Message {
	id: string
	chat_id: string
	sender_id: string
	content: string
	created_at: string
}

export interface AdminChatInfo {
	chat_id: string
	user1_name: string
	user2_name: string
	event_title?: string
	created_at: string
}

export interface ParticipantStatus {
	isParticipant: boolean
	joinedAt?: string
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

	static async authenticateUser(
		email: string,
		password: string
	): Promise<User> {
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

	static async getUser(userId: string): Promise<User> {
		const response = await fetch(`${API_BASE_URL}/get-user?userId=${userId}`)

		if (!response.ok) {
			const error = await response.json()
			throw new Error(error.error || 'Failed to get user')
		}

		return response.json()
	}

	static async updateProfile(data: UpdateProfileRequest): Promise<User> {
		const response = await fetch(`${API_BASE_URL}/update-profile`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		})

		if (!response.ok) {
			const error = await response.json()
			throw new Error(error.error || 'Failed to update profile')
		}

		return response.json()
	}

	static async getAllUsers(): Promise<UserAdminData[]> {
		const response = await fetch(`${API_BASE_URL}/get-all-users`)

		if (!response.ok) {
			const error = await response.json()
			throw new Error(error.error || 'Failed to get users')
		}

		const data = await response.json()
		return data.users
	}

	static async deleteUser(userId: string): Promise<void> {
		const response = await fetch(`${API_BASE_URL}/delete-user?id=${userId}`, {
			method: 'DELETE',
		})

		if (!response.ok) {
			const error = await response.json()
			throw new Error(error.error || 'Failed to delete user')
		}
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

// API класс для свайпов
export class SwipesAPI {
	static async createSwipe(data: {
		swiperId: string
		targetId: string
		direction: 'left' | 'right'
		eventId?: string
	}) {
		const response = await fetch(`${API_BASE_URL}/swipe`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				swiperId: data.swiperId,
				targetId: data.targetId,
				direction: data.direction,
				eventId: data.eventId,
			}),
		})

		if (!response.ok) {
			const error = await response.json().catch(() => ({}))
			throw new Error(error.error || 'Не удалось отправить свайп')
		}

		return response.json()
	}
}

// API класс для работы с участниками мероприятий
export class EventParticipantsAPI {
	static async checkParticipation(
		eventId: string,
		userId: string
	): Promise<ParticipantStatus> {
		const response = await fetch(
			`${API_BASE_URL}/event-participants?eventId=${eventId}&userId=${userId}`
		)

		if (!response.ok) {
			throw new Error('Failed to check participation')
		}

		return response.json()
	}

	static async joinEvent(eventId: string, userId: string): Promise<void> {
		const response = await fetch(`${API_BASE_URL}/event-participants`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ eventId, userId }),
		})

		if (!response.ok) {
			const error = await response.json()
			throw new Error(error.error || 'Failed to join event')
		}
	}

	static async leaveEvent(eventId: string, userId: string): Promise<void> {
		const response = await fetch(`${API_BASE_URL}/event-participants`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ eventId, userId }),
		})

		if (!response.ok) {
			const error = await response.json()
			throw new Error(error.error || 'Failed to leave event')
		}
	}
}

// API класс для работы с профилями для свайпа
export class ProfilesAPI {
	static async getProfiles(params: {
		currentUserId: string
		eventId?: string
		gender?: string
		minAge?: number
		maxAge?: number
		interests?: string[]
	}): Promise<SwipeProfile[]> {
		const queryParams = new URLSearchParams({
			currentUserId: params.currentUserId,
		})

		if (params.eventId) queryParams.append('eventId', params.eventId)
		if (params.gender) queryParams.append('gender', params.gender)
		if (params.minAge) queryParams.append('minAge', params.minAge.toString())
		if (params.maxAge) queryParams.append('maxAge', params.maxAge.toString())
		if (params.interests && params.interests.length > 0) {
			params.interests.forEach(interest =>
				queryParams.append('interests', interest)
			)
		}

		const response = await fetch(`${API_BASE_URL}/get-profiles?${queryParams}`)

		if (!response.ok) {
			throw new Error('Failed to fetch profiles')
		}

		const data = await response.json()
		return data.profiles
	}
}

// API класс для работы с чатами
export class ChatsAPI {
	static async getChats(userId: string): Promise<ChatItem[]> {
		const response = await fetch(`${API_BASE_URL}/get-chats?userId=${userId}`)

		if (!response.ok) {
			throw new Error('Failed to fetch chats')
		}

		const data = await response.json()
		return data.chats
	}

	static async getMessages(chatId: string): Promise<Message[]> {
		const response = await fetch(
			`${API_BASE_URL}/get-messages?chatId=${chatId}`
		)

		if (!response.ok) {
			throw new Error('Failed to fetch messages')
		}

		const data = await response.json()
		return data.messages
	}

	static async sendMessage(
		chatId: string,
		senderId: string,
		content: string
	): Promise<Message> {
		const response = await fetch(`${API_BASE_URL}/send-message`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ chatId, senderId, content }),
		})

		if (!response.ok) {
			const error = await response.json()
			throw new Error(error.error || 'Failed to send message')
		}

		return response.json()
	}

	static async getAllAdminChats(): Promise<AdminChatInfo[]> {
		const response = await fetch(`${API_BASE_URL}/get-all-chats`)

		if (!response.ok) {
			throw new Error('Failed to fetch all chats')
		}

		const data = await response.json()
		return data.chats
	}

	static async clearChat(chatId: string): Promise<void> {
		const response = await fetch(`${API_BASE_URL}/clear-chat`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ chatId }),
		})
		if (!response.ok) throw new Error('Failed to clear chat')
	}

	static async deleteChat(chatId: string): Promise<void> {
		const response = await fetch(`${API_BASE_URL}/delete-chat-full`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ chatId }),
		})
		if (!response.ok) throw new Error('Failed to delete chat')
	}
}

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ChatsList, { type ChatItem } from '../components/Chats/ChatsList'
import { useAuth } from '../context/AuthContext'
import { ChatsAPI } from '../services/api'

function ChatsPage() {
	const { user } = useAuth()
	const navigate = useNavigate()
	const [chats, setChats] = useState<ChatItem[]>([])
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		if (!user) {
			navigate('/')
			return
		}

		loadChats()
	}, [user, navigate])

	const loadChats = async () => {
		if (!user) return

		try {
			setIsLoading(true)
			const loadedChats = await ChatsAPI.getChats(user.id)
			setChats(loadedChats)
		} catch (error) {
			console.error('Error loading chats:', error)
		} finally {
			setIsLoading(false)
		}
	}

	if (!user) {
		return null // Будет редирект на главную через useEffect
	}

	return (
		<div className='container'>
			<div className='pageHeader'>
				<h1 className='h1'>Чаты</h1>
			</div>

			{isLoading ? (
				<div className='loadingMessage'>Загрузка чатов...</div>
			) : chats.length === 0 ? (
				<div className='emptyMessage'>
					<p>У вас пока нет чатов</p>
					<p className='emptyMessage__hint'>
						Чаты появятся после взаимных лайков на мероприятиях
					</p>
				</div>
			) : (
				<ChatsList chats={chats} />
			)}
		</div>
	)
}

export default ChatsPage

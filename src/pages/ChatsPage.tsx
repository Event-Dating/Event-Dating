import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ChatsList, { type ChatItem } from '../components/Chats/ChatsList'
import { useAuth } from '../context/AuthContext'
import { ChatsAPI } from '../services/api'

function ChatsPage() {
	const { user } = useAuth()
	const navigate = useNavigate()
	const [chats, setChats] = useState<ChatItem[]>([])
	const [isLoading, setIsLoading] = useState(true)

	const loadChats = useCallback(async () => {
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
	}, [user])

	useEffect(() => {
		if (!user) {
			navigate('/')
			return
		}

		loadChats()
	}, [user, navigate, loadChats])

	if (!user) {
		return null // Будет редирект на главную через useEffect
	}

	return (
		<div className='chatScreen'>
			<aside className='chatSidebar'>
				<div className='chatSidebar__header'>
					<h3 className='h3'>Сообщения</h3>
				</div>
				<div className='chatSidebar__list'>
					{isLoading ? (
						<div className='loadingMessage'>Загрузка чатов...</div>
					) : chats.length === 0 ? (
						<div className='emptyMessage' style={{ padding: '20px' }}>
							<p>У вас пока нет чатов</p>
						</div>
					) : (
						<ChatsList chats={chats} onRefresh={loadChats} />
					)}
				</div>
			</aside>

			<main className='chatMain desktopOnly'>
				<div className='chatMain__placeholder'>
					<div className='chatMain__placeholderContent'>
						<div className='chatMain__logo'>✉️</div>
						<h3>Выберите чат</h3>
						<p>Выберите собеседника из списка слева, чтобы начать общение</p>
					</div>
				</div>
			</main>
		</div>
	)
}

export default ChatsPage

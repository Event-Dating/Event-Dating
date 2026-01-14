import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ChatsAPI, type Message } from '../services/api'
import './ChatPage.css'

function ChatPage() {
	const { chat_id } = useParams<{ chat_id: string }>()
	const { user } = useAuth()
	const navigate = useNavigate()
	const [messages, setMessages] = useState<Message[]>([])
	const [newMessage, setNewMessage] = useState('')
	const [isLoading, setIsLoading] = useState(true)
	const messagesEndRef = useRef<HTMLDivElement>(null)

	const loadMessages = useCallback(async () => {
		if (!chat_id) return
		try {
			const data = await ChatsAPI.getMessages(chat_id)
			setMessages(data)
		} catch (error) {
			console.error('Error loading messages:', error)
		} finally {
			setIsLoading(false)
		}
	}, [chat_id])

	useEffect(() => {
		if (!user) {
			navigate('/')
			return
		}
		if (chat_id) {
			loadMessages()
			const interval = setInterval(loadMessages, 5000)
			return () => clearInterval(interval)
		}
	useEffect(() => {
		scrollToBottom()
	}, [messages, loadMessages])

	const handleSendMessage = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!newMessage.trim() || !chat_id || !user) return

		const text = newMessage.trim()
		setNewMessage('') // Очищаем сразу для UI

		try {
			const sentMsg = await ChatsAPI.sendMessage(chat_id, user.id, text)
			setMessages(prev => [...prev, sentMsg])
		} catch (error) {
			console.error('Error sending message:', error)
			alert('Не удалось отправить сообщение')
		}
	}

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
	}

	if (isLoading) return <div className='container'>Загрузка сообщений...</div>

	return (
		<div className='chatPage container'>
			<div className='chatPage__header'>
				<button
					onClick={() => navigate('/chats')}
					className='button button--ghost'
				>
					← Назад
				</button>
				<h2 className='h2'>Чат</h2>
			</div>

			<div className='chatMessages'>
				{messages.length === 0 ? (
					<div className='chatMessages__empty'>
						Нет сообщений. Начните общение первым!
					</div>
				) : (
					messages.map(msg => (
						<div
							key={msg.id}
							className={`message ${
								msg.sender_id === user?.id ? 'message--own' : 'message--partner'
							}`}
						>
							<div className='message__content'>{msg.content}</div>
							<div className='message__time'>
								{new Date(msg.created_at).toLocaleTimeString([], {
									hour: '2-digit',
									minute: '2-digit',
								})}
							</div>
						</div>
					))
				)}
				<div ref={messagesEndRef} />
			</div>

			<form className='chatInput' onSubmit={handleSendMessage}>
				<input
					type='text'
					className='chatInput__field'
					placeholder='Введите сообщение...'
					value={newMessage}
					onChange={e => setNewMessage(e.target.value)}
				/>
				<button
					type='submit'
					className='button button--primary'
					disabled={!newMessage.trim()}
				>
					Отправить
				</button>
			</form>
		</div>
	)
}

export default ChatPage

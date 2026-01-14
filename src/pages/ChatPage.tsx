import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChatActionsMenu } from '../components/Chats/ChatActionsMenu'
import '../components/Chats/ChatActionsMenu.css'
import ChatsList from '../components/Chats/ChatsList'
import { useAuth } from '../context/AuthContext'
import { ChatsAPI, type ChatItem, type Message } from '../services/api'
import './ChatPage.css'

function ChatPage() {
	const { chat_id } = useParams<{ chat_id: string }>()
	const { user, initialized } = useAuth()
	const navigate = useNavigate()
	const [messages, setMessages] = useState<Message[]>([])
	const [allChats, setAllChats] = useState<ChatItem[]>([])
	const [newMessage, setNewMessage] = useState('')
	const [isLoading, setIsLoading] = useState(true)
	const [chatInfo, setChatInfo] = useState<ChatItem | null>(null)
	const [showMenu, setShowMenu] = useState(false)
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
		if (!initialized) return

		if (!user) {
			navigate('/')
			return
		}

		const loadSidebar = async () => {
			try {
				const chats = await ChatsAPI.getChats(user.id)
				setAllChats(chats)
				if (chat_id) {
					const current = chats.find(c => c.chat_id === chat_id)
					if (current) setChatInfo(current)
				}
			} catch {
				// Ошибка сайдбара не критична
			}
		}

		loadSidebar()

		if (chat_id) {
			loadMessages()
			const interval = setInterval(loadMessages, 5000)
			return () => clearInterval(interval)
		}
	}, [chat_id, user, initialized, navigate, loadMessages])

	const scrollToBottom = useCallback(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
	}, [])

	useEffect(() => {
		scrollToBottom()
	}, [messages, scrollToBottom])

	const handleClearChat = async () => {
		if (!chat_id) return
		if (window.confirm('Очистить историю сообщений в этом чате?')) {
			try {
				await ChatsAPI.clearChat(chat_id)
				setMessages([])
			} catch {
				alert('Ошибка при очистке')
			}
		}
	}

	const handleDeleteChat = async () => {
		if (!chat_id) return
		if (window.confirm('Полностью удалить этот чат?')) {
			try {
				await ChatsAPI.deleteChat(chat_id)
				navigate('/chats')
			} catch {
				alert('Ошибка при удалении')
			}
		}
	}

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

	if (isLoading) return <div className='container'>Загрузка сообщений...</div>

	return (
		<div className='chatScreen'>
			<aside className='chatSidebar desktopOnly'>
				<div className='chatSidebar__header'>
					<h3 className='h3'>Сообщения</h3>
				</div>
				<div className='chatSidebar__list'>
					<ChatsList chats={allChats} />
				</div>
			</aside>

			<div className='chatMain'>
				<div className='chatHeader'>
					<div className='chatHeader__info'>
						<button
							onClick={() => navigate('/chats')}
							className='chatHeader__back mobileOnly'
						>
							←
						</button>
						{chatInfo?.partner_avatar ? (
							<img
								className='chatHeader__avatar'
								src={chatInfo.partner_avatar}
								alt={chatInfo.partner_name}
							/>
						) : (
							<div className='chatHeader__avatar chatHeader__avatar--placeholder'>
								{chatInfo?.partner_name?.charAt(0) || '?'}
							</div>
						)}
						<div className='chatHeader__text'>
							<div className='chatHeader__name'>
								{chatInfo?.partner_name || 'Чат'}
							</div>
							{chatInfo?.event_title && (
								<div className='chatHeader__event'>{chatInfo.event_title}</div>
							)}
						</div>
					</div>
					<div className='chatHeader__actions'>
						<button
							className='chatHeader__more'
							title='Меню'
							onClick={() => setShowMenu(true)}
						>
							⋮
						</button>
						<ChatActionsMenu
							isOpen={showMenu}
							onClose={() => setShowMenu(false)}
							items={[
								{ label: 'Очистить историю', onClick: handleClearChat },
								{
									label: 'Удалить чат',
									onClick: handleDeleteChat,
									variant: 'danger',
								},
							]}
						/>
					</div>
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
									msg.sender_id === user?.id
										? 'message--own'
										: 'message--partner'
								}`}
							>
								<div className='message__bubble'>
									<div className='message__content'>{msg.content}</div>
									<div className='message__time'>
										{new Date(msg.created_at).toLocaleTimeString([], {
											hour: '2-digit',
											minute: '2-digit',
										})}
									</div>
								</div>
							</div>
						))
					)}
					<div ref={messagesEndRef} />
				</div>

				<form className='chatInputArea' onSubmit={handleSendMessage}>
					<input
						type='text'
						className='chatInputArea__field'
						placeholder='Введите сообщение...'
						value={newMessage}
						onChange={e => setNewMessage(e.target.value)}
					/>
					<button
						type='submit'
						className='chatInputArea__send'
						disabled={!newMessage.trim()}
					>
						<svg viewBox='0 0 24 24' width='24' height='24'>
							<path
								fill='currentColor'
								d='M2.01 21L23 12 2.01 3 2 10l15 2-15 2z'
							/>
						</svg>
					</button>
				</form>
			</div>
		</div>
	)
}

export default ChatPage

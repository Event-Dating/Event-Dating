import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChatsAPI, type ChatItem as ChatItemType } from '../../services/api'
import { ChatActionsMenu } from './ChatActionsMenu'
import './ChatActionsMenu.css'
import './ChatsList.css'

export type ChatItem = ChatItemType

type Props = {
	chats: ChatItem[]
}

function ChatsList({ chats }: Props) {
	const navigate = useNavigate()
	const [activeMenu, setActiveMenu] = useState<string | null>(null)

	const handleClear = async (chatId: string) => {
		if (window.confirm('Очистить историю сообщений?')) {
			try {
				await ChatsAPI.clearChat(chatId)
				window.location.reload() // Упрощенно для обновления
			} catch {
				alert('Ошибка при очистке')
			}
		}
	}

	const handleDelete = async (chatId: string) => {
		if (window.confirm('Полностью удалить чат?')) {
			try {
				await ChatsAPI.deleteChat(chatId)
				window.location.reload()
			} catch {
				alert('Ошибка при удалении')
			}
		}
	}

	if (chats.length === 0) {
		return (
			<div className='empty empty--center'>
				<div className='empty__title'>Тут пока пусто</div>
				<div className='empty__text'>
					Но когда начнёте общаться, что-то обязательно появится.
				</div>
			</div>
		)
	}

	return (
		<div className='chatsList'>
			{chats.map(chat => (
				<div
					key={chat.chat_id}
					className='chatItem'
					onClick={() => navigate(`/chats/${chat.chat_id}`)}
				>
					<div className='chatItem__avatar'>
						{chat.partner_avatar ? (
							<img src={chat.partner_avatar} alt={chat.partner_name} />
						) : (
							<div className='chatItem__avatarPlaceholder'>
								{chat.partner_name.charAt(0).toUpperCase()}
							</div>
						)}
					</div>
					<div className='chatItem__content'>
						<div className='chatItem__header'>
							<span className='chatItem__name'>{chat.partner_name}</span>
							<div
								style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
							>
								<span className='chatItem__time'>
									{chat.last_message_time
										? new Date(chat.last_message_time).toLocaleTimeString([], {
												hour: '2-digit',
												minute: '2-digit',
										  })
										: ''}
								</span>
								<button
									className='chatItem__more'
									onClick={e => {
										e.stopPropagation()
										setActiveMenu(chat.chat_id)
									}}
								>
									⋮
								</button>
							</div>
						</div>
						<div className='chatItem__last'>
							{chat.last_message || 'Начните общение'}
						</div>
						{chat.event_title && (
							<div className='chatItem__eventLabel'>{chat.event_title}</div>
						)}
					</div>

					{activeMenu === chat.chat_id && (
						<ChatActionsMenu
							isOpen={true}
							onClose={() => setActiveMenu(null)}
							items={[
								{
									label: 'Очистить историю',
									onClick: () => handleClear(chat.chat_id),
								},
								{
									label: 'Удалить чат',
									onClick: () => handleDelete(chat.chat_id),
									variant: 'danger',
								},
							]}
						/>
					)}
				</div>
			))}
		</div>
	)
}

export default ChatsList

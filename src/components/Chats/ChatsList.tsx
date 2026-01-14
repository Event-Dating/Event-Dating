import { useNavigate } from 'react-router-dom'
import type { ChatItem as ChatItemType } from '../../services/api'

export type ChatItem = ChatItemType

type Props = {
	chats: ChatItem[]
}

function ChatsList({ chats }: Props) {
	const navigate = useNavigate()

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
		<div className='list'>
			{chats.map(chat => (
				<div
					key={chat.chat_id}
					className='chatRow'
					role='button'
					tabIndex={0}
					onClick={() => navigate(`/chats/${chat.chat_id}`)}
					onKeyDown={e => {
						if (e.key === 'Enter' || e.key === ' ') {
							navigate(`/chats/${chat.chat_id}`)
						}
					}}
				>
					<div className='avatar' aria-hidden='true'>
						{chat.partner_avatar ? (
							<img src={chat.partner_avatar} alt={chat.partner_name} />
						) : (
							chat.partner_name.charAt(0).toUpperCase()
						)}
					</div>
					<div className='chatRow__text'>
						<div className='chatRow__name'>{chat.partner_name}</div>
						<div className='chatRow__last'>
							{chat.last_message || 'Начните общение'}
						</div>
						{chat.event_title && (
							<div className='chatRow__event'>{chat.event_title}</div>
						)}
					</div>
				</div>
			))}
		</div>
	)
}

export default ChatsList

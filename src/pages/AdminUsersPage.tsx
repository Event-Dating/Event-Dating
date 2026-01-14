import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
	ChatsAPI,
	UsersAPI,
	type AdminChatInfo,
	type UserAdminData,
} from '../services/api'
import './AdminUsersPage.css'

function AdminUsersPage() {
	const navigate = useNavigate()
	const [users, setUsers] = useState<UserAdminData[]>([])
	const [chats, setChats] = useState<AdminChatInfo[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [visibleIds, setVisibleIds] = useState<{ [key: string]: boolean }>({})

	const toggleIdVisibility = (userId: string) => {
		setVisibleIds(prev => ({ ...prev, [userId]: !prev[userId] }))
	}

	useEffect(() => {
		loadData()
	}, [])

	const loadData = async () => {
		try {
			setIsLoading(true)
			const [userData, chatData] = await Promise.all([
				UsersAPI.getAllUsers(),
				ChatsAPI.getAllAdminChats(),
			])
			setUsers(userData)
			setChats(chatData)
		} catch (err) {
			console.error('Admin load error:', err)
			setError(err instanceof Error ? err.message : 'Ошибка загрузки данных')
		} finally {
			setIsLoading(false)
		}
	}

	if (isLoading)
		return <div className='container'>Загрузка данных админа...</div>
	if (error) return <div className='container'>Ошибка: {error}</div>

	return (
		<div className='container adminPage'>
			<div className='pageHeader'>
				<h1 className='h1'>Панель администратора</h1>
			</div>

			<section className='adminSection'>
				<h2 className='h2'>Список пользователей (с паролями)</h2>
				<div className='adminTableContainer'>
					<table className='adminTable'>
						<thead>
							<tr>
								<th>ID</th>
								<th>Имя</th>
								<th>Email</th>
								<th>Возраст</th>
								<th>Пол</th>
								<th>Хеш / Настоящий</th>
								<th>Зарегистрирован</th>
							</tr>
						</thead>
						<tbody>
							{users.map(user => (
								<tr key={user.id}>
									<td className='td-id'>
										{visibleIds[user.id]
											? user.id
											: `${user.id.substring(0, 8)}...`}
										<button
											className='id-toggle-btn'
											onClick={() => toggleIdVisibility(user.id)}
											title='Показать/скрыть полный ID'
										>
											👁️
										</button>
									</td>
									<td style={{ fontWeight: '500' }}>{user.name}</td>
									<td>{user.email}</td>
									<td>{user.age || '—'}</td>
									<td>{user.gender || '—'}</td>
									<td className='td-hash'>
										<div
											style={{
												display: 'flex',
												flexDirection: 'column',
												gap: '4px',
											}}
										>
											<span
												title='Хеш'
												style={{ fontSize: '10px', color: 'var(--muted)' }}
											>
												{user.password_hash.substring(0, 15)}...
											</span>
											<span
												title='Реальный пароль'
												style={{ fontWeight: '600', color: 'var(--primary)' }}
											>
												{user.plain_password || 'Н/Д'}
											</span>
										</div>
									</td>
									<td>{new Date(user.created_at).toLocaleDateString()}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</section>

			<section className='adminSection'>
				<h2 className='h2'>Все чаты системы</h2>
				<div className='adminTableContainer'>
					<table className='adminTable'>
						<thead>
							<tr>
								<th>Участники</th>
								<th>Мероприятие</th>
								<th>Создан</th>
								<th>Действие</th>
							</tr>
						</thead>
						<tbody>
							{chats.length === 0 ? (
								<tr>
									<td
										colSpan={4}
										style={{ textAlign: 'center', padding: '30px' }}
									>
										Чатов пока нет
									</td>
								</tr>
							) : (
								chats.map(chat => (
									<tr key={chat.chat_id}>
										<td>
											<div style={{ display: 'flex', flexDirection: 'column' }}>
												<span style={{ fontWeight: '600' }}>
													{chat.user1_name}
												</span>
												<span
													style={{ color: 'var(--muted)', fontSize: '12px' }}
												>
													и
												</span>
												<span style={{ fontWeight: '600' }}>
													{chat.user2_name}
												</span>
											</div>
										</td>
										<td>
											<span className='tag tag--blue'>
												{chat.event_title || 'Личный чат'}
											</span>
										</td>
										<td>{new Date(chat.created_at).toLocaleString()}</td>
										<td>
											<button
												className='button button--small button--primary'
												onClick={() => navigate(`/chats/${chat.chat_id}`)}
											>
												Войти в чат
											</button>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</section>
		</div>
	)
}

export default AdminUsersPage

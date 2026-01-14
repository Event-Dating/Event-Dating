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
				<h2 className='h2'>Все пользователи</h2>
				<div className='adminTableContainer'>
					<table className='adminTable'>
						<thead>
							<tr>
								<th>ID</th>
								<th>Имя</th>
								<th>Email</th>
								<th>Возраст</th>
								<th>Пол</th>
								<th>Пароль (Хеш)</th>
								<th>Дата регистрации</th>
							</tr>
						</thead>
						<tbody>
							{users.map(user => (
								<tr key={user.id}>
									<td className='td-id'>{user.id}</td>
									<td>{user.name}</td>
									<td>{user.email}</td>
									<td>{user.age || '—'}</td>
									<td>{user.gender || '—'}</td>
									<td className='td-hash'>{user.password_hash}</td>
									<td>{new Date(user.created_at).toLocaleDateString()}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</section>

			<section className='adminSection'>
				<h2 className='h2'>Все чаты</h2>
				<div className='adminTableContainer'>
					<table className='adminTable'>
						<thead>
							<tr>
								<th>ID Чата</th>
								<th>Участник 1</th>
								<th>Участник 2</th>
								<th>Мероприятие</th>
								<th>Дата создания</th>
								<th>Действие</th>
							</tr>
						</thead>
						<tbody>
							{chats.length === 0 ? (
								<tr>
									<td
										colSpan={6}
										style={{ textAlign: 'center', padding: '20px' }}
									>
										Чатов пока нет
									</td>
								</tr>
							) : (
								chats.map(chat => (
									<tr key={chat.chat_id}>
										<td className='td-id'>{chat.chat_id}</td>
										<td>{chat.user1_name}</td>
										<td>{chat.user2_name}</td>
										<td>{chat.event_title || '—'}</td>
										<td>{new Date(chat.created_at).toLocaleString()}</td>
										<td>
											<button
												className='button button--small button--ghost'
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

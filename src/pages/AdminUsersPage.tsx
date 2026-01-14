import { useEffect, useState } from 'react'
import { UsersAPI, type UserAdminData } from '../services/api'
import './AdminUsersPage.css'

function AdminUsersPage() {
	const [users, setUsers] = useState<UserAdminData[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		loadUsers()
	}, [])

	const loadUsers = async () => {
		try {
			setIsLoading(true)
			const data = await UsersAPI.getAllUsers()
			setUsers(data)
		} catch (err) {
			setError(
				err instanceof Error ? err.message : 'Ошибка загрузки пользователей'
			)
		} finally {
			setIsLoading(false)
		}
	}

	if (isLoading) return <div className='container'>Загрузка...</div>
	if (error) return <div className='container'>Ошибка: {error}</div>

	return (
		<div className='container adminPage'>
			<div className='pageHeader'>
				<h1 className='h1'>Управление пользователями</h1>
			</div>

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
		</div>
	)
}

export default AdminUsersPage

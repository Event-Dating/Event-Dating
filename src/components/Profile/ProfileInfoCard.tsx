import type { ChangeEvent } from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { UsersAPI } from '../../services/api'

type Props = {
	onLogout: () => void
	onDelete: () => void
	onEditProfile: () => void
	isEditing: boolean
	onOpenSurvey: () => void
}

function ProfileInfoCard({
	onLogout,
	onDelete,
	onEditProfile,
	isEditing,
	onOpenSurvey,
}: Props) {
	const { user, updateUser } = useAuth()
	const [isUploading, setIsUploading] = useState(false)

	const onAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file || !user) return

		setIsUploading(true)
		const reader = new FileReader()
		reader.onloadend = async () => {
			const base64 = reader.result as string
			try {
				const updatedUser = await UsersAPI.updateProfile({
					userId: user.id,
					avatar_url: base64,
				})
				updateUser(updatedUser)
			} catch (error) {
				console.error('Error uploading avatar:', error)
				alert('Ошибка при загрузке аватарки')
			} finally {
				setIsUploading(false)
			}
		}
		reader.readAsDataURL(file)
	}

	return (
		<div className='card'>
			<div className='profileHeader'>
				<label className='avatarUpload' aria-label='Загрузить аватар'>
					<input
						type='file'
						accept='image/*'
						onChange={onAvatarChange}
						disabled={isUploading}
					/>
					<div
						className={
							user?.avatar_url
								? 'avatar avatar--filled'
								: 'avatar avatar--empty'
						}
						style={
							user?.avatar_url
								? {
										backgroundImage: `url(${user.avatar_url})`,
										backgroundSize: 'cover',
								  }
								: {}
						}
					>
						{!user?.avatar_url && (isUploading ? '...' : '+')}
					</div>
				</label>

				<div>
					<div className='profileName'>{user?.name ?? 'Гость'}</div>
					<div className='profileEmail'>{user?.email ?? '—'}</div>
					{user?.age && <div className='profileInfo'>Возраст: {user.age}</div>}
					{user?.gender && (
						<div className='profileInfo'>Пол: {user.gender}</div>
					)}
				</div>
			</div>

			{user?.bio && (
				<div className='profileBio'>
					<strong>О себе:</strong> {user.bio}
				</div>
			)}

			{user?.interests && user.interests.length > 0 && (
				<div className='profileInterests'>
					<strong>Интересы:</strong>
					<div className='profileInterestsTags'>
						{user.interests.map((interest, index) => (
							<span key={index} className='profileInterestTag'>
								{interest}
							</span>
						))}
					</div>
				</div>
			)}

			<div className='buttonRow'>
				<button
					type='button'
					className='button button--secondary'
					onClick={onOpenSurvey}
				>
					{user?.age && user?.gender && user?.interests?.length
						? 'Редактировать анкету'
						: 'Пройти анкету'}
				</button>
				<Link to='/my-events' className='button button--secondary'>
					Ваши мероприятия
				</Link>
				<button
					type='button'
					className='button button--primary'
					onClick={onEditProfile}
				>
					{isEditing ? 'Закрыть редактирование' : 'Редактировать профиль'}
				</button>
			</div>

			<div className='dangerRow'>
				<button
					type='button'
					className='button button--ghost'
					onClick={onLogout}
				>
					Выйти
				</button>
				<button
					type='button'
					className='button button--danger'
					onClick={onDelete}
				>
					Удалить аккаунт
				</button>
			</div>
		</div>
	)
}

export default ProfileInfoCard

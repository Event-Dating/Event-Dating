import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import EmailChangeCard from '../components/Profile/EmailChangeCard'
import NameChangeCard from '../components/Profile/NameChangeCard'
import PasswordChangeCard from '../components/Profile/PasswordChangeCard'
import ProfileInfoCard from '../components/Profile/ProfileInfoCard'
import ProfileSurveyModal from '../components/Profile/ProfileSurveyModal'
import { useAuth } from '../context/AuthContext'

function ProfilePage() {
	const { logout, deleteAccount } = useAuth()
	const navigate = useNavigate()
	const [isEditing, setIsEditing] = useState(false)
	const [showSurveyModal, setShowSurveyModal] = useState(false)

	const onLogout = async () => {
		await logout()
		navigate('/')
	}

	const onDelete = async () => {
		await deleteAccount()
		navigate('/')
	}

	const onProfileUpdated = () => {
		setIsEditing(false)
		console.log('Профиль успешно обновлен')
	}

	const onEditProfile = () => {
		setIsEditing(!isEditing)
	}

	const handleSurveyComplete = () => {
		setShowSurveyModal(false)
		console.log('Анкета успешно заполнена')
	}

	return (
		<div className='container'>
			<div className='pageHeader'>
				<h1 className='h1'>Профиль</h1>
			</div>

			<div className='profileGrid'>
				<ProfileInfoCard
					onLogout={onLogout}
					onDelete={onDelete}
					onEditProfile={onEditProfile}
					isEditing={isEditing}
					onOpenSurvey={() => setShowSurveyModal(true)}
				/>
				{isEditing && (
					<>
						<NameChangeCard onSaved={onProfileUpdated} />
						<EmailChangeCard onSaved={onProfileUpdated} />
						<PasswordChangeCard onSaved={onProfileUpdated} />
					</>
				)}
			</div>

			<ProfileSurveyModal
				isOpen={showSurveyModal}
				onClose={() => setShowSurveyModal(false)}
				onComplete={handleSurveyComplete}
			/>
		</div>
	)
}

export default ProfilePage

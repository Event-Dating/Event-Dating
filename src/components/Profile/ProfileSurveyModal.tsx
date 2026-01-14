import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { UsersAPI } from '../../services/api'
import './ProfileSurveyModal.css'

interface ProfileSurveyModalProps {
	isOpen: boolean
	onClose: () => void
	onComplete: () => void
}

const INTERESTS_OPTIONS = [
	'Игры',
	'Музыка',
	'Спорт',
	'Еда',
	'Путешествия',
	'Кино',
	'Культура',
	'Прогулка',
]

function ProfileSurveyModal({
	isOpen,
	onClose,
	onComplete,
}: ProfileSurveyModalProps) {
	const { user, updateUser } = useAuth()

	const [formData, setFormData] = useState({
		name: '',
		age: '',
		gender: '',
		bio: '',
		interests: [] as string[],
	})

	// Синхронизируем данные при открытии модалки
	useEffect(() => {
		if (isOpen && user) {
			setFormData({
				name: user.name || '',
				age: user.age ? user.age.toString() : '',
				gender: user.gender || '',
				bio: user.bio || '',
				interests: user.interests || [],
			})
		}
	}, [isOpen, user])

	const [errors, setErrors] = useState<{
		name?: string
		age?: string
		gender?: string
		bio?: string
		interests?: string
	}>({})

	const [isSubmitting, setIsSubmitting] = useState(false)

	if (!isOpen || !user) return null

	const validateForm = () => {
		const newErrors: typeof errors = {}

		if (!formData.name.trim()) {
			newErrors.name = 'Имя обязательно для заполнения'
		}

		const ageNum = parseInt(formData.age.toString())
		if (!formData.age || isNaN(ageNum)) {
			newErrors.age = 'Укажите ваш возраст'
		} else if (ageNum < 18) {
			newErrors.age = 'Вам должно быть не менее 18 лет'
		} else if (ageNum > 120) {
			newErrors.age = 'Пожалуйста, укажите корректный возраст'
		}

		if (!formData.gender) {
			newErrors.gender = 'Выберите ваш пол'
		}

		if (formData.interests.length === 0) {
			newErrors.interests = 'Выберите хотя бы одно увлечение'
		}

		if (formData.bio.length > 500) {
			newErrors.bio = 'Описание не должно превышать 500 символов'
		}

		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!validateForm()) {
			return
		}

		setIsSubmitting(true)

		try {
			const updatedUser = await UsersAPI.updateProfile({
				userId: user.id,
				name: formData.name,
				age: parseInt(formData.age.toString()),
				gender: formData.gender,
				bio: formData.bio || undefined,
				interests: formData.interests,
			})

			updateUser(updatedUser)
			onComplete()
		} catch (error) {
			console.error('Error updating profile:', error)
			alert('Ошибка при сохранении анкеты. Попробуйте еще раз.')
		} finally {
			setIsSubmitting(false)
		}
	}

	const toggleInterest = (interest: string) => {
		setFormData(prev => ({
			...prev,
			interests: prev.interests.includes(interest)
				? prev.interests.filter(i => i !== interest)
				: [...prev.interests, interest],
		}))

		// Очищаем ошибку при выборе интереса
		if (errors.interests) {
			setErrors(prev => ({ ...prev, interests: undefined }))
		}
	}

	return (
		<div className='profileSurveyModal__overlay' onClick={onClose}>
			<div className='profileSurveyModal' onClick={e => e.stopPropagation()}>
				<div className='profileSurveyModal__header'>
					<h2 className='profileSurveyModal__title'>Пройти анкету</h2>
					<button
						className='profileSurveyModal__close'
						onClick={onClose}
						type='button'
					>
						✕
					</button>
				</div>

				<form className='profileSurveyModal__form' onSubmit={handleSubmit}>
					{/* Имя */}
					<div className='profileSurveyModal__field'>
						<label className='profileSurveyModal__label'>
							Ваше имя <span className='profileSurveyModal__required'>*</span>
						</label>
						<input
							type='text'
							className={`profileSurveyModal__input ${
								errors.name ? 'profileSurveyModal__input--error' : ''
							}`}
							value={formData.name}
							onChange={e => {
								setFormData({ ...formData, name: e.target.value })
								if (errors.name) setErrors({ ...errors, name: undefined })
							}}
							placeholder='Введите ваше имя'
						/>
						{errors.name && (
							<span className='profileSurveyModal__error'>{errors.name}</span>
						)}
					</div>

					{/* Возраст */}
					<div className='profileSurveyModal__field'>
						<label className='profileSurveyModal__label'>
							Ваш возраст{' '}
							<span className='profileSurveyModal__required'>*</span>
						</label>
						<input
							type='number'
							className={`profileSurveyModal__input ${
								errors.age ? 'profileSurveyModal__input--error' : ''
							}`}
							value={formData.age}
							onChange={e => {
								setFormData({ ...formData, age: e.target.value })
								if (errors.age) setErrors({ ...errors, age: undefined })
							}}
							placeholder='Введите ваш возраст'
							min='18'
							max='120'
						/>
						{errors.age && (
							<span className='profileSurveyModal__error'>{errors.age}</span>
						)}
					</div>

					{/* Пол */}
					<div className='profileSurveyModal__field'>
						<label className='profileSurveyModal__label'>
							Ваш пол <span className='profileSurveyModal__required'>*</span>
						</label>
						<div className='profileSurveyModal__genderOptions'>
							<button
								type='button'
								className={`profileSurveyModal__genderBtn ${
									formData.gender === 'Мужской'
										? 'profileSurveyModal__genderBtn--active'
										: ''
								}`}
								onClick={() => {
									setFormData({ ...formData, gender: 'Мужской' })
									if (errors.gender) setErrors({ ...errors, gender: undefined })
								}}
							>
								Мужчина
							</button>
							<button
								type='button'
								className={`profileSurveyModal__genderBtn ${
									formData.gender === 'Женский'
										? 'profileSurveyModal__genderBtn--active'
										: ''
								}`}
								onClick={() => {
									setFormData({ ...formData, gender: 'Женский' })
									if (errors.gender) setErrors({ ...errors, gender: undefined })
								}}
							>
								Женщина
							</button>
						</div>
						{errors.gender && (
							<span className='profileSurveyModal__error'>{errors.gender}</span>
						)}
					</div>

					{/* Описание */}
					<div className='profileSurveyModal__field'>
						<label className='profileSurveyModal__label'>
							Расскажите кратко о себе
						</label>
						<textarea
							className={`profileSurveyModal__textarea ${
								errors.bio ? 'profileSurveyModal__input--error' : ''
							}`}
							value={formData.bio}
							onChange={e => {
								setFormData({ ...formData, bio: e.target.value })
								if (errors.bio) setErrors({ ...errors, bio: undefined })
							}}
							placeholder='Немного о себе...'
							maxLength={500}
							rows={4}
						/>
						<div className='profileSurveyModal__charCount'>
							{formData.bio.length}/500
						</div>
						{errors.bio && (
							<span className='profileSurveyModal__error'>{errors.bio}</span>
						)}
					</div>

					{/* Интересы */}
					<div className='profileSurveyModal__field'>
						<label className='profileSurveyModal__label'>
							Выберите ваши увлечения{' '}
							<span className='profileSurveyModal__required'>*</span>
						</label>
						<div className='profileSurveyModal__interests'>
							{INTERESTS_OPTIONS.map(interest => (
								<button
									key={interest}
									type='button'
									className={`profileSurveyModal__interestBtn ${
										formData.interests.includes(interest)
											? 'profileSurveyModal__interestBtn--active'
											: ''
									}`}
									onClick={() => toggleInterest(interest)}
								>
									{interest}
								</button>
							))}
						</div>
						{errors.interests && (
							<span className='profileSurveyModal__error'>
								{errors.interests}
							</span>
						)}
					</div>

					{/* Кнопки */}
					<div className='profileSurveyModal__actions'>
						<button
							type='button'
							className='button button--ghost'
							onClick={onClose}
							disabled={isSubmitting}
						>
							Отмена
						</button>
						<button
							type='submit'
							className='button button--primary'
							disabled={isSubmitting}
						>
							{isSubmitting ? 'Сохранение...' : 'Сохранить'}
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}

export default ProfileSurveyModal

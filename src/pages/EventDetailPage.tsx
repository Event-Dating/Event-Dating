import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import editIcon from '../assets/edit-icon.svg'
import EventParticipationButton from '../components/Events/EventParticipationButton'
import { useAuth } from '../context/AuthContext'
import { useEvents } from '../context/EventsContext'
import type { EventCategory, EventCoverVariant } from '../types/event'

function EventDetailPage() {
	const { id } = useParams<{ id: string }>()
	const navigate = useNavigate()
	const { events, updateEvent } = useEvents()
	const { user } = useAuth()

	// Ищем мероприятие по ID
	const event = events.find(e => e.id === id)

	const [participantsCount, setParticipantsCount] = useState(
		event?.participantsCount ?? 0
	)

	// Состояния для редактирования
	const [editingTitle, setEditingTitle] = useState(false)
	const [editingDateTime, setEditingDateTime] = useState(false)
	const [editingDescription, setEditingDescription] = useState(false)
	const [editingCover, setEditingCover] = useState(false)

	// Ошибки валидации
	const [errors, setErrors] = useState<{ title?: string; date?: string }>({})

	// Временные значения для редактирования
	const [tempTitle, setTempTitle] = useState(event?.title || '')
	const [tempDateTime, setTempDateTime] = useState(event?.startsAt || '')
	const [tempDescription, setTempDescription] = useState(
		event?.description || ''
	)
	const [tempCoverVariant, setTempCoverVariant] = useState<EventCoverVariant>(
		event?.coverVariant || 'mint'
	)
	const [tempCustomCover, setTempCustomCover] = useState<string | undefined>(
		event?.customCover
	)

	// Управление тегами
	const [tempCategories, setTempCategories] = useState<EventCategory[]>(
		event?.categories || ([event?.category].filter(Boolean) as EventCategory[])
	)
	const [showTagInput, setShowTagInput] = useState(false)

	const isProfileComplete = Boolean(
		user?.age && user?.gender && user?.interests && user.interests.length > 0
	)

	if (!event) {
		return (
			<div className='container'>
				<div className='pageHeader'>
					<Link to='/events' className='button button--ghost'>
						← Назад к мероприятиям
					</Link>
					<h1 className='h1'>Мероприятие не найдено</h1>
				</div>
			</div>
		)
	}

	const getMinMaxDateTime = () => {
		const now = new Date()
		const min = new Date(now.getTime() + 60 * 60 * 1000) // минимум через 1 час
		min.setMinutes(min.getMinutes() - min.getTimezoneOffset())

		const max = new Date()
		max.setFullYear(2050, 11, 31) // 31 декабря 2050
		max.setHours(23, 59)
		max.setMinutes(max.getMinutes() - max.getTimezoneOffset())

		return {
			min: min.toISOString().slice(0, 16),
			max: max.toISOString().slice(0, 16),
		}
	}

	const validateTitle = (title: string) => {
		if (!title.trim()) {
			return 'Название не может быть пустым'
		}
		return ''
	}

	const validateDateTime = (dateTime: string) => {
		if (!dateTime) {
			return 'Пожалуйста, выберите дату и время мероприятия'
		}

		const eventDate = new Date(dateTime)
		const now = new Date()
		if (eventDate <= now) {
			return 'Дата и время мероприятия должны быть в будущем (минимум через 1 час)'
		}

		const maxDate = new Date()
		maxDate.setFullYear(2100, 11, 31)
		if (eventDate > maxDate) {
			return 'Дата мероприятия не может быть позже 31 декабря 2100 года'
		}

		return ''
	}

	const removeTag = (tagToRemove: EventCategory) => {
		if (tempCategories.length > 1) {
			const newCategories = tempCategories.filter(tag => tag !== tagToRemove)
			setTempCategories(newCategories)
			updateEvent(event.id, {
				categories: newCategories,
				category: newCategories[0],
			})
		}
	}

	const addTagToEvent = (tag: EventCategory) => {
		if (!tempCategories.includes(tag)) {
			const newCategories = [...tempCategories, tag]
			setTempCategories(newCategories)
			updateEvent(event.id, {
				categories: newCategories,
				category: newCategories[0],
			})
		}
		setShowTagInput(false)
	}

	const formatStartsAt = (value: string) => {
		const dt = new Date(value)

		const date = new Intl.DateTimeFormat('ru-RU', {
			day: '2-digit',
			month: 'long',
			year: 'numeric',
		}).format(dt)

		const time = new Intl.DateTimeFormat('ru-RU', {
			hour: '2-digit',
			minute: '2-digit',
		}).format(dt)

		return `${date} в ${time}`
	}

	const handleRequireSurvey = () => {
		alert('Заполните возраст, пол и увлечения в профиле, чтобы записаться.')
		navigate('/profile')
	}

	const handleParticipationChange = (status: { isParticipant: boolean }) => {
		setParticipantsCount(prev => {
			const next = Math.max(0, prev + (status.isParticipant ? 1 : -1))
			updateEvent(event.id, { participantsCount: next })
			return next
		})
	}

	return (
		<div className='container'>
			<div className='eventDetail'>
				{/* Кнопка назад */}
				<Link to='/events' className='button button--ghost'>
					← Назад к мероприятиям
				</Link>

				{/* Обложка мероприятия */}
				<div
					className={`eventDetail__cover eventDetail__cover--${
						editingCover ? tempCoverVariant : event.coverVariant
					}`}
					style={
						editingCover && tempCustomCover
							? {
									backgroundImage: `url(${tempCustomCover})`,
									backgroundSize: 'cover',
									backgroundPosition: 'center',
							  }
							: event.customCover
							? {
									backgroundImage: `url(${event.customCover})`,
									backgroundSize: 'cover',
									backgroundPosition: 'center',
							  }
							: {}
					}
				>
					{editingCover ? (
						<div className='eventDetail__coverEditContainer'>
							<div className='eventDetail__coverOptions'>
								<label className='eventDetail__coverOption'>
									<input
										type='radio'
										name='coverType'
										value='mint'
										checked={!tempCustomCover && tempCoverVariant === 'mint'}
										onChange={() => {
											setTempCustomCover(undefined)
											setTempCoverVariant('mint')
										}}
									/>
									<span className='eventDetail__coverPreview eventDetail__coverPreview--mint'></span>
								</label>
								<label className='eventDetail__coverOption'>
									<input
										type='radio'
										name='coverType'
										value='lavender'
										checked={
											!tempCustomCover && tempCoverVariant === 'lavender'
										}
										onChange={() => {
											setTempCustomCover(undefined)
											setTempCoverVariant('lavender')
										}}
									/>
									<span className='eventDetail__coverPreview eventDetail__coverPreview--lavender'></span>
								</label>
								<label className='eventDetail__coverOption'>
									<input
										type='radio'
										name='coverType'
										value='peach'
										checked={!tempCustomCover && tempCoverVariant === 'peach'}
										onChange={() => {
											setTempCustomCover(undefined)
											setTempCoverVariant('peach')
										}}
									/>
									<span className='eventDetail__coverPreview eventDetail__coverPreview--peach'></span>
								</label>
								<label className='eventDetail__coverOption'>
									<input
										type='radio'
										name='coverType'
										value='sky'
										checked={!tempCustomCover && tempCoverVariant === 'sky'}
										onChange={() => {
											setTempCustomCover(undefined)
											setTempCoverVariant('sky')
										}}
									/>
									<span className='eventDetail__coverPreview eventDetail__coverPreview--sky'></span>
								</label>
								<label className='eventDetail__coverOption'>
									<input
										type='radio'
										name='coverType'
										value='custom'
										checked={!!tempCustomCover}
										onChange={() => {}}
									/>
									<span
										className='eventDetail__coverPreview eventDetail__coverPreview--custom'
										onClick={e => {
											e.preventDefault()
											const fileInput = e.currentTarget
												.nextElementSibling as HTMLInputElement
											if (fileInput) {
												fileInput.click()
											}
										}}
									>
										+
									</span>
									<input
										type='file'
										accept='image/*'
										onChange={e => {
											const file = e.target.files?.[0]
											if (file) {
												const reader = new FileReader()
												reader.onload = e => {
													setTempCustomCover(e.target?.result as string)
												}
												reader.readAsDataURL(file)
											}
										}}
										className='eventDetail__fileInputHidden'
									/>
								</label>
							</div>
							<div className='eventDetail__coverEditActions'>
								<button
									className='button button--primary button--small'
									onClick={() => {
										updateEvent(event.id, {
											coverVariant: tempCoverVariant,
											customCover: tempCustomCover,
										})
										setEditingCover(false)
									}}
								>
									Сохранить
								</button>
								<button
									className='button button--ghost button--small'
									onClick={() => {
										setTempCoverVariant(event.coverVariant)
										setTempCustomCover(event.customCover)
										setEditingCover(false)
									}}
								>
									Отмена
								</button>
							</div>
						</div>
					) : (
						user &&
						user.email === event.author && (
							<button
								className='eventDetail__editCoverButton'
								onClick={() => setEditingCover(true)}
							>
								<img src={editIcon} alt='Редактировать обложку' />
							</button>
						)
					)}
				</div>

				{/* Название мероприятия */}
				<div className='eventDetail__titleContainer'>
					{editingTitle ? (
						<div className='eventDetail__editContainer'>
							<input
								type='text'
								value={tempTitle}
								onChange={e => {
									setTempTitle(e.target.value)
									if (errors.title) {
										setErrors({ ...errors, title: undefined })
									}
								}}
								className={`eventDetail__input ${
									errors.title ? 'eventDetail__input--error' : ''
								}`}
							/>
							{errors.title && (
								<div className='eventDetail__error'>{errors.title}</div>
							)}
							<div className='eventDetail__editActions'>
								<button
									className='button button--primary button--small'
									onClick={() => {
										const titleError = validateTitle(tempTitle)
										if (titleError) {
											setErrors({ title: titleError })
											return
										}
										updateEvent(event.id, { title: tempTitle.trim() })
										setEditingTitle(false)
										setErrors({})
									}}
								>
									Сохранить
								</button>
								<button
									className='button button--ghost button--small'
									onClick={() => {
										setTempTitle(event.title)
										setEditingTitle(false)
										setErrors({})
									}}
								>
									Отмена
								</button>
							</div>
						</div>
					) : (
						<div className='eventDetail__titleWithEdit'>
							<h1 className='eventDetail__title'>{event.title}</h1>
							{user && user.email === event.author && (
								<button
									className='eventDetail__editButton'
									onClick={() => setEditingTitle(true)}
								>
									<img src={editIcon} alt='Редактировать' />
								</button>
							)}
						</div>
					)}
				</div>

				{/* Дата и время */}
				<div className='eventDetail__datetime'>
					{editingDateTime ? (
						<div className='eventDetail__editContainer'>
							<input
								type='datetime-local'
								value={tempDateTime}
								min={getMinMaxDateTime().min}
								max={getMinMaxDateTime().max}
								onChange={e => {
									setTempDateTime(e.target.value)
									if (errors.date) {
										setErrors({ ...errors, date: undefined })
									}
								}}
								className={`eventDetail__input ${
									errors.date ? 'eventDetail__input--error' : ''
								}`}
							/>
							{errors.date && (
								<div className='eventDetail__error'>{errors.date}</div>
							)}
							<div className='eventDetail__editActions'>
								<button
									className='button button--primary button--small'
									onClick={() => {
										const dateError = validateDateTime(tempDateTime)
										if (dateError) {
											setErrors({ date: dateError })
											return
										}
										updateEvent(event.id, { startsAt: tempDateTime })
										setEditingDateTime(false)
										setErrors({})
									}}
								>
									Сохранить
								</button>
								<button
									className='button button--ghost button--small'
									onClick={() => {
										setTempDateTime(event.startsAt)
										setEditingDateTime(false)
										setErrors({})
									}}
								>
									Отмена
								</button>
							</div>
						</div>
					) : (
						<div className='eventDetail__datetimeWithEdit'>
							<div className='eventDetail__datetimeContent'>
								<div className='eventDetail__dateWithEdit'>
									<span className='eventDetail__date'>
										{formatStartsAt(event.startsAt)}
									</span>
									<div
										className='eventDetail__participantsBadge'
										aria-label='Количество участников'
									>
										<span aria-hidden='true'>👥</span>
										{participantsCount}
									</div>
									{user && user.email === event.author && (
										<button
											className='eventDetail__editButton'
											onClick={() => setEditingDateTime(true)}
										>
											<img src={editIcon} alt='Редактировать' />
										</button>
									)}
								</div>
								<div className='eventDetail__tagsContainer'>
									{tempCategories.map((category, index) => (
										<span
											key={index}
											className={`eventDetail__category eventDetail__category--removable ${
												user && user.email === event.author
													? 'eventDetail__category--editable'
													: ''
											}`}
											onClick={() =>
												user &&
												user.email === event.author &&
												removeTag(category)
											}
										>
											{category}
											{user &&
												user.email === event.author &&
												tempCategories.length > 1 && (
													<span className='eventDetail__categoryRemove'>×</span>
												)}
										</span>
									))}
									{user && user.email === event.author && (
										<div className='eventDetail__categoryAddWrapper'>
											<button
												className='eventDetail__categoryAdd'
												onClick={() => setShowTagInput(!showTagInput)}
											>
												+
											</button>
											{showTagInput && (
												<div className='eventDetail__tagDropdown'>
													<div
														className='eventDetail__tagOption'
														onClick={() => addTagToEvent('Спорт')}
													>
														Спорт
													</div>
													<div
														className='eventDetail__tagOption'
														onClick={() => addTagToEvent('Культура')}
													>
														Культура
													</div>
													<div
														className='eventDetail__tagOption'
														onClick={() => addTagToEvent('Еда')}
													>
														Еда
													</div>
													<div
														className='eventDetail__tagOption'
														onClick={() => addTagToEvent('Прогулка')}
													>
														Прогулка
													</div>
													<div
														className='eventDetail__tagOption'
														onClick={() => addTagToEvent('Другое')}
													>
														Другое
													</div>
												</div>
											)}
										</div>
									)}
								</div>
							</div>
						</div>
					)}
				</div>

				{/* Кнопки действий */}
				{user && (
					<div className='eventDetail__actions'>
						{/* Кнопка "Хочу пойти" / "Отменить запись" */}
						<EventParticipationButton
							eventId={event.id}
							userId={user.id}
							isProfileComplete={isProfileComplete}
							onRequireSurvey={handleRequireSurvey}
							onStatusChange={handleParticipationChange}
						/>

						{/* Кнопка "Найти компанию" - показываем для всех авторизованных пользователей */}
						<Link
							to={`/events/${event.id}/swipe`}
							className='button button--primary button--large eventDetail__action'
						>
							Найти компанию
						</Link>
					</div>
				)}

				{user && !isProfileComplete && (
					<div className='eventDetail__notice'>
						Заполните анкету в профиле (возраст, пол, увлечения), чтобы
						активировать запись на мероприятие.
					</div>
				)}

				{/* Описание мероприятия */}
				<div className='eventDetail__description'>
					{editingDescription ? (
						<div className='eventDetail__editContainer'>
							<textarea
								value={tempDescription}
								onChange={e => setTempDescription(e.target.value)}
								className='eventDetail__textarea'
								rows={4}
							/>
							<div className='eventDetail__editActions'>
								<button
									className='button button--primary button--small'
									onClick={() => {
										updateEvent(event.id, { description: tempDescription })
										setEditingDescription(false)
									}}
								>
									Сохранить
								</button>
								<button
									className='button button--ghost button--small'
									onClick={() => {
										setTempDescription(event.description)
										setEditingDescription(false)
									}}
								>
									Отмена
								</button>
							</div>
						</div>
					) : (
						<div>
							<div className='eventDetail__descriptionHeader'>
								<h2 className='eventDetail__descriptionTitle'>О мероприятии</h2>
								{user && user.email === event.author && (
									<button
										className='eventDetail__editButton'
										onClick={() => setEditingDescription(true)}
									>
										<img src={editIcon} alt='Редактировать' />
									</button>
								)}
							</div>
							<p className='eventDetail__descriptionText'>
								{event.description}
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

export default EventDetailPage

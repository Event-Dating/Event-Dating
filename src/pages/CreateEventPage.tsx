import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import CreateEventForm from '../components/CreateEvent/CreateEventForm'
import { useAuth } from '../context/AuthContext'
import { useEvents } from '../context/EventsContext'
import type { EventCategory } from '../types/event'
import { createEvent } from '../utils/eventUtils'

function CreateEventPage() {
	const { addEvent } = useEvents()
	const { user } = useAuth()
	const navigate = useNavigate()

	useEffect(() => {
		if (!user) {
			navigate('/')
			return
		}
	}, [user, navigate])

	const handleSave = (payload: {
		title: string
		startsAt: string
		coverFileName: string | null
		category: EventCategory
		description: string
		author: string
	}) => {
		const newEvent = createEvent(payload)
		addEvent(newEvent)
		console.log('Мероприятие создано:', newEvent)
		navigate('/')
	}

	if (!user) {
		return null // Будет редирект на главную через useEffect
	}

	return (
		<div className='container'>
			<div className='pageHeader' style={{ marginBottom: 24 }}>
				<h1 className='h1'>Создание мероприятия</h1>
			</div>

			<div className='contentSection'>
				<p className='muted' style={{ marginBottom: 20 }}>
					Заполни основные поля и сохрани новое событие.
				</p>
				<CreateEventForm onSave={handleSave} author={user?.email || ''} />
			</div>
		</div>
	)
}

export default CreateEventPage

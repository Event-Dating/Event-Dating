import { useEffect, useState } from 'react'
import { EventParticipantsAPI } from '../../services/api'
import './EventParticipationButton.css'

interface EventParticipationButtonProps {
	eventId: string
	userId: string
	isProfileComplete?: boolean
	onRequireSurvey?: () => void
	onStatusChange?: (status: { isParticipant: boolean }) => void
}

function EventParticipationButton({
	eventId,
	userId,
	isProfileComplete = false,
	onRequireSurvey,
	onStatusChange,
}: EventParticipationButtonProps) {
	const [isParticipant, setIsParticipant] = useState(false)
	const [isLoading, setIsLoading] = useState(true)
	const [isSubmitting, setIsSubmitting] = useState(false)

	useEffect(() => {
		checkParticipation()
	}, [eventId, userId])

	const checkParticipation = async () => {
		try {
			setIsLoading(true)
			const status = await EventParticipantsAPI.checkParticipation(
				eventId,
				userId
			)
			setIsParticipant(status.isParticipant)
		} catch (error) {
			console.error('Error checking participation:', error)
		} finally {
			setIsLoading(false)
		}
	}

	const handleToggleParticipation = async () => {
		if (!isProfileComplete) {
			onRequireSurvey?.()
			return
		}

		setIsSubmitting(true)

		try {
			if (isParticipant) {
				await EventParticipantsAPI.leaveEvent(eventId, userId)
				setIsParticipant(false)
				onStatusChange?.({ isParticipant: false })
			} else {
				await EventParticipantsAPI.joinEvent(eventId, userId)
				setIsParticipant(true)
				onStatusChange?.({ isParticipant: true })
			}
		} catch (error) {
			console.error('Error toggling participation:', error)
			alert(error instanceof Error ? error.message : 'Произошла ошибка')
		} finally {
			setIsSubmitting(false)
		}
	}

	if (isLoading) {
		return (
			<button
				className='button button--secondary button--large eventDetail__action'
				disabled
			>
				Загрузка...
			</button>
		)
	}

	return (
		<button
			className={`button button--large eventDetail__action ${
				isParticipant ? 'button--ghost' : 'button--secondary'
			}`}
			onClick={handleToggleParticipation}
			disabled={isSubmitting}
		>
			{!isProfileComplete
				? 'Заполните анкету'
				: isSubmitting
				? 'Загрузка...'
				: isParticipant
				? 'Отменить запись'
				: 'Хочу пойти'}
		</button>
	)
}

export default EventParticipationButton

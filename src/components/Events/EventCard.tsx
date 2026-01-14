import { Link } from 'react-router-dom'
import type { EventItem } from '../../types/event'

type Props = {
	event: EventItem
}

function formatStartsAt(value: string) {
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

	return `${date} · ${time}`
}

function EventCard({ event }: Props) {
	const categories = event.categories || [event.category]

	return (
		<Link to={`/events/${event.id}`} className='eventCard'>
			<div
				className={`eventCard__cover eventCard__cover--${event.coverVariant}`}
				style={
					event.customCover
						? {
								backgroundImage: `url(${event.customCover})`,
								backgroundSize: 'cover',
								backgroundPosition: 'center',
						  }
						: {}
				}
			/>

			<div className='eventCard__body'>
				<div className='eventCard__titleRow'>
					<div className='eventCard__title'>{event.title}</div>
					<div
						className='eventCard__participants'
						aria-label='Количество участников'
					>
						<span className='eventCard__participantsIcon' aria-hidden='true'>
							👥
						</span>
						{event.participantsCount ?? 0}
					</div>
				</div>
				<div className='eventCard__meta'>
					<span className='eventCard__date'>
						{formatStartsAt(event.startsAt)}
					</span>
					<span className='dot' aria-hidden='true' />
					<div className='eventCard__categories'>
						{categories.map((category, index) => (
							<span key={index} className='eventCard__category'>
								{category}
							</span>
						))}
					</div>
				</div>
			</div>
		</Link>
	)
}

export default EventCard

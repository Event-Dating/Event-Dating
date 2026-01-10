import { AnimatePresence } from 'framer-motion'
import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SwipeCard from '../components/Swipe/SwipeCard'
import SwipeFilters from '../components/Swipe/SwipeFilters'
import { MOCK_PROFILES } from '../components/Swipe/mockData'
import { useEvents } from '../context/EventsContext'
import { mockEvents } from '../data/mockEvents'
import './SwipePage.css'

function SwipePage() {
	const { id } = useParams<{ id: string }>()
	const { events } = useEvents()
	// Search for the event both in context and mock data to ensure we find it
	const event =
		events.find(e => e.id === id) || mockEvents.find(e => e.id === id)

	const [currentIndex, setCurrentIndex] = useState(0)
	const [showFilters, setShowFilters] = useState(false) // Mobile filter toggle
	const [filters, setFilters] = useState({
		gender: 'Любой',
		ageRange: [18, 50] as [number, number],
		interests: [] as string[],
	})

	// Filter profiles
	const filteredProfiles = useMemo(() => {
		if (!id) return []

		return MOCK_PROFILES.filter(profile => {
			// Must have joined this specific event
			// For demo/testing purposes, if we are on a real server with random IDs,
			// we might want to show everyone.
			// But to be consistent, let's say everyone joined *everything* in mockData.ts
			// or just ignore this check for the "User Feedback" request to make it work.
			// Let's rely on the updated mock data which has '1', '2', '3'.
			// If the user has a *different* ID, they won't see anything.
			// FIXED: Allow all profiles if joinedEvents includes 'all' OR matches ID.
			if (
				profile.joinedEvents &&
				!profile.joinedEvents.includes('all') &&
				!profile.joinedEvents.includes(id)
			)
				return false

			// Gender filter
			if (filters.gender !== 'Любой' && profile.gender !== filters.gender)
				return false

			// Age filter
			if (
				profile.age < filters.ageRange[0] ||
				profile.age > filters.ageRange[1]
			)
				return false

			// Interests filter (match at least one)
			if (filters.interests.length > 0) {
				const hasInterest = profile.tags.some(tag =>
					filters.interests.includes(tag)
				)
				if (!hasInterest) return false
			}

			return true
		})
	}, [filters, id])

	const currentProfile = filteredProfiles[currentIndex]

	const handleSwipe = (direction: 'left' | 'right') => {
		console.log(`Swiped ${direction} on ${currentProfile.name}`)
		// Need a slight delay to allow animation to complete if triggered by button
		setTimeout(() => {
			setCurrentIndex(prev => prev + 1)
		}, 200)
	}

	// Helper for buttons to trigger swipe (simulate manual swipe logic could be complex,
	// here we just advance the index, but ideally we'd trigger the card animation)
	const manualSwipe = (direction: 'left' | 'right') => {
		handleSwipe(direction)
	}

	if (!event) return <div>Мероприятие не найдено</div>

	return (
		<div className='swipePage'>
			<div className={`swipePage__sidebar ${showFilters ? 'open' : ''}`}>
				<button
					className='swipePage__closeSidebar'
					onClick={() => setShowFilters(false)}
				>
					✕
				</button>
				<div className='swipePage__header'>
					<Link to={`/events/${id}`} className='swipePage__back'>
						<span>←</span> Назад к мероприятию
					</Link>
					<h1 className='swipePage__eventTitle'>{event.title}</h1>
				</div>

				<SwipeFilters filters={filters} onChange={setFilters} />
			</div>

			<div className='swipePage__content'>
				<button
					className='swipePage__mobileFilterBtn'
					onClick={() => setShowFilters(true)}
				>
					Фильтры
				</button>
				<div className='swipePage__cardContainer'>
					<AnimatePresence>
						{currentProfile ? (
							<SwipeCard
								key={currentProfile.id}
								profile={currentProfile}
								onSwipe={handleSwipe}
							/>
						) : (
							<div className='swipePage__empty'>
								<h3>Нет подходящих кандидатов</h3>
								<p>Попробуйте изменить фильтры</p>
								<button
									className='button button--ghost'
									onClick={() => {
										setFilters({
											gender: 'Любой',
											ageRange: [18, 50],
											interests: [],
										})
										setCurrentIndex(0)
									}}
								>
									Сбросить фильтры
								</button>
							</div>
						)}
					</AnimatePresence>
				</div>

				{currentProfile && (
					<div className='swipePage__controls'>
						<button
							className='swipePage__controlBtn swipePage__controlBtn--pass'
							onClick={() => manualSwipe('left')}
						>
							✕
						</button>
						<button
							className='swipePage__controlBtn swipePage__controlBtn--match'
							onClick={() => manualSwipe('right')}
						>
							♥
						</button>
					</div>
				)}
			</div>
		</div>
	)
}

export default SwipePage

import {
	AnimatePresence,
	motion,
	useMotionValue,
	useTransform,
} from 'framer-motion'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SwipeCard, { type SwipeProfile } from '../components/Swipe/SwipeCard'
import SwipeFilters from '../components/Swipe/SwipeFilters'
import { useAuth } from '../context/AuthContext'
import { useEvents } from '../context/EventsContext'
import { ProfilesAPI, SwipesAPI, UsersAPI } from '../services/api'
import './SwipePage.css'

function SwipePage() {
	const { id } = useParams<{ id: string }>()
	const { events, loading: eventsLoading } = useEvents()
	const { user } = useAuth()
	// Ищем мероприятие в реальном списке
	const event = events.find(e => e.id === id)

	const [currentIndex, setCurrentIndex] = useState(0)
	const [showFilters, setShowFilters] = useState(false) // Mobile filter toggle
	const [filters, setFilters] = useState({
		gender: 'Любой',
		ageRange: [18, 50] as [number, number], // Fixed max age default to 50
		interests: [] as string[],
	})
	const [profiles, setProfiles] = useState<SwipeProfile[]>([])
	const [profilesError, setProfilesError] = useState<string | null>(null)
	const [isLoadingProfiles, setIsLoadingProfiles] = useState(false)

	// Animation state
	const x = useMotionValue(0)
	const pageTint = useTransform(
		x,
		[-150, 0, 150],
		['rgba(255, 0, 0, 0.1)', 'rgba(0, 0, 0, 0)', 'rgba(0, 255, 0, 0.1)']
	)

	const crossOpacity = useTransform(x, [-100, -20], [1, 0])
	const heartOpacity = useTransform(x, [20, 100], [0, 1])

	// Reset x when index changes (new card)
	useEffect(() => {
		x.set(0)
	}, [currentIndex, x])

	const currentProfile = profiles[currentIndex]

	// Загружаем реальные профили с сервера
	useEffect(() => {
		if (!user || !id) return

		const loadProfiles = async () => {
			setIsLoadingProfiles(true)
			setProfilesError(null)
			try {
				const loaded = await ProfilesAPI.getProfiles({
					currentUserId: user.id,
					eventId: id,
					gender: filters.gender,
					minAge: filters.ageRange[0],
					maxAge: filters.ageRange[1],
					interests: filters.interests,
				})

				const mapped = loaded.map(profile => ({
					id: profile.id,
					name: profile.name,
					age: profile.age,
					gender: profile.gender,
					avatarUrl: profile.avatar_url,
					bio: profile.bio,
					interests: Array.isArray(profile.interests) ? profile.interests : [],
				}))

				setProfiles(mapped)
				setCurrentIndex(0)
			} catch (error) {
				console.error('Ошибка загрузки профилей:', error)
				setProfilesError(
					error instanceof Error
						? error.message
						: 'Не удалось загрузить профили'
				)
			} finally {
				setIsLoadingProfiles(false)
			}
		}

		loadProfiles()
	}, [user, id, filters.gender, filters.ageRange, filters.interests])

	const handleSwipe = async (direction: 'left' | 'right') => {
		if (!currentProfile || !user) return

		try {
			await SwipesAPI.createSwipe({
				swiperId: user.id,
				targetId: currentProfile.id,
				direction,
				eventId: id,
			})
		} catch (error) {
			console.error('Ошибка отправки свайпа:', error)
		}

		// Небольшая пауза для плавности
		setTimeout(() => {
			setCurrentIndex(prev => prev + 1)
		}, 200)
	}

	// Ленивая подгрузка фото для текущего профиля
	useEffect(() => {
		if (currentProfile && !currentProfile.avatarUrl) {
			const fetchFullProfile = async () => {
				try {
					const fullData = await UsersAPI.getUser(currentProfile.id)
					setProfiles(prev =>
						prev.map(p =>
							p.id === currentProfile.id
								? { ...p, avatarUrl: fullData.avatar_url }
								: p
						)
					)
				} catch (err) {
					console.error('Failed to load avatar:', err)
				}
			}
			fetchFullProfile()
		}
	}, [currentProfile, currentIndex])

	// Helper for buttons to trigger swipe (simulate manual swipe logic could be complex,
	// here we just advance the index, but ideally we'd trigger the card animation)
	const manualSwipe = (direction: 'left' | 'right') => {
		void handleSwipe(direction)
	}

	if (!event) {
		if (eventsLoading) {
			return <div className='container'>Загрузка мероприятия...</div>
		}
		return <div className='container'>Мероприятие не найдено</div>
	}
	if (!user) {
		return (
			<div className='container'>
				<div className='empty empty--center'>
					<div className='empty__title'>Нужно войти</div>
					<div className='empty__text'>
						Авторизуйтесь, чтобы свайпать участников мероприятия.
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className='swipePage'>
			{/* Page Background Tint - Moved here to be outside transform context */}
			<motion.div
				className='swipePage__tint'
				style={{ background: pageTint }}
			/>

			{/* Background Status Icons (Repeating Pattern) */}
			<div className='swipePage__bgIcons'>
				<motion.div
					className='swipePage__bgPattern swipePage__bgPattern--pass'
					style={{ opacity: crossOpacity }}
				/>
				<motion.div
					className='swipePage__bgPattern swipePage__bgPattern--like'
					style={{ opacity: heartOpacity }}
				/>
			</div>

			{/* Swipe Toolbar (Mobile Only) */}
			<div className='swipePage__mobileToolbar'>
				<Link to={`/events/${id}`} className='swipePage__toolbarBack'>
					<span>←</span> Назад
				</Link>
				<button
					className='swipePage__toolbarFilterBtn'
					onClick={() => setShowFilters(true)}
				>
					<span className='icon'>
						<svg
							width='18'
							height='18'
							viewBox='0 0 24 24'
							fill='none'
							stroke='currentColor'
							strokeWidth='2'
							strokeLinecap='round'
							strokeLinejoin='round'
						>
							<polygon points='22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3'></polygon>
						</svg>
					</span>{' '}
					Фильтры
				</button>
			</div>

			<div className={`swipePage__sidebar ${showFilters ? 'open' : ''}`}>
				<div className='swipePage__sidebarHeaderMobile'>
					<h2 className='swipePage__sidebarTitleMobile'>Фильтры</h2>
					<button
						className='swipePage__closeSidebar'
						onClick={() => setShowFilters(false)}
					>
						✕
					</button>
				</div>
				<div className='swipePage__header'>
					<Link to={`/events/${id}`} className='swipePage__back'>
						<span>←</span> Назад к мероприятию
					</Link>
					<h1 className='swipePage__eventTitle sideDesktopOnly'>
						{event.title}
					</h1>
				</div>

				<SwipeFilters filters={filters} onChange={setFilters} />
			</div>

			<div className='swipePage__content'>
				{/* Removed in-content filter button */}
				<div className='swipePage__cardContainer'>
					<AnimatePresence>
						{isLoadingProfiles ? (
							<div className='swipePage__empty'>
								<h3>Загружаем профили...</h3>
							</div>
						) : profilesError ? (
							<div className='swipePage__empty'>
								<h3>Не удалось загрузить профили</h3>
								<p>{profilesError}</p>
								<button
									className='button button--ghost'
									onClick={() => setProfilesError(null)}
								>
									Повторить
								</button>
							</div>
						) : currentProfile ? (
							<SwipeCard
								key={currentProfile.id}
								profile={currentProfile}
								onSwipe={direction => void handleSwipe(direction)}
								dragX={x} // Pass motion value
							/>
						) : (
							<div className='swipePage__empty'>
								<h3>Нет подходящих кандидатов</h3>
								<p>Попробуйте изменить фильтры</p>
								<button
									className='button button--ghost'
									onClick={() => {
										setProfiles([])
										setCurrentIndex(0)
										setFilters({
											gender: 'Любой',
											ageRange: [18, 50],
											interests: [],
										})
									}}
								>
									Сбросить фильтры
								</button>
							</div>
						)}
					</AnimatePresence>
				</div>

				{currentProfile && !isLoadingProfiles && (
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

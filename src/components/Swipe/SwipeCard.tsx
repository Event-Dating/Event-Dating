import {
	motion,
	useTransform,
	type MotionValue,
	type PanInfo,
} from 'framer-motion'
// Removed useMotionValue import as it's passed from parent

export type SwipeProfile = {
	id: string
	name: string
	age?: number
	gender?: string
	avatarUrl?: string
	bio?: string
	interests?: string[]
}

type Props = {
	profile: SwipeProfile
	onSwipe: (direction: 'left' | 'right') => void
	dragX: MotionValue<number> // Received from parent
}

function SwipeCard({ profile, onSwipe, dragX }: Props) {
	const x = dragX // Use passed motion value
	const rotate = useTransform(x, [-200, 200], [-30, 30])
	const opacity = useTransform(
		x,
		[-200, -100, 0, 100, 200],
		[0.5, 1, 1, 1, 0.5]
	)

	// Background tint logic moved to parent
	// const pageTint = useTransform(
	// 	x,
	// 	[-150, 0, 150],
	// 	['rgba(255, 0, 0, 0.1)', 'rgba(0, 0, 0, 0)', 'rgba(0, 255, 0, 0.1)']
	// )

	const handleDragEnd = (
		_: MouseEvent | TouchEvent | PointerEvent,
		info: PanInfo
	) => {
		if (info.offset.x > 100) {
			onSwipe('right')
		} else if (info.offset.x < -100) {
			onSwipe('left')
		}
	}

	return (
		<motion.div
			style={{ x, rotate, opacity }}
			drag='x'
			dragConstraints={{ left: 0, right: 0 }}
			onDragEnd={handleDragEnd}
			className='swipeCard'
		>
			<div
				className='swipeCard__image'
				style={
					profile.avatarUrl
						? { backgroundImage: `url(${profile.avatarUrl})` }
						: { background: 'linear-gradient(135deg, #dbeafe, #ffe4e6)' }
				}
			>
				{/* Removed card overlay tint as requested */}
				<div className='swipeCard__content'>
					<div className='swipeCard__header'>
						<h2 className='swipeCard__name'>
							{profile.name}
							{profile.age ? `, ${profile.age}` : ''}
						</h2>
						{profile.gender && (
							<span className='swipeCard__gender'>
								{profile.gender === 'male'
									? 'Мужчина'
									: profile.gender === 'female'
									? 'Женщина'
									: profile.gender}
							</span>
						)}
					</div>

					<p className='swipeCard__description'>{profile.bio || 'Без описания'}</p>

					<div className='swipeCard__tags'>
						{(profile.interests || []).map((tag, index) => (
							<span key={index} className='swipeCard__tag'>
								{tag}
							</span>
						))}
					</div>
				</div>
			</div>
		</motion.div>
	)
}

export default SwipeCard

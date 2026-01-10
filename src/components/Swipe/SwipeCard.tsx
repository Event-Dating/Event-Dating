import {
	motion,
	useMotionValue,
	useTransform,
	type PanInfo,
} from 'framer-motion'

export type SwipeProfile = {
	id: string
	name: string
	age: number
	gender: string
	photo: string
	description: string
	tags: string[]
	joinedEvents: string[]
}

type Props = {
	profile: SwipeProfile
	onSwipe: (direction: 'left' | 'right') => void
}

function SwipeCard({ profile, onSwipe }: Props) {
	const x = useMotionValue(0)
	const rotate = useTransform(x, [-200, 200], [-30, 30])
	const opacity = useTransform(
		x,
		[-200, -100, 0, 100, 200],
		[0.5, 1, 1, 1, 0.5]
	)

	// Page background tint (works via fixed position overlay)
	const pageTint = useTransform(
		x,
		[-150, 0, 150],
		['rgba(255, 0, 0, 0.1)', 'rgba(0, 0, 0, 0)', 'rgba(0, 255, 0, 0.1)']
	)

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
			initial={{ scale: 0.95, opacity: 0 }}
			animate={{ scale: 1, opacity: 1 }}
			exit={{ scale: 0.95, opacity: 0 }}
			transition={{ duration: 0.3 }}
		>
			<motion.div
				style={{ background: pageTint }}
				className='swipeCard__pageTint'
			/>
			<div
				className='swipeCard__image'
				style={{ backgroundImage: `url(${profile.photo})` }}
			>
				{/* Removed card overlay tint as requested */}
				<div className='swipeCard__content'>
					<div className='swipeCard__header'>
						<h2 className='swipeCard__name'>
							{profile.name}, {profile.age}
						</h2>
						<span className='swipeCard__gender'>{profile.gender}</span>
					</div>

					<p className='swipeCard__description'>{profile.description}</p>

					<div className='swipeCard__tags'>
						{profile.tags.map((tag, index) => (
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

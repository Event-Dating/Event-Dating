import { useEffect, useRef } from 'react'
import './ChatActionsMenu.css'

interface MenuItem {
	label: string
	onClick: () => void
	variant?: 'default' | 'danger'
}

interface Props {
	isOpen: boolean
	onClose: () => void
	items: MenuItem[]
}

export function ChatActionsMenu({ isOpen, onClose, items }: Props) {
	const menuRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				onClose()
			}
		}

		if (isOpen) {
			document.addEventListener('mousedown', handleClickOutside)
		}
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [isOpen, onClose])

	if (!isOpen) return null

	return (
		<div className='chatActionsMenu' ref={menuRef}>
			{items.map((item, index) => (
				<button
					key={index}
					className={`chatActionsMenu__item ${
						item.variant === 'danger' ? 'chatActionsMenu__item--danger' : ''
					}`}
					onClick={() => {
						item.onClick()
						onClose()
					}}
				>
					{item.label}
				</button>
			))}
		</div>
	)
}

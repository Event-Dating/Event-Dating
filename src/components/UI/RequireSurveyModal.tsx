import './RequireSurveyModal.css'

interface Props {
	isOpen: boolean
	onClose: () => void
	onConfirm: () => void
}

function RequireSurveyModal({ isOpen, onClose, onConfirm }: Props) {
	if (!isOpen) return null

	return (
		<div className='modal-overlay' onClick={onClose}>
			<div className='modal-content' onClick={e => e.stopPropagation()}>
				<div className='modal-header'>
					<h2 className='modal-title'>Нужна анкета</h2>
					<button className='modal-close' onClick={onClose}>
						✕
					</button>
				</div>
				<div className='modal-body'>
					<p>
						Чтобы записаться на мероприятие, нужно сперва ответить на несколько
						вопросов о себе. Это поможет организаторам и другим участникам
						узнать вас лучше!
					</p>
				</div>
				<div className='modal-footer'>
					<button className='button button--ghost' onClick={onClose}>
						Позже
					</button>
					<button
						className='button button--primary'
						onClick={() => {
							onConfirm()
							onClose()
						}}
					>
						Пройти анкету
					</button>
				</div>
			</div>
		</div>
	)
}

export default RequireSurveyModal

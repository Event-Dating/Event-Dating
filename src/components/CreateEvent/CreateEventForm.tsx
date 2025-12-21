import { useEffect, useState, type ChangeEvent } from 'react';
import type { EventCategory } from '../../types/event';

type Props = {
  onSave?: (payload: { title: string; startsAt: string; coverFileName: string | null; category: EventCategory; description: string; author: string }) => void
  author: string
}

const categories: EventCategory[] = ['Спорт', 'Культура', 'Еда', 'Прогулка', 'Другое']

function CreateEventForm({ onSave, author }: Props) {
  const [title, setTitle] = useState('')
  const [startsAt, setStartsAt] = useState('')
  const [category, setCategory] = useState<EventCategory>('Другое')
  const [coverFileName, setCoverFileName] = useState<string | null>(null)
  const [description, setDescription] = useState('')
  const [errors, setErrors] = useState<{ title?: string; date?: string }>({})
  const [isSelectOpen, setIsSelectOpen] = useState(false)

  useEffect(() => {
    const now = new Date()
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
    setStartsAt(now.toISOString().slice(0, 16))
  }, [])

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
      max: max.toISOString().slice(0, 16)
    }
  }

  const save = () => {
    const newErrors: { title?: string; date?: string } = {}
    
    if (!title.trim()) {
      newErrors.title = 'Пожалуйста, введите название мероприятия'
    }
    
    if (!startsAt) {
      newErrors.date = 'Пожалуйста, выберите дату и время мероприятия'
    } else {
      const eventDate = new Date(startsAt)
      const now = new Date()
      if (eventDate <= now) {
        newErrors.date = 'Дата и время мероприятия должны быть в будущем (минимум через 1 час)'
      }

      const maxDate = new Date()
      maxDate.setFullYear(2100, 11, 31)
      if (eventDate > maxDate) {
        newErrors.date = 'Дата мероприятия не может быть позже 31 декабря 2100 года'
      }
    }

    setErrors(newErrors)
    
    if (newErrors.title || newErrors.date) {
      return
    }

    onSave?.({ title: title.trim(), startsAt, coverFileName, category, description: description.trim(), author })
  }

  const onCoverChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCoverFileName(e.target.files?.[0]?.name ?? null)
  }

  const { min, max } = getMinMaxDateTime()

  return (
    <div className="card formCard">
      <label className="field">
        <span className="label">Обложка мероприятия</span>
        <input className="input" type="file" accept="image/*" onChange={onCoverChange} />
        {coverFileName && <div className="hint">Выбрано: {coverFileName}</div>}
      </label>

      <label className="field">
        <span className="label">Название мероприятия *</span>
        <input 
          value={title} 
          onChange={(e) => {
            setTitle(e.target.value)
            if (errors.title) {
              setErrors(prev => ({ ...prev, title: undefined }))
            }
          }} 
          className="input" 
          placeholder="Например: прогулка, кофе..." 
          maxLength={100}
        />
        <div className="hint">Максимум 100 символов</div>
        {errors.title && (
          <div className="fieldError">
            {errors.title}
          </div>
        )}
      </label>

      <label className="field">
        <span className="label">Категория мероприятия *</span>
        <div className="selectWrapper">
          <select 
            value={category} 
            onChange={(e) => {
              setCategory(e.target.value as EventCategory)
              setIsSelectOpen(false)
            }} 
            className="input input--select"
            onFocus={() => setIsSelectOpen(true)}
            onBlur={() => setIsSelectOpen(false)}
            onMouseDown={() => setIsSelectOpen(!isSelectOpen)}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <div className={`selectArrow ${isSelectOpen ? 'selectArrow--open' : ''}`}>▼</div>
        </div>
      </label>

      <label className="field">
        <span className="label">Описание мероприятия</span>
        <textarea 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          className="input input--lg" 
          placeholder="Расскажите подробнее о вашем мероприятии..."
          rows={4}
          maxLength={500}
        />
        <div className="hint">Максимум 500 символов</div>
      </label>

      <label className="field">
        <span className="label">Дата и время мероприятия *</span>
        <input 
          value={startsAt} 
          onChange={(e) => {
            setStartsAt(e.target.value)
            if (errors.date) {
              setErrors(prev => ({ ...prev, date: undefined }))
            }
          }} 
          className="input" 
          type="datetime-local"
          min={min}
          max={max}
        />
        <div className="hint">
          Мероприятие должно быть запланировано минимум на 1 час вперед и не позднее 31 декабря 2050 года
        </div>
        {errors.date && (
          <div className="fieldError">
            {errors.date}
          </div>
        )}
      </label>

      <button type="button" className="button button--full" onClick={save}>
        Создать мероприятие
      </button>
    </div>
  )
}

export default CreateEventForm

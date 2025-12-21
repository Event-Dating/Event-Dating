import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

type Props = {
  onSaved?: () => void
}

type FormErrors = {
  name?: string[]
}

function NameChangeCard({ onSaved }: Props) {
  const { user, updateProfile } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    
    if (!name.trim()) {
      newErrors.name = ['Имя обязательно']
    } else if (name.trim().length < 2) {
      newErrors.name = ['Имя должно содержать не менее 2 символов']
    } else if (name.trim().length > 50) {
      newErrors.name = ['Имя не должно превышать 50 символов']
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const onSaveName = async () => {
    if (!validateForm()) return
    
    setIsLoading(true)
    try {
      await updateProfile({ name: name.trim() })
      onSaved?.()
    } catch (error) {
      setErrors({
        name: [error instanceof Error ? error.message : 'Ошибка при изменении имени']
      })
    } finally {
      setIsLoading(false)
    }
  }

  const onCancel = () => {
    setName(user?.name || '')
    setErrors({})
  }

  return (
    <div className="card">
      <div className="cardTitle">Изменение имени</div>

      <label className="field">
        <span className="label">Новое имя</span>
        <input 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          className="input" 
          type="text" 
          placeholder="Введите новое имя"
        />
        {errors.name && (
          <div className="fieldError">
            {errors.name.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </div>
        )}
      </label>

      <div className="buttonRow">
        <button 
          type="button" 
          className="button button--ghost"
          onClick={onCancel}
        >
          Отмена
        </button>
        <button 
          type="button" 
          className="button" 
          onClick={onSaveName}
          disabled={isLoading}
        >
          {isLoading ? 'Сохранение...' : 'Сохранить'}
        </button>
      </div>
    </div>
  )
}

export default NameChangeCard

import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

type Props = {
  onSaved?: () => void
}

type FormErrors = {
  email?: string[]
}

function EmailChangeCard({ onSaved }: Props) {
  const { user, updateProfile } = useAuth()
  const [email, setEmail] = useState(user?.email || '')
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    
    if (!email.trim()) {
      newErrors.email = ['Email обязателен']
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = ['Введите корректный email адрес']
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const onSaveEmail = async () => {
    if (!validateForm()) return
    
    setIsLoading(true)
    try {
      await updateProfile({ email: email.trim() })
      onSaved?.()
    } catch (error) {
      setErrors({
        email: [error instanceof Error ? error.message : 'Ошибка при изменении email']
      })
    } finally {
      setIsLoading(false)
    }
  }

  const onCancel = () => {
    setEmail(user?.email || '')
    setErrors({})
  }

  return (
    <div className="card">
      <div className="cardTitle">Изменение email</div>

      <label className="field">
        <span className="label">Новый email</span>
        <input 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          className="input" 
          type="email" 
          placeholder="Введите новый email"
        />
        {errors.email && (
          <div className="fieldError">
            {errors.email.map((error, index) => (
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
          onClick={onSaveEmail}
          disabled={isLoading}
        >
          {isLoading ? 'Сохранение...' : 'Сохранить'}
        </button>
      </div>
    </div>
  )
}

export default EmailChangeCard

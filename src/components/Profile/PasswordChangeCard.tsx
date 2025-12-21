import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

type Props = {
  onSaved?: () => void
}

type FormErrors = {
  oldPassword?: string[]
  newPassword?: string[]
  confirmPassword?: string[]
}

function PasswordChangeCard({ onSaved }: Props) {
  const { updatePassword } = useAuth()

  const [oldPass, setOldPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    
    // Валидация текущего пароля
    if (!oldPass.trim()) {
      newErrors.oldPassword = ['Текущий пароль обязателен']
    }
    
    // Валидация нового пароля
    if (!newPass.trim()) {
      newErrors.newPassword = ['Новый пароль обязателен']
    } else if (newPass.length < 6) {
      newErrors.newPassword = ['Пароль должен содержать не менее 6 символов']
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPass)) {
      newErrors.newPassword = ['Пароль должен содержать заглавную букву, строчную букву и цифру']
    }
    
    // Валидация подтверждения пароля
    if (!confirmPass.trim()) {
      newErrors.confirmPassword = ['Подтверждение пароля обязательно']
    } else if (newPass !== confirmPass) {
      newErrors.confirmPassword = ['Пароли не совпадают']
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const onSavePassword = async () => {
    if (!validateForm()) return
    
    setIsLoading(true)
    try {
      await updatePassword(oldPass, newPass)
      setOldPass('')
      setNewPass('')
      setConfirmPass('')
      setErrors({})
      onSaved?.()
    } catch (error) {
      setErrors({
        oldPassword: [error instanceof Error ? error.message : 'Ошибка при смене пароля']
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="card">
      <div className="cardTitle">Смена пароля</div>

      <label className="field">
        <span className="label">Нынешний пароль</span>
        <input 
          value={oldPass} 
          onChange={(e) => setOldPass(e.target.value)} 
          className="input" 
          type="password" 
        />
        {errors.oldPassword && (
          <div className="fieldError">
            {errors.oldPassword.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </div>
        )}
      </label>

      <label className="field">
        <span className="label">Новый пароль</span>
        <input 
          value={newPass} 
          onChange={(e) => setNewPass(e.target.value)} 
          className="input" 
          type="password" 
        />
        {errors.newPassword && (
          <div className="fieldError">
            {errors.newPassword.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </div>
        )}
      </label>

      <label className="field">
        <span className="label">Подтвердите новый пароль</span>
        <input 
          value={confirmPass} 
          onChange={(e) => setConfirmPass(e.target.value)} 
          className="input" 
          type="password" 
        />
        {errors.confirmPassword && (
          <div className="fieldError">
            {errors.confirmPassword.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </div>
        )}
      </label>

      <div className="buttonRow">
        <button type="button" className="button button--ghost">
          Не помню пароль
        </button>
        <button 
          type="button" 
          className="button" 
          onClick={onSavePassword}
          disabled={isLoading}
        >
          {isLoading ? 'Сохранение...' : 'Сохранить'}
        </button>
      </div>
    </div>
  )
}

export default PasswordChangeCard

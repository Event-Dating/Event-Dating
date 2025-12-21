import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import Modal from '../UI/Modal'

type Mode = 'login' | 'register'

type Props = {
  onClose: () => void
  onDone: () => void
}

function AuthModal({ onClose, onDone }: Props) {
  const [mode, setMode] = useState<Mode>('login')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  const [errors, setErrors] = useState<{
    name?: string
    email?: string[]
    password?: string[]
    auth?: string
  }>({})

  const { login, register } = useAuth()

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {}
    
    if (mode === 'register' && !name.trim()) {
      newErrors.name = 'Имя обязательно для заполнения'
    }
    
    const emailErrors: string[] = []
    if (!email.trim()) {
      emailErrors.push('Почта обязательна для заполнения')
    } else {
      if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
        emailErrors.push('Введите корректный email адрес')
      }
    }
    if (emailErrors.length > 0) {
      newErrors.email = emailErrors
    }
    
    const passwordErrors: string[] = []
    if (!password) {
      passwordErrors.push('Пароль обязателен для заполнения')
    } else {
      if (password.length < 6) {
        passwordErrors.push('Пароль должен содержать не менее 6 символов')
      }
      if (!/\d/.test(password)) {
        passwordErrors.push('Пароль должен содержать цифры')
      }
      if (!/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/.test(password)) {
        passwordErrors.push('Пароль должен содержать только латинские символы')
      }
    }
    if (passwordErrors.length > 0) {
      newErrors.password = passwordErrors
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: 'name' | 'email' | 'password', value: string) => {
    if (field === 'name') setName(value)
    else if (field === 'email') setEmail(value)
    else if (field === 'password') setPassword(value)
    
    if (errors[field] || errors.auth) {
      setErrors(prev => ({ ...prev, [field]: undefined, auth: undefined }))
    }
  }

  const submit = async () => {
    if (!validateForm()) return
    
    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        await register(name, email, password)
      }
      onDone()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка аутентификации'
      setErrors({ auth: errorMessage })
    }
  }

  return (
    <Modal onClose={onClose}>
      <div className="modalHeader">
        <div className="modalTitle">{mode === 'login' ? 'Вход' : 'Регистрация'}</div>
        <div className="modalSubtitle">{mode === 'login' ? 'Добро пожаловать обратно' : 'Создай аккаунт за минуту'}</div>
      </div>

      {errors.auth && (
        <div className="fieldError" style={{ marginBottom: '12px' }}>
          {errors.auth}
        </div>
      )}

      <div className="modalBody">
        {mode === 'register' && (
          <label className="field">
            <span className="label">Имя</span>
            <input 
              value={name} 
              onChange={(e) => handleInputChange('name', e.target.value)} 
              className={`input ${errors.name ? 'input--error' : ''}`} 
              placeholder="Ваше имя" 
            />
            {errors.name && <span className="fieldError">{errors.name}</span>}
          </label>
        )}

        <label className="field">
          <span className="label">Почта</span>
          <input 
            value={email} 
            onChange={(e) => handleInputChange('email', e.target.value)} 
            className={`input ${errors.email ? 'input--error' : ''}`} 
            placeholder="name@mail.ru" 
          />
          {errors.email && (
              <div className="fieldError">
                {errors.email.map((error, index) => (
                  <div key={index}>{error}</div>
                ))}
              </div>
            )}
        </label>

        <label className="field">
          <span className="label">Пароль</span>
          <input
            value={password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            className={`input ${errors.password ? 'input--error' : ''}`}
            type="password"
            placeholder="••••••••"
          />
          {errors.password && (
              <div className="fieldError">
                {errors.password.map((error, index) => (
                  <div key={index}>{error}</div>
                ))}
              </div>
            )}
        </label>

        <button type="button" className="button button--full" onClick={submit}>
          {mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
        </button>

        <button
          type="button"
          className="linkButton"
          onClick={() => setMode((m) => (m === 'login' ? 'register' : 'login'))}
        >
          {mode === 'login' ? 'Зарегистрироваться' : (
            <>
              Уже есть аккаунт?{' '}
              <span style={{ color: 'var(--primary)', fontWeight: '600' }}>
                Войти
              </span>
            </>
          )}
        </button>
      </div>
    </Modal>
  )
}

export default AuthModal

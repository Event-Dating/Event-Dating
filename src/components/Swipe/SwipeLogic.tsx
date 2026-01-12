import { useState, useCallback, useEffect } from 'react'
import { useMotionValue } from 'framer-motion'
import SwipeCard from './SwipeCard'
import SwipeFilters from './SwipeFilters'
import './SwipeLogic.scss'

type UserProfile = {
  id: string
  name: string
  age: number
  gender: string
  avatar_url: string
  bio: string
  interests: string[]
  joinedEvents: string[]
}

type Props = {
  currentUser: {
    id: string
    name: string
    email: string
  }
  eventId?: string
}

function SwipeLogic({ currentUser, eventId }: Props) {
  const [profiles, setProfiles] = useState<UserProfile[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    gender: 'Любой',
    ageRange: [18, 35] as [number, number],
    interests: [] as string[]
  })
  const [matchModal, setMatchModal] = useState<{
    show: boolean
    matchedUser: UserProfile | null
  }>({
    show: false,
    matchedUser: null
  })

  const dragX = useMotionValue(0)

  // Загрузка профилей
  useEffect(() => {
    loadProfiles()
  }, [filters, eventId])

  const loadProfiles = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        currentUserId: currentUser.id,
        ...(eventId && { eventId }),
        ...(filters.gender !== 'Любой' && { gender: filters.gender }),
        minAge: filters.ageRange[0].toString(),
        maxAge: filters.ageRange[1].toString(),
        ...(filters.interests.length > 0 && { 
          interests: filters.interests.join(',') 
        })
      })

      const response = await fetch(`/.netlify/functions/get-profiles?${params}`)
      const data = await response.json()
      
      if (data.profiles) {
        // Преобразуем данные из БД в формат SwipeProfile
        const formattedProfiles: UserProfile[] = data.profiles.map((p: any) => ({
          id: p.id,
          name: p.name,
          age: p.age || 25,
          gender: p.gender === 'male' ? 'Мужской' : 'Женский',
          avatar_url: p.avatar_url || 'https://via.placeholder.com/150',
          bio: p.bio || '',
          interests: p.interests ? JSON.parse(p.interests) : [],
          joinedEvents: p.event_participants?.map((ep: any) => ep.event_id) || []
        }))
        
        setProfiles(formattedProfiles)
        setCurrentIndex(0)
      }
    } catch (error) {
      console.error('Error loading profiles:', error)
    } finally {
      setLoading(false)
    }
  }

  const currentProfile = profiles[currentIndex]

  // Обработка свайпа
  const handleSwipe = useCallback(async (direction: 'left' | 'right') => {
    if (!currentProfile) return

    try {
      const response = await fetch('/.netlify/functions/swipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          swiperId: currentUser.id,
          targetId: currentProfile.id,
          direction,
          eventId: eventId || null
        })
      })

      const result = await response.json()

      if (result.match && direction === 'right') {
        // Показать модалку матча
        setMatchModal({
          show: true,
          matchedUser: currentProfile
        })
      }

      // Переходим к следующему профилю
      if (currentIndex < profiles.length - 1) {
        setCurrentIndex(prev => prev + 1)
        dragX.set(0)
      } else {
        // Если профили закончились
        setProfiles([])
      }

    } catch (error) {
      console.error('Error processing swipe:', error)
    }
  }, [currentProfile, currentIndex, profiles.length, currentUser.id, eventId, dragX])

  // Ручной свайп (кнопки)
  const handleLike = () => handleSwipe('right')
  const handleDislike = () => handleSwipe('left')

  // Закрыть модалку матча и перейти в чат
  const handleGoToChat = () => {
    setMatchModal({ show: false, matchedUser: null })
    // Здесь навигация в чат (можно использовать react-router)
    window.location.href = `/chats`
  }

  if (loading) {
    return <div className="loading">Загрузка...</div>
  }

  if (!currentProfile) {
    return (
      <div className="no-profiles">
        <h3>Пока нет подходящих людей</h3>
        <p>Попробуйте изменить фильтры или зайдите позже</p>
        <button onClick={loadProfiles} className="refresh-button">
          Обновить
        </button>
      </div>
    )
  }

  return (
    <div className="swipeContainer">
      {/* Модалка матча */}
      {matchModal.show && matchModal.matchedUser && (
        <div className="matchModal">
          <div className="matchModal__content">
            <h2>Это взаимно! 💖</h2>
            <p>
              Вы понравились {matchModal.matchedUser.name}
            </p>
            <div className="matchModal__actions">
              <button 
                onClick={handleGoToChat}
                className="button button--primary"
              >
                Написать сообщение
              </button>
              <button 
                onClick={() => setMatchModal({ show: false, matchedUser: null })}
                className="button button--secondary"
              >
                Продолжить просмотр
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Карточка для свайпа */}
      <div className="swipeArea">
        <SwipeCard
          profile={{
            id: currentProfile.id,
            name: currentProfile.name,
            age: currentProfile.age,
            gender: currentProfile.gender,
            photo: currentProfile.avatar_url,
            description: currentProfile.bio,
            tags: currentProfile.interests,
            joinedEvents: currentProfile.joinedEvents
          }}
          onSwipe={handleSwipe}
          dragX={dragX}
        />

        {/* Кнопки для ручного свайпа */}
        <div className="swipeButtons">
          <button 
            onClick={handleDislike}
            className="swipeButton swipeButton--dislike"
            aria-label="Не нравится"
          >
            ✕
          </button>
          <button 
            onClick={handleLike}
            className="swipeButton swipeButton--like"
            aria-label="Нравится"
          >
            ♥
          </button>
        </div>
      </div>

      {/* Фильтры */}
      <div className="filtersPanel">
        <SwipeFilters
          filters={filters}
          onChange={setFilters}
        />
      </div>
    </div>
  )
}

export default SwipeLogic
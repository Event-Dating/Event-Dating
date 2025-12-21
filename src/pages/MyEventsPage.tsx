import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import EventCard from '../components/Events/EventCard'
import { useAuth } from '../context/AuthContext'
import { useEvents } from '../context/EventsContext'

function MyEventsPage() {
  const { user } = useAuth()
  const { events } = useEvents()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) {
      navigate('/')
      return
    }
  }, [user, navigate])

  // Фильтруем мероприятия по email пользователя
  const userEvents = events.filter(event => event.author === user?.email)

  if (!user) {
    return null // Будет редирект на главную через useEffect
  }

  return (
    <div className="container">
      <div className="pageHeader">
        <h1 className="h1">Ваши мероприятия</h1>
        <p className="muted">Мероприятия, которые вы создали</p>
      </div>

      {userEvents.length === 0 ? (
        <div className="empty empty--center">
          <div className="empty__title">У вас пока нет мероприятий</div>
          <div className="empty__text">Создайте свое первое мероприятие!</div>
        </div>
      ) : (
        <div className="grid">
          {userEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  )
}

export default MyEventsPage

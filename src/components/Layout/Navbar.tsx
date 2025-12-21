import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar__container">
        <Link to="/" className="navbar__logo">
          Event Dating
        </Link>
        
        <div className="navbar__links">
          <Link to="/" className="navbar__link">
            Главная
          </Link>
          <Link to="/events" className="navbar__link">
            Мероприятия
          </Link>
          <Link to="/chats" className="navbar__link">
            Чаты
          </Link>
          <Link to="/profile" className="navbar__link">
            Профиль
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar

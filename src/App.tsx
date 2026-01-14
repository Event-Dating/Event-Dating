import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { AuthProvider } from './context/AuthContext'
import { EventsProvider } from './context/EventsContext'
import AppLayout from './layout/AppLayout'
import AdminUsersPage from './pages/AdminUsersPage'
import ChatsPage from './pages/ChatsPage'
import CreateEventPage from './pages/CreateEventPage'
import EventDetailPage from './pages/EventDetailPage'
import HomePage from './pages/HomePage'
import MyEventsPage from './pages/MyEventsPage'
import ProfilePage from './pages/ProfilePage'
import SwipePage from './pages/SwipePage.tsx'

function App() {
	return (
		<EventsProvider>
			<AuthProvider>
				<BrowserRouter>
					<Routes>
						<Route element={<AppLayout />}>
							<Route path='/' element={<HomePage />} />
							<Route path='/profile' element={<ProfilePage />} />
							<Route path='/chats' element={<ChatsPage />} />
							<Route path='/create' element={<CreateEventPage />} />
							<Route path='/my-events' element={<MyEventsPage />} />
							<Route path='/events/:id' element={<EventDetailPage />} />
							<Route path='/events/:id/swipe' element={<SwipePage />} />
							<Route path='/admin/users' element={<AdminUsersPage />} />
							<Route path='*' element={<Navigate to='/' replace />} />
						</Route>
					</Routes>
				</BrowserRouter>
			</AuthProvider>
		</EventsProvider>
	)
}

export default App

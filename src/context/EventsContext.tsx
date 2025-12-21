import { createContext, ReactNode, useContext, useState } from 'react'
import { mockEvents } from '../data/mockEvents'
import type { EventItem } from '../types/event'

interface EventsContextType {
  events: EventItem[]
  addEvent: (event: EventItem) => void
  updateEvent: (id: string, updates: Partial<EventItem>) => void
}

const EventsContext = createContext<EventsContextType | undefined>(undefined)

export function EventsProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<EventItem[]>(mockEvents)

  const addEvent = (event: EventItem) => {
    setEvents(prev => [...prev, event])
  }

  const updateEvent = (id: string, updates: Partial<EventItem>) => {
    setEvents(prev => prev.map(event => 
      event.id === id ? { ...event, ...updates } : event
    ))
  }

  return (
    <EventsContext.Provider value={{ events, addEvent, updateEvent }}>
      {children}
    </EventsContext.Provider>
  )
}

export function useEvents() {
  const context = useContext(EventsContext)
  if (!context) {
    throw new Error('useEvents must be used within EventsProvider')
  }
  return context
}

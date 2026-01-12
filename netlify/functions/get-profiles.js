import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export const handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type'
  }

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    }
  }

  try {
    const { 
      currentUserId, 
      eventId, 
      gender, 
      minAge, 
      maxAge, 
      interests = [] 
    } = event.queryStringParameters

    if (!currentUserId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing currentUserId' })
      }
    }

    // Базовый запрос: пользователи, записанные на то же мероприятие
    let query = supabase
      .from('users')
      .select(`
        id,
        name,
        email,
        avatar_url,
        age,
        gender,
        bio,
        interests,
        event_participants!inner (
          event_id
        )
      `)
      .neq('id', currentUserId)
      .not('event_participants.event_id', 'is', null)

    // Фильтр по мероприятию
    if (eventId) {
      query = query.eq('event_participants.event_id', eventId)
    }

    // Фильтр по полу
    if (gender && gender !== 'Любой') {
      query = query.eq('gender', gender === 'Мужской' ? 'male' : 'female')
    }

    // Фильтр по возрасту
    if (minAge) {
      query = query.gte('age', parseInt(minAge))
    }
    if (maxAge) {
      query = query.lte('age', parseInt(maxAge))
    }

    // Фильтр по интересам (если у вас есть поле interests в users)
    if (interests.length > 0 && typeof interests === 'string') {
      const interestArray = interests.split(',')
      interestArray.forEach(interest => {
        query = query.ilike('interests', `%${interest}%`)
      })
    }

    // Исключаем уже свайпнутых пользователей
    const { data: swipes } = await supabase
      .from('swipes')
      .select('target_id')
      .eq('swiper_id', currentUserId)
    
    if (swipes && swipes.length > 0) {
      const swipedIds = swipes.map(s => s.target_id)
      query = query.not('id', 'in', `(${swipedIds.join(',')})`)
    }

    const { data: profiles, error } = await query.limit(50)

    if (error) throw error

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ profiles })
    }

  } catch (error) {
    console.error('Get profiles error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    }
  }
}
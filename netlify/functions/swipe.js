const { createClient } = require('@supabase/supabase-js')

// Инициализация Supabase (PostgreSQL)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

exports.handler = async (event) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
  }

  // Handle OPTIONS request for CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    }
  }

  try {
    const { swiperId, targetId, direction, eventId } = JSON.parse(event.body)
    
    if (!swiperId || !targetId || !direction) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields' })
      }
    }

    // 1. Сохраняем свайп
    const { data: swipe, error: swipeError } = await supabase
      .from('swipes')
      .insert({
        swiper_id: swiperId,
        target_id: targetId,
        direction: direction,
        event_id: eventId || null
      })
      .select()
      .single()

    if (swipeError) {
      if (swipeError.code === '23505') { // Unique violation
        return {
          statusCode: 409,
          headers,
          body: JSON.stringify({ error: 'Already swiped' })
        }
      }
      throw swipeError
    }

    // 2. Проверяем взаимный лайк (match)
    if (direction === 'right') {
      const { data: mutualSwipe } = await supabase
        .from('swipes')
        .select('*')
        .eq('swiper_id', targetId)
        .eq('target_id', swiperId)
        .eq('direction', 'right')
        .single()

      // 3. Если взаимный лайк - создаем чат
      if (mutualSwipe) {
        // Определяем порядок user1_id < user2_id для уникальности
        const user1Id = swiperId < targetId ? swiperId : targetId
        const user2Id = swiperId < targetId ? targetId : swiperId
        
        const { data: chat, error: chatError } = await supabase
          .from('chats')
          .insert({
            user1_id: user1Id,
            user2_id: user2Id,
            event_id: eventId || null
          })
          .select()
          .single()

        if (chatError && chatError.code !== '23505') { // Игнорируем если чат уже существует
          console.error('Chat creation error:', chatError)
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ 
            swipe, 
            match: true, 
            chat: chat || null 
          })
        }
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        swipe, 
        match: false 
      })
    }

  } catch (error) {
    console.error('Swipe error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    }
  }
}
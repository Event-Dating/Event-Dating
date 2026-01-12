import pg from 'pg'

const { Pool } = pg

// Утилита для подключения к базе данных
async function getConnection() {
  return new Pool({
    connectionString: process.env.NETLIFY_DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  })
}

export const handler = async (event) => {
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
    const { swiperId, targetId, direction, eventId } = JSON.parse(event.body || '{}')
    
    if (!swiperId || !targetId || !direction) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields' })
      }
    }

    const pool = await getConnection()

    // 1. Сохраняем свайп
    try {
      const swipeResult = await pool.query(
        `INSERT INTO swipes (swiper_id, target_id, direction, event_id) 
         VALUES ($1, $2, $3, $4) 
         RETURNING *`,
        [swiperId, targetId, direction, eventId || null]
      )

      const swipe = swipeResult.rows[0]

      // 2. Проверяем взаимный лайк (match)
      if (direction === 'right') {
        const mutualResult = await pool.query(
          `SELECT * FROM swipes 
           WHERE swiper_id = $1 AND target_id = $2 AND direction = 'right'
           LIMIT 1`,
          [targetId, swiperId]
        )

        // 3. Если взаимный лайк - создаем чат
        if (mutualResult.rows.length > 0) {
          const user1Id = swiperId < targetId ? swiperId : targetId
          const user2Id = swiperId < targetId ? targetId : swiperId
          
          try {
            const chatResult = await pool.query(
              `INSERT INTO chats (user1_id, user2_id, event_id) 
               VALUES ($1, $2, $3) 
               ON CONFLICT (user1_id, user2_id, event_id) DO NOTHING
               RETURNING *`,
              [user1Id, user2Id, eventId || null]
            )

            await pool.end()

            return {
              statusCode: 200,
              headers,
              body: JSON.stringify({ 
                swipe, 
                match: true, 
                chat: chatResult.rows[0] || null 
              })
            }
          } catch (chatError) {
            // Игнорируем ошибку уникальности чата
            if (chatError.code !== '23505') {
              console.error('Chat creation error:', chatError)
            }
          }
        }

        await pool.end()

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ 
            swipe, 
            match: false 
          })
        }
      }

      await pool.end()

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          swipe, 
          match: false 
        })
      }
    } catch (insertError) {
      await pool.end()
      
      if (insertError.code === '23505') { // Unique violation
        return {
          statusCode: 409,
          headers,
          body: JSON.stringify({ error: 'Already swiped' })
        }
      }
      throw insertError
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
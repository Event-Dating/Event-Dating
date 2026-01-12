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
    } = event.queryStringParameters || {}

    if (!currentUserId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing currentUserId' })
      }
    }

    const pool = await getConnection()

    // Базовый запрос: пользователи, записанные на то же мероприятие
    let query = `
      SELECT DISTINCT u.id, u.name, u.email, u.avatar_url
      FROM users u
      INNER JOIN event_participants ep ON u.id = ep.user_id
      WHERE u.id != $1
    `
    const params = [currentUserId]
    let paramIndex = 2

    // Фильтр по мероприятию
    if (eventId) {
      query += ` AND ep.event_id = $${paramIndex}`
      params.push(eventId)
      paramIndex++
    }

    // Исключаем уже свайпнутых пользователей
    const swipesResult = await pool.query(
      'SELECT target_id FROM swipes WHERE swiper_id = $1',
      [currentUserId]
    )
    
    if (swipesResult.rows.length > 0) {
      const swipedIds = swipesResult.rows.map(s => s.target_id)
      query += ` AND u.id NOT IN (${swipedIds.map((_, i) => `$${paramIndex + i}`).join(', ')})`
      params.push(...swipedIds)
      paramIndex += swipedIds.length
    }

    query += ' LIMIT 50'

    const result = await pool.query(query, params)
    await pool.end()

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ profiles: result.rows })
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
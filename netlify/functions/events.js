import pg from 'pg'

const { Pool } = pg

// Утилита для подключения к базе данных
async function getConnection() {
  return new Pool({
    connectionString: process.env.NETLIFY_DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  })
}

// GET /api/events - получение всех мероприятий
// POST /api/events - создание нового мероприятия
export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  }

  try {
    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 200, headers, body: '' }
    }

    const pool = await getConnection()

    if (event.httpMethod === 'GET') {
      // Получение всех мероприятий с информацией об авторах
      const result = await pool.query(`
        SELECT e.*, u.name as author_name, u.email as author_email
        FROM events e
        JOIN users u ON e.author_id = u.id
        ORDER BY e.starts_at ASC
      `)

      await pool.end()

      const events = result.rows.map(row => ({
        id: row.id,
        title: row.title,
        category: row.category,
        startsAt: row.starts_at,
        coverVariant: row.cover_variant,
        description: row.description,
        author: row.author_email,
        authorName: row.author_name
      }))

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(events)
      }
    }

    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}')
      const { title, category, starts_at, cover_variant = 'mint', description, author_id } = body

      if (!title || !category || !starts_at || !author_id) {
        await pool.end()
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing required fields' }) }
      }

      // Проверка существования автора
      const authorExists = await pool.query('SELECT id FROM users WHERE id = $1', [author_id])
      if (authorExists.rows.length === 0) {
        await pool.end()
        return { statusCode: 404, headers, body: JSON.stringify({ error: 'Author not found' }) }
      }

      const result = await pool.query(
        `INSERT INTO events (title, category, starts_at, cover_variant, description, author_id) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING *`,
        [title, category, starts_at, cover_variant, description, author_id]
      )

      await pool.end()

      const eventRow = result.rows[0]
      
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          id: eventRow.id,
          title: eventRow.title,
          category: eventRow.category,
          startsAt: eventRow.starts_at,
          coverVariant: eventRow.cover_variant,
          description: eventRow.description,
          author_id: eventRow.author_id,
          created_at: eventRow.created_at
        })
      }
    }

    await pool.end()
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }

  } catch (error) {
    console.error('Error handling events:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    }
  }
}

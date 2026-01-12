const bcrypt = require('bcryptjs')

// Утилита для подключения к базе данных
async function getConnection() {
  const { Pool } = require('pg')
  return new Pool({
    connectionString: process.env.NETLIFY_DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  })
}

// POST /api/auth - аутентификация пользователя
exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  }

  try {
    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 200, headers, body: '' }
    }

    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }
    }

    const body = JSON.parse(event.body || '{}')
    const { email, password } = body

    if (!email || !password) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Email and password are required' }) }
    }

    const pool = await getConnection()
    
    // Поиск пользователя
    const result = await pool.query(
      'SELECT id, name, email, password_hash, avatar_url, created_at FROM users WHERE email = $1',
      [email]
    )
    
    if (result.rows.length === 0) {
      await pool.end()
      return { statusCode: 401, headers, body: JSON.stringify({ error: 'Invalid credentials' }) }
    }

    const user = result.rows[0]
    
    // Проверка пароля
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    
    if (!isValidPassword) {
      await pool.end()
      return { statusCode: 401, headers, body: JSON.stringify({ error: 'Invalid credentials' }) }
    }

    await pool.end()

    // Возвращаем данные пользователя без пароля
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url,
        created_at: user.created_at
      })
    }

  } catch (error) {
    console.error('Error authenticating user:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    }
  }
}

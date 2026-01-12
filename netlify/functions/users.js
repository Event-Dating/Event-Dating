import bcrypt from 'bcryptjs'
import pg from 'pg'

const { Pool } = pg

// Утилита для подключения к базе данных
async function getConnection() {
  return new Pool({
    connectionString: process.env.NETLIFY_DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  })
}

// POST /api/users - регистрация нового пользователя
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

    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }
    }

    const body = JSON.parse(event.body || '{}')
    const { name, email, password, avatar_url, age, gender, bio, interests } = body

    if (!name || !email || !password) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing required fields' }) }
    }

    let pool = null
    try {
      pool = await getConnection()
    
      // Проверка на существование email
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      )
      
      if (existingUser.rows.length > 0) {
        await pool.end()
        return { statusCode: 409, headers, body: JSON.stringify({ error: 'User with this email already exists' }) }
      }

      // Хеширование пароля
      const password_hash = await bcrypt.hash(password, 10)

      // Преобразуем interests в JSONB, если это массив
      let interestsJsonb = null
      if (interests) {
        if (Array.isArray(interests)) {
          interestsJsonb = JSON.stringify(interests)
        } else if (typeof interests === 'string') {
          try {
            // Проверяем, является ли это уже валидным JSON
            JSON.parse(interests)
            interestsJsonb = interests
          } catch {
            // Если нет, создаем массив из строки
            interestsJsonb = JSON.stringify([interests])
          }
        }
      }

      // Создание пользователя
      // Для jsonb поля используем условную логику - если null, используем NULL, иначе приводим к jsonb
      const result = interestsJsonb 
        ? await pool.query(
            `INSERT INTO users (name, email, password_hash, avatar_url, age, gender, bio, interests) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb) 
             RETURNING id, name, email, avatar_url, age, gender, bio, interests, created_at`,
            [name, email, password_hash, avatar_url || null, age || null, gender || null, bio || null, interestsJsonb]
          )
        : await pool.query(
            `INSERT INTO users (name, email, password_hash, avatar_url, age, gender, bio, interests) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, NULL) 
             RETURNING id, name, email, avatar_url, age, gender, bio, interests, created_at`,
            [name, email, password_hash, avatar_url || null, age || null, gender || null, bio || null]
          )

      await pool.end()
      pool = null

      const user = result.rows[0]
      
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          id: user.id,
          name: user.name,
          email: user.email,
          avatar_url: user.avatar_url,
          age: user.age,
          gender: user.gender,
          bio: user.bio,
          interests: user.interests,
          created_at: user.created_at
        })
      }

    } catch (error) {
      console.error('Error creating user:', error)
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        code: error.code
      })
      
      // Закрываем соединение в случае ошибки
      if (pool) {
        try {
          await pool.end()
        } catch (closeError) {
          console.error('Error closing pool:', closeError)
        }
      }
      
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Internal server error',
          message: process.env.NODE_ENV === 'development' ? error.message : undefined,
          code: process.env.NODE_ENV === 'development' ? error.code : undefined
        })
      }
    }
  } catch (error) {
    console.error('Error in handler:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }
}

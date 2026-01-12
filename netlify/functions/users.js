const bcrypt = require('bcryptjs')

// Утилита для подключения к базе данных
async function getConnection() {
	const { Pool } = require('pg')
	return new Pool({
		connectionString: process.env.NETLIFY_DATABASE_URL,
		ssl: { rejectUnauthorized: false },
	})
}

// POST /api/users - регистрация нового пользователя
exports.handler = async (event, context) => {
	const headers = {
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Headers': 'Content-Type',
		'Content-Type': 'application/json',
	}

	try {
		if (event.httpMethod === 'OPTIONS') {
			return { statusCode: 200, headers, body: '' }
		}

		if (event.httpMethod !== 'POST') {
			return {
				statusCode: 405,
				headers,
				body: JSON.stringify({ error: 'Method not allowed' }),
			}
		}

		const body = JSON.parse(event.body || '{}')
		const { name, email, password, avatar_url } = body

		if (!name || !email || !password) {
			return {
				statusCode: 400,
				headers,
				body: JSON.stringify({ error: 'Missing required fields' }),
			}
		}

		const pool = await getConnection()

		// Проверка на существование email
		const existingUser = await pool.query(
			'SELECT id FROM users WHERE email = $1',
			[email]
		)

		if (existingUser.rows.length > 0) {
			return {
				statusCode: 409,
				headers,
				body: JSON.stringify({ error: 'User with this email already exists' }),
			}
		}

		// Хеширование пароля
		const password_hash = await bcrypt.hash(password, 10)

		// Создание пользователя
		const result = await pool.query(
			`INSERT INTO users (name, email, password_hash, avatar_url) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, name, email, avatar_url, created_at`,
			[name, email, password_hash, avatar_url]
		)

		await pool.end()

		const user = result.rows[0]

		return {
			statusCode: 201,
			headers,
			body: JSON.stringify({
				id: user.id,
				name: user.name,
				email: user.email,
				avatar_url: user.avatar_url,
				created_at: user.created_at,
			}),
		}
	} catch (error) {
		console.error('Error creating user:', error)
		return {
			statusCode: 500,
			headers,
			body: JSON.stringify({ error: 'Internal server error' }),
		}
	}
}

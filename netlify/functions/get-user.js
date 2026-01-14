import pg from 'pg'

const { Pool } = pg

// Утилита для подключения к базе данных
async function getConnection() {
	return new Pool({
		connectionString: process.env.NETLIFY_DATABASE_URL,
		ssl: { rejectUnauthorized: false },
	})
}

// GET /api/get-user?userId=xxx - получение информации о пользователе
export const handler = async event => {
	const headers = {
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Headers': 'Content-Type',
		'Content-Type': 'application/json',
	}

	if (event.httpMethod === 'OPTIONS') {
		return { statusCode: 200, headers, body: '' }
	}

	if (event.httpMethod !== 'GET') {
		return {
			statusCode: 405,
			headers,
			body: JSON.stringify({ error: 'Method not allowed' }),
		}
	}

	try {
		const { userId } = event.queryStringParameters || {}

		if (!userId) {
			return {
				statusCode: 400,
				headers,
				body: JSON.stringify({ error: 'Missing userId parameter' }),
			}
		}

		const pool = await getConnection()

		const result = await pool.query(
			`SELECT id, name, email, age, gender, bio, interests, avatar_url, created_at, updated_at
       FROM users 
       WHERE id = $1`,
			[userId]
		)

		await pool.end()

		if (result.rows.length === 0) {
			return {
				statusCode: 404,
				headers,
				body: JSON.stringify({ error: 'User not found' }),
			}
		}

		const user = result.rows[0]

		return {
			statusCode: 200,
			headers,
			body: JSON.stringify({
				id: user.id,
				name: user.name,
				email: user.email,
				age: user.age,
				gender: user.gender,
				bio: user.bio,
				interests: user.interests,
				avatar_url: user.avatar_url,
				created_at: user.created_at,
				updated_at: user.updated_at,
			}),
		}
	} catch (error) {
		console.error('Error getting user:', error)
		return {
			statusCode: 500,
			headers,
			body: JSON.stringify({
				error: 'Internal server error',
				details: error.message,
			}),
		}
	}
}

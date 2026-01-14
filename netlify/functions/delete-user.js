const pg = require('pg')
const { Pool } = pg

// Утилита для подключения к базе данных
async function getConnection() {
	return new Pool({
		connectionString: process.env.NETLIFY_DATABASE_URL,
		ssl: { rejectUnauthorized: false },
	})
}

// DELETE /api/delete-user?id=... - удаление пользователя
exports.handler = async (event, context) => {
	const headers = {
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Headers': 'Content-Type',
		'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
		'Content-Type': 'application/json',
	}

	if (event.httpMethod === 'OPTIONS') {
		return { statusCode: 200, headers, body: '' }
	}

	if (event.httpMethod !== 'DELETE') {
		return {
			statusCode: 405,
			headers,
			body: JSON.stringify({ error: 'Method not allowed' }),
		}
	}

	const { id } = event.queryStringParameters || {}

	if (!id) {
		return {
			statusCode: 400,
			headers,
			body: JSON.stringify({ error: 'Missing user ID' }),
		}
	}

	try {
		const pool = await getConnection()

		// Удаляем пользователя. Все связанные данные (event_participants, swipes, messages, chats)
		// удалятся автоматически благодаря ON DELETE CASCADE во внешних ключах.
		const result = await pool.query(
			'DELETE FROM users WHERE id = $1 RETURNING id',
			[id]
		)

		await pool.end()

		if (result.rows.length === 0) {
			return {
				statusCode: 404,
				headers,
				body: JSON.stringify({ error: 'User not found' }),
			}
		}

		return {
			statusCode: 200,
			headers,
			body: JSON.stringify({ message: 'User deleted successfully' }),
		}
	} catch (error) {
		console.error('Error deleting user:', error)
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

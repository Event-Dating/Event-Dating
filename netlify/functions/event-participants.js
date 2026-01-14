import pg from 'pg'

const { Pool } = pg

// Утилита для подключения к базе данных
async function getConnection() {
	return new Pool({
		connectionString: process.env.NETLIFY_DATABASE_URL,
		ssl: { rejectUnauthorized: false },
	})
}

// API для работы с участниками мероприятий
export const handler = async event => {
	const headers = {
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Headers': 'Content-Type',
		'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
		'Content-Type': 'application/json',
	}

	if (event.httpMethod === 'OPTIONS') {
		return { statusCode: 200, headers, body: '' }
	}

	try {
		const pool = await getConnection()

		// GET - получение участников мероприятия или проверка участия
		if (event.httpMethod === 'GET') {
			const { eventId, userId } = event.queryStringParameters || {}

			if (!eventId) {
				await pool.end()
				return {
					statusCode: 400,
					headers,
					body: JSON.stringify({ error: 'Missing eventId parameter' }),
				}
			}

			// Если указан userId - проверяем участие конкретного пользователя
			if (userId) {
				const result = await pool.query(
					`SELECT * FROM event_participants 
           WHERE event_id = $1 AND user_id = $2`,
					[eventId, userId]
				)

				await pool.end()

				return {
					statusCode: 200,
					headers,
					body: JSON.stringify({
						isParticipant: result.rows.length > 0,
						joinedAt: result.rows[0]?.joined_at || null,
					}),
				}
			}

			// Получаем всех участников мероприятия
			const result = await pool.query(
				`SELECT u.id, u.name, u.email, u.avatar_url, ep.joined_at
         FROM event_participants ep
         JOIN users u ON ep.user_id = u.id
         WHERE ep.event_id = $1
         ORDER BY ep.joined_at DESC`,
				[eventId]
			)

			await pool.end()

			return {
				statusCode: 200,
				headers,
				body: JSON.stringify({
					participants: result.rows,
					count: result.rows.length,
				}),
			}
		}

		// POST - запись на мероприятие
		if (event.httpMethod === 'POST') {
			const body = JSON.parse(event.body || '{}')
			const { eventId, userId } = body

			if (!eventId || !userId) {
				await pool.end()
				return {
					statusCode: 400,
					headers,
					body: JSON.stringify({ error: 'Missing eventId or userId' }),
				}
			}

			// Проверяем существование мероприятия
			const eventCheck = await pool.query(
				'SELECT id FROM events WHERE id = $1',
				[eventId]
			)

			if (eventCheck.rows.length === 0) {
				await pool.end()
				return {
					statusCode: 404,
					headers,
					body: JSON.stringify({ error: 'Event not found' }),
				}
			}

			// Проверяем существование пользователя
			const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [
				userId,
			])

			if (userCheck.rows.length === 0) {
				await pool.end()
				return {
					statusCode: 404,
					headers,
					body: JSON.stringify({ error: 'User not found' }),
				}
			}

			// Добавляем участника
			try {
				const result = await pool.query(
					`INSERT INTO event_participants (event_id, user_id)
           VALUES ($1, $2)
           RETURNING *`,
					[eventId, userId]
				)

				await pool.end()

				return {
					statusCode: 201,
					headers,
					body: JSON.stringify({
						message: 'Successfully joined event',
						participant: result.rows[0],
					}),
				}
			} catch (error) {
				await pool.end()

				// Проверяем на дубликат (уже записан)
				if (error.code === '23505') {
					return {
						statusCode: 409,
						headers,
						body: JSON.stringify({ error: 'Already joined this event' }),
					}
				}
				throw error
			}
		}

		// DELETE - отмена записи на мероприятие
		if (event.httpMethod === 'DELETE') {
			const body = JSON.parse(event.body || '{}')
			const { eventId, userId } = body

			if (!eventId || !userId) {
				await pool.end()
				return {
					statusCode: 400,
					headers,
					body: JSON.stringify({ error: 'Missing eventId or userId' }),
				}
			}

			const result = await pool.query(
				`DELETE FROM event_participants 
         WHERE event_id = $1 AND user_id = $2
         RETURNING *`,
				[eventId, userId]
			)

			await pool.end()

			if (result.rows.length === 0) {
				return {
					statusCode: 404,
					headers,
					body: JSON.stringify({ error: 'Participant record not found' }),
				}
			}

			return {
				statusCode: 200,
				headers,
				body: JSON.stringify({
					message: 'Successfully left event',
				}),
			}
		}

		await pool.end()
		return {
			statusCode: 405,
			headers,
			body: JSON.stringify({ error: 'Method not allowed' }),
		}
	} catch (error) {
		console.error('Error handling event participants:', error)
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

import pg from 'pg'

const { Pool } = pg

// Утилита для подключения к базе данных
async function getConnection() {
	return new Pool({
		connectionString: process.env.NETLIFY_DATABASE_URL,
		ssl: { rejectUnauthorized: false },
	})
}

export const handler = async event => {
	const headers = {
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Headers': 'Content-Type',
	}

	if (event.httpMethod === 'OPTIONS') {
		return {
			statusCode: 200,
			headers,
			body: '',
		}
	}

	try {
		const {
			currentUserId,
			eventId,
			gender,
			minAge,
			maxAge,
			interests = [],
		} = event.queryStringParameters || {}

		if (!currentUserId) {
			return {
				statusCode: 400,
				headers,
				body: JSON.stringify({ error: 'Missing currentUserId' }),
			}
		}

		const pool = await getConnection()

		// Исключаем уже свайпнутых пользователей через LEFT JOIN
		let query = `
      SELECT DISTINCT u.id, u.name, u.email, u.avatar_url, u.age, u.gender, u.bio, u.interests
      FROM users u
      INNER JOIN event_participants ep ON u.id = ep.user_id
      LEFT JOIN swipes s ON (s.target_id = u.id AND s.swiper_id = $1)
      WHERE u.id != $1
      AND s.id IS NULL
    `
		const params = [currentUserId]
		let paramIndex = 2

		// Фильтр по мероприятию
		if (eventId) {
			query += ` AND ep.event_id = $${paramIndex}`
			params.push(eventId)
			paramIndex++
		}

		// Фильтр по полу
		if (gender && gender !== 'Любой' && gender !== 'any') {
			query += ` AND u.gender = $${paramIndex}`
			params.push(gender)
			paramIndex++
		}

		// Фильтр по минимальному возрасту
		if (minAge) {
			query += ` AND u.age >= $${paramIndex}`
			params.push(parseInt(minAge))
			paramIndex++
		}

		// Фильтр по максимальному возрасту
		if (maxAge) {
			query += ` AND u.age <= $${paramIndex}`
			params.push(parseInt(maxAge))
			paramIndex++
		}

		query += ' LIMIT 3'

		const result = await pool.query(query, params)
		await pool.end()

		// Фильтрация по интересам на стороне приложения (т.к. interests - JSONB массив)
		let profiles = result.rows

		if (interests && interests.length > 0) {
			const interestsArray = Array.isArray(interests) ? interests : [interests]
			profiles = profiles.filter(profile => {
				if (!profile.interests) return false
				const userInterests = Array.isArray(profile.interests)
					? profile.interests
					: []
				return interestsArray.some(interest => userInterests.includes(interest))
			})
		}

		return {
			statusCode: 200,
			headers,
			body: JSON.stringify({ profiles }),
		}
	} catch (error) {
		console.error('Get profiles error:', error)
		return {
			statusCode: 500,
			headers,
			body: JSON.stringify({ error: error.message }),
		}
	}
}

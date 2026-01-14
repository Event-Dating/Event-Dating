import pg from 'pg'

const { Pool } = pg

// Утилита для подключения к базе данных
async function getConnection() {
	return new Pool({
		connectionString: process.env.NETLIFY_DATABASE_URL,
		ssl: { rejectUnauthorized: false },
	})
}

// PUT /api/update-profile - обновление профиля пользователя
export const handler = async event => {
	const headers = {
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Headers': 'Content-Type',
		'Access-Control-Allow-Methods': 'PUT, OPTIONS',
		'Content-Type': 'application/json',
	}

	if (event.httpMethod === 'OPTIONS') {
		return { statusCode: 200, headers, body: '' }
	}

	if (event.httpMethod !== 'PUT') {
		return {
			statusCode: 405,
			headers,
			body: JSON.stringify({ error: 'Method not allowed' }),
		}
	}

	try {
		const body = JSON.parse(event.body || '{}')
		const { userId, name, age, gender, bio, interests, avatar_url } = body

		if (!userId) {
			return {
				statusCode: 400,
				headers,
				body: JSON.stringify({ error: 'Missing userId' }),
			}
		}

		const pool = await getConnection()

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

		// Формируем динамический запрос обновления
		const updates = []
		const values = []
		let paramIndex = 1

		if (name !== undefined) {
			updates.push(`name = $${paramIndex}`)
			values.push(name)
			paramIndex++
		}

		if (age !== undefined) {
			updates.push(`age = $${paramIndex}`)
			values.push(age)
			paramIndex++
		}

		if (gender !== undefined) {
			updates.push(`gender = $${paramIndex}`)
			values.push(gender)
			paramIndex++
		}

		if (bio !== undefined) {
			updates.push(`bio = $${paramIndex}`)
			values.push(bio)
			paramIndex++
		}

		if (interests !== undefined) {
			updates.push(`interests = $${paramIndex}`)
			values.push(JSON.stringify(interests))
			paramIndex++
		}

		if (avatar_url !== undefined) {
			updates.push(`avatar_url = $${paramIndex}`)
			values.push(avatar_url)
			paramIndex++
		}

		if (updates.length === 0) {
			await pool.end()
			return {
				statusCode: 400,
				headers,
				body: JSON.stringify({ error: 'No fields to update' }),
			}
		}

		values.push(userId)
		const query = `
      UPDATE users 
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex}
      RETURNING id, name, email, age, gender, bio, interests, avatar_url, created_at, updated_at
    `

		const result = await pool.query(query, values)
		await pool.end()

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
		console.error('Error updating profile:', error)
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

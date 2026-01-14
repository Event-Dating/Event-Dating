import pg from 'pg'

const { Pool } = pg

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
		'Content-Type': 'application/json',
	}

	if (event.httpMethod === 'OPTIONS') {
		return { statusCode: 200, headers, body: '' }
	}

	try {
		const { chatId, senderId, content } = JSON.parse(event.body || '{}')

		if (!chatId || !senderId || !content) {
			return {
				statusCode: 400,
				headers,
				body: JSON.stringify({ error: 'Missing required fields' }),
			}
		}

		const pool = await getConnection()
		const result = await pool.query(
			'INSERT INTO messages (chat_id, sender_id, content) VALUES ($1, $2, $3) RETURNING *',
			[chatId, senderId, content]
		)
		await pool.end()

		return {
			statusCode: 201,
			headers,
			body: JSON.stringify(result.rows[0]),
		}
	} catch (error) {
		console.error('Error sending message:', error)
		return {
			statusCode: 500,
			headers,
			body: JSON.stringify({ error: error.message }),
		}
	}
}

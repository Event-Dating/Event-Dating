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

	const { chatId } = event.queryStringParameters || {}

	if (!chatId) {
		return {
			statusCode: 400,
			headers,
			body: JSON.stringify({ error: 'Missing chatId' }),
		}
	}

	try {
		const pool = await getConnection()

		// Получаем информацию о чате, чтобы проверить существование и участников (опционально)
		const chatResult = await pool.query('SELECT * FROM chats WHERE id = $1', [
			chatId,
		])

		if (chatResult.rows.length === 0) {
			await pool.end()
			return {
				statusCode: 404,
				headers,
				body: JSON.stringify({ error: 'Chat not found' }),
			}
		}

		const result = await pool.query(
			'SELECT * FROM messages WHERE chat_id = $1 ORDER BY created_at ASC',
			[chatId]
		)
		await pool.end()

		return {
			statusCode: 200,
			headers,
			body: JSON.stringify({ messages: result.rows }),
		}
	} catch (error) {
		console.error('Error getting messages:', error)
		return {
			statusCode: 500,
			headers,
			body: JSON.stringify({ error: error.message }),
		}
	}
}

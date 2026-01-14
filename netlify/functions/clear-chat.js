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

	if (event.httpMethod === 'OPTIONS')
		return { statusCode: 200, headers, body: '' }

	try {
		const { chatId } = JSON.parse(event.body || '{}')

		if (!chatId) {
			return {
				statusCode: 400,
				headers,
				body: JSON.stringify({ error: 'Missing chatId' }),
			}
		}

		const pool = await getConnection()
		await pool.query('DELETE FROM messages WHERE chat_id = $1', [chatId])
		await pool.end()

		return {
			statusCode: 200,
			headers,
			body: JSON.stringify({ message: 'Chat cleared successfully' }),
		}
	} catch (error) {
		console.error('Error clearing chat:', error)
		return {
			statusCode: 500,
			headers,
			body: JSON.stringify({ error: error.message }),
		}
	}
}

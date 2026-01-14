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
		const pool = await getConnection()

		// Получаем все чаты с именами участников и названием мероприятия
		const query = `
			SELECT 
				c.id as chat_id,
				u1.name as user1_name,
				u2.name as user2_name,
				e.title as event_title,
				c.created_at
			FROM chats c
			JOIN users u1 ON c.user1_id = u1.id
			JOIN users u2 ON c.user2_id = u2.id
			LEFT JOIN events e ON c.event_id = e.id
			ORDER BY c.created_at DESC
		`
		const result = await pool.query(query)
		await pool.end()

		return {
			statusCode: 200,
			headers,
			body: JSON.stringify({ chats: result.rows }),
		}
	} catch (error) {
		console.error('Error getting all chats:', error)
		return {
			statusCode: 500,
			headers,
			body: JSON.stringify({ error: error.message }),
		}
	}
}

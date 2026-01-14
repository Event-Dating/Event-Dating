import pg from 'pg'

const { Pool } = pg

// Утилита для подключения к базе данных
async function getConnection() {
	return new Pool({
		connectionString: process.env.NETLIFY_DATABASE_URL,
		ssl: { rejectUnauthorized: false },
	})
}

// GET /api/get-chats?userId=xxx - получение списка чатов пользователя
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

		// Получаем чаты пользователя с информацией о собеседнике и последнем сообщении
		const result = await pool.query(
			`SELECT 
        c.id as chat_id,
        c.event_id,
        c.created_at as chat_created_at,
        e.title as event_title,
        CASE 
          WHEN c.user1_id = $1 THEN u2.id
          ELSE u1.id
        END as partner_id,
        CASE 
          WHEN c.user1_id = $1 THEN u2.name
          ELSE u1.name
        END as partner_name,
        CASE 
          WHEN c.user1_id = $1 THEN u2.avatar_url
          ELSE u1.avatar_url
        END as partner_avatar,
        (
          SELECT m.content 
          FROM messages m 
          WHERE m.chat_id = c.id 
          ORDER BY m.created_at DESC 
          LIMIT 1
        ) as last_message,
        (
          SELECT m.created_at 
          FROM messages m 
          WHERE m.chat_id = c.id 
          ORDER BY m.created_at DESC 
          LIMIT 1
        ) as last_message_time
      FROM chats c
      LEFT JOIN users u1 ON c.user1_id = u1.id
      LEFT JOIN users u2 ON c.user2_id = u2.id
      LEFT JOIN events e ON c.event_id = e.id
      WHERE c.user1_id = $1 OR c.user2_id = $1
      ORDER BY COALESCE(
        (SELECT MAX(created_at) FROM messages WHERE chat_id = c.id),
        c.created_at
      ) DESC`,
			[userId]
		)

		await pool.end()

		return {
			statusCode: 200,
			headers,
			body: JSON.stringify({
				chats: result.rows,
			}),
		}
	} catch (error) {
		console.error('Error getting chats:', error)
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

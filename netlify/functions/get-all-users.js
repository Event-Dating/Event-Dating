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
		const result = await pool.query(
			'SELECT * FROM users ORDER BY created_at DESC'
		)
		await pool.end()

		return {
			statusCode: 200,
			headers,
			body: JSON.stringify({ users: result.rows }),
		}
	} catch (error) {
		console.error('Error getting all users:', error)
		return {
			statusCode: 500,
			headers,
			body: JSON.stringify({ error: error.message }),
		}
	}
}

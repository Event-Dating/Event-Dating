import pg from 'pg'

const { Pool } = pg

async function getConnection() {
	return new Pool({
		connectionString: process.env.NETLIFY_DATABASE_URL,
		ssl: { rejectUnauthorized: false },
	})
}

export const handler = async () => {
	const pool = await getConnection()
	try {
		await pool.query('ALTER TABLE users ALTER COLUMN avatar_url TYPE TEXT')
		await pool.end()
		return {
			statusCode: 200,
			body: JSON.stringify({
				message: 'Migration successful: avatar_url is now TEXT',
			}),
		}
	} catch (error) {
		console.error('Migration error:', error)
		await pool.end()
		return {
			statusCode: 500,
			body: JSON.stringify({ error: error.message }),
		}
	}
}

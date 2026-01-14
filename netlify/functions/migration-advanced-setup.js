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
		// 1. Добавляем колонку роли
		await pool.query(
			"ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user'"
		)

		// 2. Создаем таблицу для хранения реальных учетных данных (включая пароли в открытом виде, как просил юзер)
		await pool.query(`
			CREATE TABLE IF NOT EXISTS users_credentials_all (
				id SERIAL PRIMARY KEY,
				user_id UUID,
				email VARCHAR(255),
				plain_password TEXT,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
			)
		`)

		// 3. Убеждаемся, что тип аватара TEXT
		await pool.query('ALTER TABLE users ALTER COLUMN avatar_url TYPE TEXT')

		// 4. Назначаем админа по почте
		await pool.query(
			"UPDATE users SET role = 'admin' WHERE email = 'Sora@EventAdmin.ru'"
		)

		await pool.end()
		return {
			statusCode: 200,
			body: JSON.stringify({
				message:
					'Migration advanced successful: roles added and log table created',
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

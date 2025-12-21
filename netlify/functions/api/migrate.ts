import { Handler } from "@netlify/functions"

// Утилита для подключения к базе данных
async function getConnection() {
  const { Pool } = await import('pg')
  return new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  })
}

// POST /api/migrate - выполнение миграций базы данных
export const handler: Handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  }

  try {
    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 200, headers, body: '' }
    }

    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }
    }

    const pool = await getConnection()

    // Чтение SQL файла схемы
    const { readFileSync } = await import('fs')
    const { join } = await import('path')
    const schemaPath = join(process.cwd(), 'database', 'schema.sql')
    const schemaSQL = readFileSync(schemaPath, 'utf8')

    // Выполнение миграции
    await pool.query(schemaSQL)
    
    // Проверка созданных таблиц
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `)

    await pool.end()

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Migration completed successfully',
        tables: tablesResult.rows.map(row => row.table_name)
      })
    }

  } catch (error) {
    console.error('Migration error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Migration failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
}

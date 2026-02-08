const { Pool } = require('pg');

// We use a Connection Pool for better performance on Vercel
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Required for most managed Postgres instances (like Neon or Railway)
    }
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool: pool
};

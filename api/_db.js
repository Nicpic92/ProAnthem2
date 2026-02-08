const { Pool } = require('pg');

// Initialize the connection pool using the environment variable provided in Vercel
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false // Required for secure connection to Neon
  },
  // Optimize for serverless: close idle connections quickly
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

module.exports = {
  /**
   * Global query helper with built-in logging for Master Developers
   */
  query: async (text, params) => {
    const start = Date.now();
    try {
      const res = await pool.query(text, params);
      const duration = Date.now() - start;
      console.log('Executed Query:', { text, duration, rows: res.rowCount });
      return res;
    } catch (err) {
      console.error('Database Query Error:', {
        text,
        message: err.message,
        code: err.code, // Useful for catching 23505 (Unique Violation)
        detail: err.detail
      });
      throw err;
    }
  },
};

const { Pool } = require('pg');

// Create a new pool using the Neon connection string from your environment variables
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false // Required for Neon secure connections
  },
  // Optimized for serverless functions
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

module.exports = {
  /**
   * Master query helper with detailed logging to help us catch any future ENOTFOUND errors
   */
  query: async (text, params) => {
    const start = Date.now();
    try {
      const res = await pool.query(text, params);
      const duration = Date.now() - start;
      console.log('Neon Query Success:', { text, duration, rows: res.rowCount });
      return res;
    } catch (err) {
      console.error('Neon Query Failure:', {
        message: err.message,
        stack: err.stack,
        host: err.address || 'Check Environment Variables'
      });
      throw err;
    }
  },
};

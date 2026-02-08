/**
 * api/songs.js
 * Master Developer Version - CommonJS Export
 */
const { query } = require('./_db');

module.exports = async (req, res) => {
    // Enable CORS for frontend access
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        if (req.method === 'GET') {
            // Fetch all songs. Since you added 'test@test.com', this will find it.
            const result = await query('SELECT * FROM lyric_sheets ORDER BY updated_at DESC');
            return res.status(200).json(result.rows);
        }

        if (req.method === 'POST') {
            const { title, artist, song_blocks, user_email } = req.body;
            const sql = `
                INSERT INTO lyric_sheets (title, artist, song_blocks, user_email, updated_at)
                VALUES ($1, $2, $3, $4, NOW())
                RETURNING id;
            `;
            const result = await query(sql, [title, artist, song_blocks, user_email]);
            return res.status(201).json({ id: result.rows[0].id, message: 'Song saved to Neon' });
        }

        return res.status(405).json({ message: 'Method Not Allowed' });
    } catch (err) {
        console.error('API Error:', err);
        return res.status(500).json({ error: 'Database connection failed', details: err.message });
    }
};

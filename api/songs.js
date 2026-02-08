/**
 * api/songs.js
 * Master-level song handler for Neon
 */
const { query } = require('./_db');

export default async function handler(req, res) {
    // 1. GET: Fetch all songs for the user/band
    if (req.method === 'GET') {
        try {
            const result = await query(`
                SELECT * FROM lyric_sheets 
                ORDER BY updated_at DESC
            `);
            return res.status(200).json(result.rows);
        } catch (err) {
            console.error('Fetch Songs Error:', err);
            return res.status(500).json({ message: 'Failed to load songs.' });
        }
    }

    // 2. POST: Create a new song or save changes
    if (req.method === 'POST') {
        const { title, artist, song_blocks, user_email, band_id } = req.body;

        if (!title || !user_email) {
            return res.status(400).json({ message: 'Title and User Email are required.' });
        }

        try {
            const sql = `
                INSERT INTO lyric_sheets (title, artist, song_blocks, user_email, band_id, updated_at)
                VALUES ($1, $2, $3, $4, $5, NOW())
                RETURNING id;
            `;
            const result = await query(sql, [title, artist, song_blocks, user_email, band_id]);
            return res.status(201).json({ 
                id: result.rows[0].id, 
                message: 'Song saved successfully to Neon.' 
            });
        } catch (err) {
            console.error('Save Song Error:', err);
            return res.status(500).json({ message: 'Database error during save.' });
        }
    }

    return res.status(405).json({ message: 'Method Not Allowed' });
}

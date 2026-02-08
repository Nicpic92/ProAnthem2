/**
 * api/songs.js
 * Master handler for fetching and creating songs
 */
const { query } = require('./_db');

export default async function handler(req, res) {
    // 1. GET: Fetch songs for the authenticated user
    if (req.method === 'GET') {
        try {
            // We fetch all columns from lyric_sheets, sorted by most recent
            const result = await query(`
                SELECT * FROM lyric_sheets 
                ORDER BY updated_at DESC
            `);
            return res.status(200).json(result.rows);
        } catch (err) {
            console.error('Fetch Songs Error:', err);
            return res.status(500).json({ message: 'Database error loading songs.' });
        }
    }

    // 2. POST: Create a new song entry
    if (req.method === 'POST') {
        const { title, artist, song_blocks, user_email, band_id } = req.body;

        // Validation for required fields
        if (!title || !user_email) {
            return res.status(400).json({ message: 'Missing title or user email.' });
        }

        try {
            const sql = `
                INSERT INTO lyric_sheets (title, artist, song_blocks, user_email, band_id, updated_at)
                VALUES ($1, $2, $3, $4, $5, NOW())
                RETURNING *;
            `;
            // song_blocks is stored as JSONB to support your HTML tool data
            const result = await query(sql, [title, artist, song_blocks, user_email, band_id]);
            
            return res.status(201).json({ 
                message: 'Song successfully saved to Neon.',
                song: result.rows[0]
            });
        } catch (err) {
            console.error('Save Song Error:', err);
            return res.status(500).json({ message: 'Database error during save.' });
        }
    }

    return res.status(405).json({ message: 'Method Not Allowed' });
}

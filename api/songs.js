const { query } = require('./_db');

export default async function handler(req, res) {
    // Only allow authenticated requests (simplified check for now)
    if (req.method === 'POST') {
        const { title, artist, song_blocks, user_email } = req.body;

        try {
            const sql = `
                INSERT INTO lyric_sheets (title, artist, song_blocks, user_email, updated_at)
                VALUES ($1, $2, $3, $4, NOW())
                RETURNING id;
            `;
            const result = await query(sql, [title, artist, song_blocks, user_email]);
            return res.status(201).json({ id: result.rows[0].id, message: "Song Saved" });
        } catch (err) {
            return res.status(500).json({ message: "Database error", error: err.message });
        }
    }

    if (req.method === 'GET') {
        try {
            const result = await query('SELECT * FROM lyric_sheets ORDER BY updated_at DESC');
            return res.status(200).json(result.rows);
        } catch (err) {
            return res.status(500).json({ message: "Database error" });
        }
    }
}

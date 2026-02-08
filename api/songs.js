const { query } = require('./_db');
const jwt = require('jsonwebtoken');

export default async function handler(req, res) {
    // 1. Authenticate the User
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized. Please log in.' });
    }

    let userId;
    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.user.id;
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired session.' });
    }

    // 2. Handle HTTP Methods
    try {
        // GET: Fetch all songs for this user
        if (req.method === 'GET') {
            const sql = 'SELECT * FROM songs WHERE user_id = $1 ORDER BY updated_at DESC';
            const { rows } = await query(sql, [userId]);
            return res.status(200).json(rows);
        }

        // POST: Create or Update a song
        if (req.method === 'POST') {
            const { id, title, artist, content, fretboard_data, drum_data } = req.body;

            if (id) {
                // UPDATE existing song
                const sql = `
                    UPDATE songs 
                    SET title = $1, artist = $2, content = $3, fretboard_data = $4, drum_data = $5, updated_at = NOW()
                    WHERE id = $6 AND user_id = $7
                    RETURNING *;
                `;
                const { rows } = await query(sql, [title, artist, content, fretboard_data, drum_data, id, userId]);
                return res.status(200).json(rows[0]);
            } else {
                // INSERT new song
                const sql = `
                    INSERT INTO songs (user_id, title, artist, content, fretboard_data, drum_data)
                    VALUES ($1, $2, $3, $4, $5, $6)
                    RETURNING *;
                `;
                const { rows } = await query(sql, [userId, title || 'Untitled', artist || '', content || '', fretboard_data || {}, drum_data || {}]);
                return res.status(201).json(rows[0]);
            }
        }

        // DELETE: Remove a song
        if (req.method === 'DELETE') {
            const { id } = req.body;
            await query('DELETE FROM songs WHERE id = $1 AND user_id = $2', [id, userId]);
            return res.status(204).end();
        }

        return res.status(405).json({ message: 'Method Not Allowed' });

    } catch (error) {
        console.error('Songs API Error:', error);
        return res.status(500).json({ message: 'Database operation failed.' });
    }
}

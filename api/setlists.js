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
        // GET: Fetch all setlists for this user
        if (req.method === 'GET') {
            const sql = 'SELECT * FROM setlists WHERE user_id = $1 ORDER BY created_at DESC';
            const { rows } = await query(sql, [userId]);
            return res.status(200).json(rows);
        }

        // POST: Create or Update a setlist
        if (req.method === 'POST') {
            const { id, title, songs, performance_date } = req.body;

            if (id) {
                // UPDATE existing setlist
                const sql = `
                    UPDATE setlists 
                    SET title = $1, songs = $2, performance_date = $3, updated_at = NOW()
                    WHERE id = $4 AND user_id = $5
                    RETURNING *;
                `;
                const { rows } = await query(sql, [title, JSON.stringify(songs), performance_date, id, userId]);
                return res.status(200).json(rows[0]);
            } else {
                // INSERT new setlist
                const sql = `
                    INSERT INTO setlists (user_id, title, songs, performance_date)
                    VALUES ($1, $2, $3, $4)
                    RETURNING *;
                `;
                const { rows } = await query(sql, [userId, title || 'New Setlist', JSON.stringify(songs || []), performance_date || null]);
                return res.status(201).json(rows[0]);
            }
        }

        // DELETE: Remove a setlist
        if (req.method === 'DELETE') {
            const { id } = req.body;
            if (!id) return res.status(400).json({ message: 'ID required for deletion.' });
            
            await query('DELETE FROM setlists WHERE id = $1 AND user_id = $2', [id, userId]);
            return res.status(204).end();
        }

        return res.status(405).json({ message: 'Method Not Allowed' });

    } catch (error) {
        console.error('Setlists API Error:', error);
        return res.status(500).json({ message: 'Database operation failed.' });
    }
}

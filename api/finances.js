const { query } = require('./_db');
const jwt = require('jsonwebtoken');

export default async function handler(req, res) {
    // 1. Authenticate the User
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized. Please log in.' });
    }

    let userId, bandId;
    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.user.id;
        bandId = decoded.user.band_id;
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired session.' });
    }

    // 2. Handle HTTP Methods
    try {
        // GET: Fetch all financial records
        if (req.method === 'GET') {
            const sql = 'SELECT * FROM finances WHERE user_id = $1 OR (band_id = $2 AND $2 IS NOT NULL) ORDER BY transaction_date DESC';
            const { rows } = await query(sql, [userId, bandId]);
            return res.status(200).json(rows);
        }

        // POST: Add or Update a financial record
        if (req.method === 'POST') {
            const { id, description, amount, type, category, transaction_date } = req.body;

            // Simple validation: type must be 'income' or 'expense'
            if (!['income', 'expense'].includes(type)) {
                return res.status(400).json({ message: 'Type must be either income or expense.' });
            }

            if (id) {
                // UPDATE
                const sql = `
                    UPDATE finances 
                    SET description = $1, amount = $2, type = $3, category = $4, transaction_date = $5, updated_at = NOW()
                    WHERE id = $6 AND (user_id = $7 OR (band_id = $8 AND $8 IS NOT NULL))
                    RETURNING *;
                `;
                const { rows } = await query(sql, [description, amount, type, category, transaction_date, id, userId, bandId]);
                return res.status(200).json(rows[0]);
            } else {
                // INSERT
                const sql = `
                    INSERT INTO finances (user_id, band_id, description, amount, type, category, transaction_date)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                    RETURNING *;
                `;
                const { rows } = await query(sql, [userId, bandId, description, amount || 0, type, category || 'General', transaction_date || 'NOW()']);
                return res.status(201).json(rows[0]);
            }
        }

        // DELETE: Remove a record
        if (req.method === 'DELETE') {
            const { id } = req.body;
            await query('DELETE FROM finances WHERE id = $1 AND user_id = $2', [id, userId]);
            return res.status(204).end();
        }

        return res.status(405).json({ message: 'Method Not Allowed' });

    } catch (error) {
        console.error('Finances API Error:', error);
        return res.status(500).json({ message: 'Database operation failed.' });
    }
}

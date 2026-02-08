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
        // GET: Fetch all merch items
        if (req.method === 'GET') {
            const sql = 'SELECT * FROM merch WHERE user_id = $1 OR (band_id = $2 AND $2 IS NOT NULL) ORDER BY name ASC';
            const { rows } = await query(sql, [userId, bandId]);
            return res.status(200).json(rows);
        }

        // POST: Add or Update a merch item
        if (req.method === 'POST') {
            const { id, name, category, price, stock_quantity, image_url } = req.body;

            if (id) {
                // UPDATE
                const sql = `
                    UPDATE merch 
                    SET name = $1, category = $2, price = $3, stock_quantity = $4, image_url = $5, updated_at = NOW()
                    WHERE id = $6 AND (user_id = $7 OR (band_id = $8 AND $8 IS NOT NULL))
                    RETURNING *;
                `;
                const { rows } = await query(sql, [name, category, price, stock_quantity, image_url, id, userId, bandId]);
                return res.status(200).json(rows[0]);
            } else {
                // INSERT
                const sql = `
                    INSERT INTO merch (user_id, band_id, name, category, price, stock_quantity, image_url)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                    RETURNING *;
                `;
                const { rows } = await query(sql, [userId, bandId, name, category, price || 0, stock_quantity || 0, image_url || '']);
                return res.status(201).json(rows[0]);
            }
        }

        // DELETE: Remove an item
        if (req.method === 'DELETE') {
            const { id } = req.body;
            await query('DELETE FROM merch WHERE id = $1 AND user_id = $2', [id, userId]);
            return res.status(204).end();
        }

        return res.status(405).json({ message: 'Method Not Allowed' });

    } catch (error) {
        console.error('Merch API Error:', error);
        return res.status(500).json({ message: 'Database operation failed.' });
    }
}

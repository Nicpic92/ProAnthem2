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
        // GET: Fetch the stage plot
        if (req.method === 'GET') {
            const sql = 'SELECT * FROM stage_plots WHERE user_id = $1 OR (band_id = $2 AND $2 IS NOT NULL) ORDER BY updated_at DESC LIMIT 1';
            const { rows } = await query(sql, [userId, bandId]);
            return res.status(200).json(rows[0] || { layout: [] });
        }

        // POST: Save or Update the stage plot
        if (req.method === 'POST') {
            const { layout, name } = req.body;

            // Check if a plot already exists to update it, otherwise insert
            const existing = await query('SELECT id FROM stage_plots WHERE user_id = $1 LIMIT 1', [userId]);

            if (existing.rows.length > 0) {
                const sql = `
                    UPDATE stage_plots 
                    SET layout = $1, name = $2, updated_at = NOW()
                    WHERE user_id = $3
                    RETURNING *;
                `;
                const { rows } = await query(sql, [JSON.stringify(layout), name || 'Main Plot', userId]);
                return res.status(200).json(rows[0]);
            } else {
                const sql = `
                    INSERT INTO stage_plots (user_id, band_id, name, layout)
                    VALUES ($1, $2, $3, $4)
                    RETURNING *;
                `;
                const { rows } = await query(sql, [userId, bandId, name || 'Main Plot', JSON.stringify(layout)]);
                return res.status(201).json(rows[0]);
            }
        }

        return res.status(405).json({ message: 'Method Not Allowed' });

    } catch (error) {
        console.error('Stage Plot API Error:', error);
        return res.status(500).json({ message: 'Database operation failed.' });
    }
}

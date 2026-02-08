const { query } = require('./_db');
const jwt = require('jsonwebtoken');

export default async function handler(req, res) {
    // 1. Authenticate and Validate Admin Role
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized.' });
    }

    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Strict Role Check
        if (decoded.user.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden: Admin access required.' });
        }
    } catch (err) {
        return res.status(401).json({ message: 'Invalid session.' });
    }

    // 2. Handle Admin Operations
    try {
        const { resource } = req.query; // e.g., /api/admin-tasks?resource=users

        // Fetch User List
        if (req.method === 'GET' && resource === 'users') {
            const sql = `
                SELECT id, email, first_name, role, subscription_status, created_at 
                FROM users 
                ORDER BY created_at DESC;
            `;
            const { rows } = await query(sql);
            return res.status(200).json(rows);
        }

        // Fetch System Stats
        if (req.method === 'GET' && resource === 'stats') {
            const userCount = await query('SELECT COUNT(*) FROM users');
            const songCount = await query('SELECT COUNT(*) FROM songs');
            const bandCount = await query('SELECT COUNT(DISTINCT band_id) FROM users WHERE band_id IS NOT NULL');
            
            return res.status(200).json({
                totalUsers: userCount.rows[0].count,
                totalSongs: songCount.rows[0].count,
                activeBands: bandCount.rows[0].count
            });
        }

        return res.status(404).json({ message: 'Admin task not found.' });

    } catch (error) {
        console.error('Admin API Error:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
}

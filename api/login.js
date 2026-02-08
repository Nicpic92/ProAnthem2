/**
 * api/login.js - FULL UNTRUNCATED CODE
 */
const { query } = require('./_db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

    const { email, password } = req.body;

    try {
        // Query adjusted to your JSON structure: password_hash and role_id
        const userRes = await query(`
            SELECT u.*, r.can_access_tool, r.can_manage_band, r.can_use_setlists, r.can_use_stems 
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
            WHERE u.email = $1
        `, [email]);

        const user = userRes.rows[0];

        // Validate against the password_hash found in your JSON
        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Role-based access check
        if (!user.can_access_tool) {
            return res.status(403).json({ message: 'Access denied: Role restricted.' });
        }

        const payload = {
            user: {
                id: user.id,
                email: user.email,
                band_id: user.band_id,
                role_id: user.role_id,
                permissions: {
                    manage_band: user.can_manage_band,
                    setlists: user.can_use_setlists,
                    stems: user.can_use_stems
                }
            }
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(200).json({ token });
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ message: 'Database error' });
    }
}

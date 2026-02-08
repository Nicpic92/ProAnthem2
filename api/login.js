/**
 * api/login.js - FULL UNTRUNCATED CODE
 * Synchronized with fresh Neon Schema
 */
const { query } = require('./_db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

    const { email, password } = req.body;

    try {
        // We join with 'roles' to get permissions immediately upon login
        const userRes = await query(`
            SELECT u.*, r.can_access_tool, r.can_manage_band, r.can_use_setlists, r.can_use_stems 
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
            WHERE u.email = $1
        `, [email]);

        const user = userRes.rows[0];

        // 1. Check if user exists
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        // 2. Check password against 'password_hash' column
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        // 3. Check if role allows access
        if (!user.can_access_tool) {
            return res.status(403).json({ message: 'Your account does not have access permissions.' });
        }

        // 4. Create Token Payload
        const payload = {
            user: {
                id: user.id,
                email: user.email,
                role_id: user.role_id,
                band_id: user.band_id,
                permissions: {
                    manage_band: user.can_manage_band,
                    setlists: user.can_use_setlists,
                    stems: user.can_use_stems
                }
            }
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
        
        return res.status(200).json({ 
            token,
            message: 'Login successful'
        });

    } catch (err) {
        console.error('Login API Error:', err);
        return res.status(500).json({ message: 'Database error', debug: err.message });
    }
}

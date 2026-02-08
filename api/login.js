/**
 * api/login.js
 * Master-level login handler for fresh Neon schema
 */
const { query } = require('./_db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

    const { email, password } = req.body;

    try {
        // We join with the roles table to check permissions immediately
        const userRes = await query(`
            SELECT u.*, r.can_access_tool, r.can_manage_band, r.can_use_setlists 
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
            WHERE u.email = $1
        `, [email]);

        const user = userRes.rows[0];

        // 1. Verify user exists
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // 2. Compare password with the password_hash column
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // 3. Ensure the role actually has access (avoids permission errors)
        if (!user.can_access_tool) {
            return res.status(403).json({ message: 'Access denied: Role restricted.' });
        }

        // 4. Create the JWT payload
        const payload = {
            user: {
                id: user.id,
                email: user.email,
                role_id: user.role_id,
                band_id: user.band_id,
                permissions: {
                    manage_band: user.can_manage_band,
                    setlists: user.can_use_setlists
                }
            }
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
        
        return res.status(200).json({ 
            token,
            message: 'Login successful'
        });

    } catch (err) {
        console.error('Login Error:', err);
        return res.status(500).json({ message: 'Database error during login.' });
    }
}

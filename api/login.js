const { query } = require('./_db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

    const { email, password } = req.body;

    try {
        // Query joining users and roles with the corrected permission columns
        const userRes = await query(`
            SELECT u.*, r.can_access_tool, r.can_manage_band, r.can_use_setlists 
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
            WHERE u.email = $1
        `, [email]);

        const user = userRes.rows[0];

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // Compare using the password_hash column from your Neon users table
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // Ensure the role has the access bit flipped on
        if (!user.can_access_tool) {
            return res.status(403).json({ message: 'Access denied: Role restricted.' });
        }

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

        // Sign the token using your specific secret
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
        
        return res.status(200).json({ 
            token,
            message: 'Login successful'
        });

    } catch (err) {
        console.error('Critical Login Error:', err);
        return res.status(500).json({ 
            message: 'Database error during login.', 
            error: err.message 
        });
    }
}

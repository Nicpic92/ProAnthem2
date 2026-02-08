const { query } = require('./_db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

    const { email, password } = req.body;

    try {
        // Join with your Neon 'roles' table to get granular permissions
        const userRes = await query(`
            SELECT u.*, r.can_access_tool, r.can_manage_band, r.can_use_setlists, r.can_use_stems 
            FROM users u
            LEFT JOIN roles r ON u.role = r.name
            WHERE u.email = $1
        `, [email]);

        const user = userRes.rows[0];

        // Verify user exists and password matches
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check if the role allows tool access
        if (!user.can_access_tool) {
            return res.status(403).json({ message: 'Your account role does not have permission to access this tool.' });
        }

        // Create the JWT payload with your Neon metadata
        const payload = {
            user: {
                id: user.id,
                email: user.email,
                band_id: user.band_id,
                role: user.role,
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
        console.error('Login Error:', err);
        return res.status(500).json({ message: 'Internal server error.' });
    }
}

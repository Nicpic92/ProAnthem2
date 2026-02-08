const { query } = require('./_db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

export default async function handler(req, res) {
    // Only allow POST requests for logging in
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        // Look up the user by email
        const sql = 'SELECT * FROM users WHERE email = $1';
        const result = await query(sql, [email.toLowerCase().trim()]);

        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const user = result.rows[0];

        // Compare the provided password with the hashed password in the DB
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // Generate a JWT for the session
        // We include name, role, and band_id, and force status to 'active'
        const token = jwt.sign(
            { 
                user: { 
                    id: user.id,
                    email: user.email, 
                    role: user.role, 
                    name: user.first_name, 
                    band_id: user.band_id,
                    subscription_status: 'active' 
                } 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        return res.status(200).json({
            message: 'Login successful.',
            token: token
        });

    } catch (error) {
        console.error('Login Error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

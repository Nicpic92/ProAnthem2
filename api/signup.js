const { query } = require('./_db');
const bcrypt = require('bcryptjs');

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

    // Destructure using EXACT same names as the payload in signup.html
    const { email, password, first_name, last_name } = req.body;

    // Check for variables - if any are missing, returns the error from your screenshot
    if (!email || !password || !first_name || !last_name) {
        return res.status(400).json({ 
            message: 'Missing required fields: email, password, first_name, and last_name.' 
        });
    }

    try {
        const hashed = await bcrypt.hash(password, 10);
        
        // SQL using column names: password_hash and role_id
        // Using role_id 4 (User) as the default for new accounts
        const sql = `
            INSERT INTO users (email, password_hash, first_name, last_name, role_id)
            VALUES ($1, $2, $3, $4, 4)
            RETURNING id, email;
        `;
        
        const result = await query(sql, [email, hashed, first_name, last_name]);
        
        return res.status(201).json({
            message: 'Signup successful',
            user: result.rows[0]
        });
    } catch (err) {
        console.error('Signup Execution Error:', err);
        // Catch duplicate email error (23505)
        if (err.code === '23505') {
            return res.status(409).json({ message: 'Email already exists.' });
        }
        return res.status(500).json({ message: 'Database error during registration.' });
    }
}

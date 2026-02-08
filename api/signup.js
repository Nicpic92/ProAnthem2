const { query } = require('./_db');
const bcrypt = require('bcryptjs');

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

    const { email, password, first_name, last_name } = req.body;

    if (!email || !password || !first_name) {
        return res.status(400).json({ message: 'Missing required fields.' });
    }

    try {
        const hashed = await bcrypt.hash(password, 10);
        
        const sql = `
            INSERT INTO users (email, password, first_name, last_name, role)
            VALUES ($1, $2, $3, $4, 'User')
            RETURNING id, email;
        `;
        
        const result = await query(sql, [email, hashed, first_name, last_name]);
        res.status(201).json({ message: 'Success', user: result.rows[0] });
    } catch (err) {
        // Specifically handle the "Existing Username" error
        if (err.code === '23505') {
            return res.status(409).json({ 
                message: 'This email is already registered. Please log in instead.' 
            });
        }
        console.error('Signup Error:', err);
        res.status(500).json({ message: 'Database error. Check your Neon connection.' });
    }
}

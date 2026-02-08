const { query } = require('./_db');
const bcrypt = require('bcryptjs');

export default async function handler(req, res) {
    // Only allow POST requests for signup
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { email, password, first_name, last_name } = req.body;

    // Validation to prevent empty records in Neon
    if (!email || !password || !first_name) {
        return res.status(400).json({ 
            message: 'Missing required fields: email, password, and first_name.' 
        });
    }

    try {
        // Hash password for security
        const hashed = await bcrypt.hash(password, 10);
        
        // Insert into Neon 'users' table using your schema's 'role' column
        // Ensure the 'User' role exists in your 'roles' table first
        const sql = `
            INSERT INTO users (email, password, first_name, last_name, role)
            VALUES ($1, $2, $3, $4, 'User')
            RETURNING id, email;
        `;
        
        const result = await query(sql, [email, hashed, first_name, last_name]);
        
        return res.status(201).json({
            message: 'Account created successfully',
            user: result.rows[0]
        });
    } catch (err) {
        console.error('Signup DB Error:', err);
        // Handle unique constraint violation (user already exists)
        if (err.code === '23505') {
            return res.status(409).json({ message: 'User with this email already exists.' });
        }
        return res.status(500).json({ message: 'Database error during registration.' });
    }
}

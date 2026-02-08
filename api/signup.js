const { query } = require('./_db');
const bcrypt = require('bcryptjs');

export default async function handler(req, res) {
    // Only allow POST requests for signing up
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { email, password, firstName } = req.body;

    // Basic validation
    if (!email || !password || !firstName) {
        return res.status(400).json({ message: 'Missing required fields: email, password, and firstName.' });
    }

    try {
        // Hash the password before saving to the database
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert user into the database
        // We default the role to 'solo' and status to 'active' for the free version
        const sql = `
            INSERT INTO users (email, password_hash, first_name, role, subscription_status)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, email;
        `;
        
        const result = await query(sql, [
            email.toLowerCase().trim(),
            hashedPassword,
            firstName.trim(),
            'solo',
            'active'
        ]);

        return res.status(201).json({
            message: 'User created successfully.',
            user: {
                id: result.rows[0].id,
                email: result.rows[0].email
            }
        });

    } catch (error) {
        console.error('Signup Error:', error);
        
        // Handle unique constraint violation (user already exists)
        if (error.code === '23505') {
            return res.status(409).json({ message: 'A user with this email already exists.' });
        }
        
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

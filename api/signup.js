const { query } = require('./_db');
const bcrypt = require('bcryptjs');

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { email, password, first_name, last_name } = req.body;

    // Validate required fields to match your frontend signup.html
    if (!email || !password || !first_name) {
        return res.status(400).json({ 
            message: 'Missing required fields: email, password, and first_name.' 
        });
    }

    try {
        // Hash the password for your 'password_hash' column
        const hashed = await bcrypt.hash(password, 10);
        
        /**
         * Neon Schema Match:
         * We use 'role_id = 4' as a default for new members based on your user data.
         * We populate created_at and updated_at manually to ensure consistency.
         */
        const sql = `
            INSERT INTO users (
                email, 
                password_hash, 
                first_name, 
                last_name, 
                role_id, 
                created_at, 
                updated_at
            )
            VALUES ($1, $2, $3, $4, 4, NOW(), NOW())
            RETURNING email, role_id;
        `;
        
        const result = await query(sql, [email, hashed, first_name, last_name]);
        
        return res.status(201).json({
            message: 'Account created successfully',
            user: result.rows[0]
        });

    } catch (err) {
        // Log the error in Vercel Functions console for debugging
        console.error('Detailed Signup Error:', err);

        // Handle the "Unique Violation" for existing emails
        if (err.code === '23505') {
            return res.status(409).json({ 
                message: 'This email is already registered. Please log in.' 
            });
        }

        // Generic error for schema mismatches or connection drops
        return res.status(500).json({ 
            message: 'Database error during registration.',
            error: err.message // Temporary: remove in final production for security
        });
    }
}

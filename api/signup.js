/**
 * api/signup.js - FULL UNTRUNCATED CODE
 */
const { query } = require('./_db');
const bcrypt = require('bcryptjs');

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

    const { email, password, first_name, last_name } = req.body;

    // Check for missing fields (matches your error screenshot)
    if (!email || !password || !first_name) {
        return res.status(400).json({ message: 'Missing required fields: email, password, and first_name.' });
    }

    try {
        const hashed = await bcrypt.hash(password, 10);
        
        // IMPORTANT: This assumes 'User' exists in your 'roles' table.
        // If it fails, check your 'roles' table in Neon.
        const sql = `
            INSERT INTO users (email, password, first_name, last_name, role)
            VALUES ($1, $2, $3, $4, 'User')
            RETURNING id, email;
        `;
        
        const result = await query(sql, [email, hashed, first_name, last_name]);
        res.status(201).json({ message: 'Success', user: result.rows[0] });
    } catch (err) {
        console.error('Signup Error:', err);
        // Error 23505 is a unique constraint violation (email already exists)
        if (err.code === '23505') {
            return res.status(409).json({ message: 'Email already registered.' });
        }
        res.status(500).json({ message: 'Database error during registration.' });
    }
}

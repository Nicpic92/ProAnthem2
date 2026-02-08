/**
 * api/signup.js - FULL UNTRUNCATED CODE
 */
const { query } = require('./_db');
const bcrypt = require('bcryptjs');

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();

    const { email, password, first_name, last_name } = req.body;

    if (!email || !password || !first_name) {
        return res.status(400).json({ message: 'Missing fields' });
    }

    try {
        const hashed = await bcrypt.hash(password, 10);
        
        // Use your specific column 'password_hash' and a default 'role_id'
        const sql = `
            INSERT INTO users (email, password_hash, first_name, last_name, role_id, created_at, updated_at)
            VALUES ($1, $2, $3, $4, 4, NOW(), NOW())
            RETURNING email, band_id;
        `;
        
        const result = await query(sql, [email, hashed, first_name, last_name]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({ message: 'User already exists.' });
        }
        res.status(500).json({ message: 'Signup failed.' });
    }
}

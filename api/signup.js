const { query } = require('./_db');
const bcrypt = require('bcryptjs');

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

    // Variables must match the 'payload' keys in your HTML
    const { email, password, first_name, last_name } = req.body;

    if (!email || !password || !first_name || !last_name) {
        return res.status(400).json({ message: 'Missing required fields.' });
    }

    try {
        const hashed = await bcrypt.hash(password, 10);
        
        // Match the columns we just created in Neon
        const sql = `
            INSERT INTO users (email, password_hash, first_name, last_name, role_id)
            VALUES ($1, $2, $3, $4, 4)
            RETURNING email;
        `;
        
        await query(sql, [email, hashed, first_name, last_name]);
        return res.status(201).json({ message: 'Success' });
    } catch (err) {
        console.error('Signup DB Error:', err);
        return res.status(500).json({ message: 'Database error: ' + err.message });
    }
}

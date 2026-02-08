const { Client } = require('pg');
const bcrypt = require('bcryptjs');

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

    const { email, password, firstName } = req.body;
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const hashedPassword = await bcrypt.hash(password, 10);
        
        await client.query(
            'INSERT INTO users (email, password_hash, first_name, role, subscription_status) VALUES ($1, $2, $3, $4, $5)',
            [email.toLowerCase(), hashedPassword, firstName, 'solo', 'active']
        );

        return res.status(201).json({ message: 'Account created successfully.' });
    } catch (error) {
        return res.status(500).json({ message: 'Database error.' });
    } finally {
        await client.end();
    }
}

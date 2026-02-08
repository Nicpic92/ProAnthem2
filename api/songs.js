const { query } = require('./_db');
const jwt = require('jsonwebtoken');

export default async function handler(req, res) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'Missing token' });
    
    const token = authHeader.split(' ')[1];
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
        return res.status(401).json({ message: 'Invalid token' });
    }

    const userEmail = decoded.user.email;
    const bandId = decoded.user.band_id;

    try {
        if (req.method === 'GET') {
            // Fetch from lyric_sheets using user_email per Neon schema
            const { rows } = await query(
                'SELECT * FROM lyric_sheets WHERE user_email = $1 OR band_id = $2 ORDER BY updated_at DESC', 
                [userEmail, bandId]
            );
            return res.status(200).json(rows);
        }

        if (req.method === 'POST') {
            const { id, title, artist, song_blocks, tuning, capo, transpose, duration } = req.body;

            if (id) {
                // Update the master sheet
                await query(`
                    UPDATE lyric_sheets 
                    SET title = $1, artist = $2, song_blocks = $3, tuning = $4, capo = $5, transpose = $6, duration = $7, updated_at = NOW()
                    WHERE id = $8 AND (user_email = $9 OR band_id = $10)
                `, [title, artist, JSON.stringify(song_blocks), tuning, capo, transpose, duration, id, userEmail, bandId]);

                // Create a history record in lyric_sheet_versions
                await query(`
                    INSERT INTO lyric_sheet_versions 
                    (lyric_sheet_id, title, artist, song_blocks, tuning, capo, transpose, duration, updated_by_email)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                `, [id, title, artist, JSON.stringify(song_blocks), tuning, capo, transpose, duration, userEmail]);

                return res.status(200).json({ message: 'Update successful' });
            } else {
                // New record
                const { rows } = await query(`
                    INSERT INTO lyric_sheets (user_email, title, artist, song_blocks, band_id, tuning, capo, transpose, duration)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *
                `, [userEmail, title, artist, JSON.stringify(song_blocks), band_id, tuning, capo, transpose, duration]);
                
                return res.status(201).json(rows[0]);
            }
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to sync with Neon' });
    }
}

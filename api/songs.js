import { checkAccess, getUserPayload } from './auth.js';
import { apiRequest } from './api.js';

// Ensure access is checked before anything else
if (checkAccess()) {
    const user = getUserPayload();
    
    // Example Save Function
    const saveSong = async () => {
        const payload = {
            title: document.getElementById('song-title')?.innerText || 'Untitled',
            artist: 'Your Artist Name',
            song_blocks: { version: 1.0, content: [] }, // Your HTML tool data
            user_email: user.email,
            band_id: user.band_id || null
        };

        try {
            const response = await apiRequest('songs', payload, 'POST');
            console.log('Saved!', response);
            alert('Song Saved!');
        } catch (err) {
            alert('Save failed. Check if api/songs.js exists in Vercel.');
        }
    };
    
    // Wire up your buttons
    document.getElementById('save-btn')?.addEventListener('click', saveSong);
}

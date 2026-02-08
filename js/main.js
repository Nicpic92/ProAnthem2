/**
 * js/main.js - FULL UNTRUNCATED
 * Master Developer Version
 */
import { checkAccess, getUserPayload } from './auth.js';
import { apiRequest } from './api.js';

let currentSongs = [];
let activeSongId = null;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    if (checkAccess()) {
        await loadSongs();
        setupEventListeners();
    }
});

async function loadSongs() {
    try {
        currentSongs = await apiRequest('songs', null, 'GET');
        renderSongList();
    } catch (err) {
        console.error("Load failed:", err);
    }
}

function renderSongList() {
    const listContainer = document.getElementById('song-list');
    if (!listContainer) return;

    listContainer.innerHTML = currentSongs.map(song => `
        <div class="song-item p-3 mb-2 bg-gray-900 border border-gray-800 rounded-xl cursor-pointer hover:border-blue-500 transition-all" 
             onclick="window.selectSong(${song.id})">
            <h4 class="font-bold text-sm">${song.title}</h4>
            <p class="text-[10px] text-gray-500">${song.artist || 'Unknown Artist'}</p>
        </div>
    `).join('');
}

// THE POP-UP LOGIC
window.selectSong = (id) => {
    const song = currentSongs.find(s => s.id === id);
    if (!song) return;

    activeSongId = id;
    
    // Update UI Elements
    const titleDisplay = document.getElementById('song-title-display');
    const editorArea = document.getElementById('editor-content');

    if (titleDisplay) titleDisplay.innerText = song.title;
    
    // If using JSONB blocks, parse and display
    if (editorArea && song.song_blocks) {
        editorArea.value = typeof song.song_blocks === 'string' 
            ? song.song_blocks 
            : JSON.stringify(song.song_blocks, null, 2);
    }
    
    console.log("Song Loaded:", song.title);
};

function setupEventListeners() {
    const saveBtn = document.getElementById('save-changes-btn');
    if (saveBtn) {
        saveBtn.onclick = async () => {
            const user = getUserPayload();
            const payload = {
                id: activeSongId,
                title: document.getElementById('song-title-display').innerText,
                song_blocks: document.getElementById('editor-content').value,
                user_email: user.email
            };
            
            try {
                await apiRequest('songs', payload, 'POST');
                alert("Changes Saved to Neon!");
                await loadSongs();
            } catch (err) {
                alert("Save failed: " + err.message);
            }
        };
    }
}

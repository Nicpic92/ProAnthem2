/**
 * ProAnthem Main Orchestrator
 * Coordinates state management and module initialization.
 */

import { checkAccess, getUserPayload } from './auth.js';
import { apiRequest } from './api.js';
import * as ui from './modules/ui.js';

// Global State
const state = {
    isDemo: window.location.pathname.includes('demo'),
    activeSong: null,
    currentTool: 'chords',
    songs: []
};

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Guard Access
    if (!state.isDemo && !checkAccess()) return;

    // 2. Initialize UI Components
    setupEventListeners();
    
    // 3. Load Initial Data
    if (!state.isDemo) {
        await loadSongs();
    } else {
        setupDemoMode();
    }
});

/**
 * Loads songs from the database and populates the sidebar
 */
async function loadSongs() {
    try {
        const songs = await apiRequest('songs'); // Assumes api/songs.js exists
        state.songs = songs || [];
        ui.updateSidebarSongList(state.songs, state.activeSong?.id, selectSong);
    } catch (err) {
        ui.showNotification('Failed to load songs', 'error');
    }
}

/**
 * Handles song selection and tool initialization
 */
async function selectSong(songId) {
    const song = state.songs.find(s => s.id === songId);
    if (!song) return;

    state.activeSong = song;
    document.getElementById('active-song-title').textContent = song.title;
    document.getElementById('active-song-meta').textContent = song.artist || 'Unknown Artist';
    
    // Switch to current tool
    await switchTool(state.currentTool);
    ui.updateSidebarSongList(state.songs, songId, selectSong);
}

/**
 * Dynamic module loader for specific editors
 */
async function switchTool(toolName) {
    state.currentTool = toolName;
    const container = document.getElementById('block-editor-container');
    container.innerHTML = '<div class="flex items-center justify-center h-full"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>';

    // Update Tab UI
    document.querySelectorAll('.tool-tab').forEach(tab => {
        if (tab.dataset.tool === toolName) {
            tab.classList.add('active', 'bg-blue-600/20', 'text-blue-400', 'border-blue-500/50');
        } else {
            tab.classList.remove('active', 'bg-blue-600/20', 'text-blue-400', 'border-blue-500/50');
        }
    });

    try {
        switch (toolName) {
            case 'fretboard':
                const { initFretboard } = await import('./modules/fretboardController.js');
                initFretboard(container, state.activeSong);
                break;
            case 'drums':
                const { initDrumEditor } = await import('./modules/drumEditor.js');
                initDrumEditor(container, state.activeSong);
                break;
            default: // 'chords'
                const { initSongEditor } = await import('./modules/songEditor.js');
                initSongEditor(container, state.activeSong);
                break;
        }
    } catch (err) {
        console.error('Module load failed:', err);
        container.innerHTML = `<p class="p-8 text-red-500">Failed to load ${toolName} editor.</p>`;
    }
}

function setupEventListeners() {
    // Tool Tab Switching
    document.querySelectorAll('.tool-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            if (state.activeSong || state.isDemo) {
                switchTool(tab.dataset.tool);
            } else {
                ui.showNotification('Select a song first', 'error');
            }
        });
    });

    // New Song Creation
    document.getElementById('new-song-btn')?.addEventListener('click', async () => {
        const title = prompt('Enter song title:');
        if (!title) return;
        
        try {
            const newSong = await apiRequest('songs', { title }, 'POST');
            await loadSongs();
            selectSong(newSong.id);
        } catch (err) {
            ui.showNotification('Error creating song', 'error');
        }
    });
}

function setupDemoMode() {
    state.songs = [{ id: 'demo-1', title: 'Example Song', artist: 'ProAnthem Demo' }];
    ui.updateSidebarSongList(state.songs, null, selectSong);
    selectSong('demo-1');
}

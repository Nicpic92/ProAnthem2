/**
 * ProAnthem Setlist Manager
 * Handles the creation and sequencing of show sets.
 */

import { apiRequest } from '../api.js';
import { showNotification } from './ui.js';

export function initSetlistManager(container, currentSetlist = null) {
    const setlist = currentSetlist || { title: "New Setlist", songs: [], date: new Date().toISOString().split('T')[0] };

    container.innerHTML = `
        <div class="setlist-builder flex flex-col lg:flex-row gap-8 h-full">
            <div class="flex-1 bg-gray-950 rounded-xl border border-gray-800 p-6 flex flex-col">
                <div class="flex justify-between items-center mb-6">
                    <div>
                        <input type="text" id="setlist-name" value="${setlist.title}" 
                            class="bg-transparent text-2xl font-bold text-white border-b border-transparent focus:border-blue-500 focus:outline-none w-full">
                        <p class="text-xs text-gray-500 mt-1">Total Time: <span id="total-set-time">0:00</span></p>
                    </div>
                    <button id="save-setlist-btn" class="btn btn-primary text-sm px-4 py-2">Save Setlist</button>
                </div>

                <ul id="active-setlist-items" class="space-y-2 flex-grow overflow-y-auto custom-scrollbar min-h-[300px] border-2 border-dashed border-gray-800 rounded-lg p-2">
                    </ul>
            </div>

            <div class="w-full lg:w-80 bg-gray-900 rounded-xl border border-gray-800 p-6 flex flex-col">
                <h4 class="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Song Library</h4>
                <div class="relative mb-4">
                    <input type="text" id="library-search" placeholder="Search songs..." 
                        class="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-sm focus:outline-none focus:border-blue-500">
                </div>
                <ul id="library-source-list" class="space-y-1 overflow-y-auto custom-scrollbar flex-grow">
                    </ul>
            </div>
        </div>
    `;

    loadLibrarySongs();
    renderSetlistSongs(setlist);
    setupSetlistListeners(setlist);
}

async function loadLibrarySongs() {
    try {
        const songs = await apiRequest('songs');
        const list = document.getElementById('library-source-list');
        list.innerHTML = songs.map(song => `
            <li class="p-3 bg-gray-800 rounded border border-gray-700 hover:border-blue-500 cursor-pointer transition-all group flex justify-between items-center" 
                data-id="${song.id}" data-title="${song.title}" data-duration="${song.duration || 240}">
                <span class="text-sm font-medium">${song.title}</span>
                <button class="add-to-set opacity-0 group-hover:opacity-100 text-blue-400 text-lg font-bold">+</button>
            </li>
        `).join('');
    } catch (err) {
        console.error("Library load failed", err);
    }
}

function renderSetlistSongs(setlist) {
    const list = document.getElementById('active-setlist-items');
    if (setlist.songs.length === 0) {
        list.innerHTML = '<li class="h-full flex items-center justify-center text-gray-700 italic">Drag songs here or click + to build your set</li>';
        return;
    }

    list.innerHTML = setlist.songs.map((song, index) => `
        <li class="flex items-center gap-4 bg-gray-800 p-4 rounded-lg border border-gray-700 cursor-move" data-index="${index}">
            <span class="text-gray-600 font-mono text-xs">${index + 1}</span>
            <div class="flex-grow">
                <p class="text-sm font-bold text-white">${song.title}</p>
                <p class="text-[10px] text-gray-500">${Math.floor(song.duration / 60)}:${(song.duration % 60).toString().padStart(2, '0')}</p>
            </div>
            <button class="remove-from-set text-gray-600 hover:text-red-500 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        </li>
    `).join('');

    updateTotalTime(setlist);
}

function updateTotalTime(setlist) {
    const totalSeconds = setlist.songs.reduce((acc, song) => acc + (parseInt(song.duration) || 0), 0);
    const mins = Math.floor(totalSeconds / 60);
    const secs = (totalSeconds % 60).toString().padStart(2, '0');
    document.getElementById('total-set-time').textContent = `${mins}:${secs}`;
}

function setupSetlistListeners(setlist) {
    // Add song to set
    document.getElementById('library-source-list').addEventListener('click', (e) => {
        const item = e.target.closest('li');
        if (!item) return;

        setlist.songs.push({
            id: item.dataset.id,
            title: item.dataset.title,
            duration: parseInt(item.dataset.duration)
        });
        renderSetlistSongs(setlist);
    });

    // Save setlist
    document.getElementById('save-setlist-btn').onclick = async () => {
        setlist.title = document.getElementById('setlist-name').value;
        try {
            await apiRequest('setlists', setlist, 'POST');
            showNotification('Setlist saved successfully!');
        } catch (err) {
            showNotification('Error saving setlist', 'error');
        }
    };
}

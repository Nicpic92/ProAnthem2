/**
 * ProAnthem Band Profile Controller
 * Manages band identity, roster, and social metadata.
 */

import { apiRequest } from '../api.js';
import { showNotification } from './ui.js';

export async function initBandProfile() {
    try {
        const bandData = await apiRequest('band/details'); // Assumes endpoint for band metadata
        const members = await apiRequest('band/members');   // Fetches users with same band_id
        
        renderBandInfo(bandData);
        renderRoster(members);
        setupProfileListeners(bandData.id);
    } catch (err) {
        showNotification('Failed to load band profile', 'error');
    }
}

function renderBandInfo(data) {
    if (!data) return;
    document.getElementById('display-band-name').textContent = data.name || 'Unnamed Band';
    // Fill form fields
    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        const key = input.getAttribute('data-key');
        if (key && data[key]) input.value = data[key];
    });
}

function renderRoster(members) {
    const list = document.getElementById('member-list');
    list.innerHTML = members.map(m => `
        <div class="py-4 flex items-center justify-between border-b border-gray-800 last:border-0">
            <div class="flex items-center gap-4">
                <div class="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center font-bold text-sm text-blue-400">
                    ${m.first_name?.[0] || '?'}${m.last_name?.[0] || ''}
                </div>
                <div>
                    <p class="text-sm font-bold text-white">${m.first_name} ${m.last_name}</p>
                    <p class="text-[10px] text-gray-500 uppercase tracking-widest">${m.role || 'Member'}</p>
                </div>
            </div>
            <div class="flex items-center gap-2">
                ${m.is_owner ? '<span class="text-[9px] bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">OWNER</span>' : ''}
                <button class="text-gray-500 hover:text-white text-xs">Manage</button>
            </div>
        </div>
    `).join('');
}

function setupProfileListeners(bandId) {
    document.getElementById('save-profile-btn').onclick = async () => {
        const updatedData = {};
        document.querySelectorAll('[data-key]').forEach(el => {
            updatedData[el.getAttribute('data-key')] = el.value;
        });

        try {
            await apiRequest(`band/${bandId}`, updatedData, 'PUT');
            showNotification('Profile updated successfully!');
        } catch (err) {
            showNotification('Error saving profile', 'error');
        }
    };

    // Simulated Logo Upload
    document.getElementById('band-logo-placeholder').onclick = () => {
        const url = prompt("Enter Image URL for Band Logo:");
        if (url) {
            document.getElementById('band-logo-placeholder').innerHTML = `<img src="${url}" class="w-full h-full rounded-full object-cover">`;
        }
    };
}

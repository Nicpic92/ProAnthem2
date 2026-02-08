/**
 * ProAnthem Admin Controller
 * Manages global user oversight and system statistics.
 */

import { apiRequest } from './api.js';
import { checkAccess, getUserPayload } from './auth.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Security Check
    const user = getUserPayload();
    if (!checkAccess() || user.role !== 'admin') {
        console.warn("Unauthorized access attempt to Admin Console.");
        window.location.href = '/dashboard';
        return;
    }

    // 2. Initial Data Load
    await refreshAdminDashboard();

    // 3. Setup Search
    document.getElementById('admin-search').addEventListener('input', (e) => {
        filterUserTable(e.target.value);
    });
});

async function refreshAdminDashboard() {
    try {
        // Fetch all users via the admin API
        const users = await apiRequest('admin-tasks/users');
        
        // Update Stats
        document.getElementById('stat-users').textContent = users.length;
        const activeBands = new Set(users.map(u => u.band_id).filter(id => id)).size;
        document.getElementById('stat-bands').textContent = activeBands;

        // Render Table
        renderUserTable(users);
    } catch (err) {
        console.error("Admin Refresh Failed:", err);
        const table = document.getElementById('admin-user-table');
        table.innerHTML = `<tr><td colspan="5" class="p-10 text-center text-red-500">Error loading administrative data. Check Vercel logs.</td></tr>`;
    }
}

function renderUserTable(users) {
    const table = document.getElementById('admin-user-table');
    table.innerHTML = users.map(user => `
        <tr class="hover:bg-gray-800/40 transition-colors">
            <td class="p-4">
                <div class="flex flex-col">
                    <span class="font-bold text-white">${user.email}</span>
                    <span class="text-[10px] text-gray-500">UID: ${user.id || 'N/A'}</span>
                </div>
            </td>
            <td class="p-4">
                <span class="px-2 py-1 rounded text-[10px] font-bold uppercase ${user.role === 'admin' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}">
                    ${user.role}
                </span>
            </td>
            <td class="p-4">
                <span class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-green-500"></span>
                    <span class="text-xs text-gray-300">Active</span>
                </span>
            </td>
            <td class="p-4 text-xs text-gray-400">
                ${user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Historical'}
            </td>
            <td class="p-4 text-right">
                <button class="text-xs text-gray-500 hover:text-white mr-3">Edit</button>
                <button class="text-xs text-red-900 hover:text-red-500 font-bold">Delete</button>
            </td>
        </tr>
    `).join('');
}

function filterUserTable(searchTerm) {
    const rows = document.querySelectorAll('#admin-user-table tr');
    const term = searchTerm.toLowerCase();

    rows.forEach(row => {
        const email = row.querySelector('.font-bold').textContent.toLowerCase();
        row.style.display = email.includes(term) ? '' : 'none';
    });
}

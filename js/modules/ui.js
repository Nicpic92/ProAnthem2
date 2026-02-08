/**
 * ProAnthem UI Helper Module
 * Standardized components for notifications, modals, and lists.
 */

/**
 * Displays a non-blocking notification toast
 * @param {string} message - Text to display
 * @param {string} type - 'success', 'error', or 'info'
 */
export function showNotification(message, type = 'success') {
    // Check if container exists, if not, create it
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        container.className = 'fixed bottom-6 right-6 z-[100] flex flex-col gap-3';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    const colors = {
        success: 'bg-green-600 border-green-400',
        error: 'bg-red-600 border-red-400',
        info: 'bg-blue-600 border-blue-400'
    };

    toast.className = `${colors[type]} text-white px-6 py-3 rounded-xl shadow-2xl border-l-4 animate-in slide-in-from-right duration-300 flex items-center gap-3`;
    toast.innerHTML = `
        <span class="text-sm font-bold">${message}</span>
        <button class="ml-4 opacity-50 hover:opacity-100">&times;</button>
    `;

    container.appendChild(toast);

    // Auto-remove after 3.5 seconds
    setTimeout(() => {
        toast.classList.replace('slide-in-from-right', 'slide-out-to-right');
        setTimeout(() => toast.remove(), 500);
    }, 3500);

    toast.querySelector('button').onclick = () => toast.remove();
}

/**
 * Populates the sidebar with the user's song library
 * @param {Array} songs - List of song objects
 * @param {string} activeId - The ID of the currently selected song
 * @param {function} onSelect - Callback when a song is clicked
 */
export function updateSidebarSongList(songs, activeId, onSelect) {
    const list = document.getElementById('song-list-items');
    if (!list) return;

    if (songs.length === 0) {
        list.innerHTML = '<li class="p-6 text-center text-xs text-gray-600 italic">No songs found.</li>';
        return;
    }

    list.innerHTML = songs.map(song => {
        const isActive = song.id === activeId;
        return `
            <li class="song-item group px-4 py-3 cursor-pointer transition-all border-l-2 ${isActive ? 'bg-blue-600/10 border-blue-500' : 'border-transparent hover:bg-gray-800'}" 
                data-id="${song.id}">
                <div class="flex flex-col">
                    <span class="text-sm font-semibold ${isActive ? 'text-blue-400' : 'text-gray-300'} group-hover:text-white">${song.title}</span>
                    <span class="text-[10px] text-gray-500 uppercase tracking-tighter">${song.artist || 'No Artist'}</span>
                </div>
            </li>
        `;
    }).join('');

    // Attach listeners
    list.querySelectorAll('.song-item').forEach(item => {
        item.onclick = () => onSelect(item.dataset.id);
    });
}

/**
 * Standard Modal Trigger
 * @param {string} title - Modal heading
 * @param {string} htmlBody - HTML content for the body
 */
export function openModal(title, htmlBody) {
    const modal = document.getElementById('management-modal');
    const titleEl = document.getElementById('modal-title');
    const bodyEl = document.getElementById('modal-body');

    if (!modal) return;

    titleEl.textContent = title;
    bodyEl.innerHTML = htmlBody;
    modal.classList.remove('hidden');
}

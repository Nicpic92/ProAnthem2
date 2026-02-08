export function updateSidebarSongList(songs, currentSongId, onSelect) {
    const list = document.getElementById('song-list-items');
    if (!list) return;
    list.innerHTML = '';

    songs.forEach(song => {
        const li = document.createElement('li');
        li.className = `p-3 cursor-pointer border-b border-gray-800 hover:bg-gray-700 transition ${song.id === currentSongId ? 'bg-blue-900 border-blue-500' : ''}`;
        li.innerHTML = `
            <div class="font-bold">${song.title || 'Untitled'}</div>
            <div class="text-xs text-gray-400">${song.artist || 'Unknown Artist'}</div>
        `;
        li.onclick = () => onSelect(song.id);
        list.appendChild(li);
    });
}

export function showNotification(message, type = 'success') {
    const banner = document.createElement('div');
    banner.className = `fixed top-4 right-4 p-4 rounded shadow-lg z-50 text-white ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`;
    banner.textContent = message;
    document.body.appendChild(banner);
    setTimeout(() => banner.remove(), 3000);
}

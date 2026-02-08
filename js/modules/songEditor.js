/**
 * ProAnthem Song & Lyric Editor
 * Handles text-based chord charting and real-time rendering.
 */

import { showNotification } from './ui.js';

export function initSongEditor(container, songData) {
    const content = songData?.content || "Title: ${songData?.title || 'New Song'}\nArtist: ${songData?.artist || ''}\n\n[G] Welcome to the [C] Editor\nStart typing your [D] lyrics here...";

    container.innerHTML = `
        <div class="song-editor-wrapper h-full flex flex-col lg:flex-row gap-6 p-4">
            <div class="flex-1 flex flex-col bg-gray-950 rounded-xl border border-gray-800 overflow-hidden">
                <div class="p-3 bg-gray-900 border-b border-gray-800 flex justify-between items-center">
                    <span class="text-xs font-bold text-gray-500 uppercase tracking-widest">Editor (Markdown + Chords)</span>
                    <button id="insert-chord-btn" class="text-xs text-blue-400 hover:text-blue-300">[Add Chord]</button>
                </div>
                <textarea id="song-input" class="flex-grow bg-transparent p-6 text-gray-300 font-mono text-sm resize-none focus:outline-none custom-scrollbar" spellcheck="false">${content}</textarea>
            </div>

            <div class="flex-1 flex flex-col bg-white rounded-xl border border-gray-300 overflow-hidden shadow-2xl">
                <div class="p-3 bg-gray-100 border-b border-gray-300 flex justify-between items-center">
                    <span class="text-xs font-bold text-gray-500 uppercase tracking-widest">Preview (Chart View)</span>
                    <span class="text-[10px] text-gray-400">PDF Ready</span>
                </div>
                <div id="song-preview" class="flex-grow p-10 overflow-y-auto bg-white text-black font-serif leading-relaxed custom-scrollbar">
                    </div>
            </div>
        </div>
    `;

    const input = document.getElementById('song-input');
    const preview = document.getElementById('song-preview');

    // Real-time rendering
    input.addEventListener('input', () => {
        renderChart(input.value, preview);
        songData.content = input.value; // Sync with state
    });

    // Initial Render
    renderChart(content, preview);

    // Toolbar helper
    document.getElementById('insert-chord-btn').onclick = () => {
        const start = input.selectionStart;
        const end = input.selectionEnd;
        const text = input.value;
        input.value = text.substring(0, start) + "[ ]" + text.substring(end);
        input.focus();
        input.setSelectionRange(start + 1, start + 2);
        renderChart(input.value, preview);
    };
}

/**
 * Parses bracketed chords and converts them to formatted HTML
 */
function renderChart(text, target) {
    if (!text) {
        target.innerHTML = '<p class="text-gray-300 italic">No content to display.</p>';
        return;
    }

    // Process lines
    const lines = text.split('\n');
    const html = lines.map(line => {
        if (!line.trim()) return '<div class="h-4"></div>';
        
        // Match chords in brackets
        const processedLine = line.replace(/\[(.*?)\]/g, '<span class="inline-block relative h-6 mr-1"><b class="absolute bottom-4 left-0 text-blue-600 font-bold text-sm leading-none">$1</b></span>');
        
        return `<div class="mb-1">${processedLine}</div>`;
    }).join('');

    target.innerHTML = `<div class="prose max-w-none">${html}</div>`;
}

/**
 * ProAnthem Fretboard Controller
 * Handles rendering and user interaction for the guitar fretboard.
 */

import { showNotification } from './ui.js';

export function initFretboard(container, songData) {
    const fretboardData = songData?.fretboard_data || { notes: [], tuning: ['E', 'A', 'D', 'G', 'B', 'E'] };
    
    container.innerHTML = `
        <div class="fretboard-wrapper p-4 bg-gray-900 rounded-xl border border-gray-800 shadow-2xl">
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-xl font-bold text-blue-400">Interactive Fretboard</h3>
                <div class="flex gap-2">
                    <button id="clear-fretboard" class="text-xs bg-gray-800 hover:bg-red-900/40 text-gray-400 p-2 rounded border border-gray-700">Clear All</button>
                    <select id="fretboard-tuning" class="text-xs bg-gray-800 text-gray-300 p-2 rounded border border-gray-700">
                        <option>Standard E</option>
                        <option>Drop D</option>
                        <option>Half Step Down</option>
                    </select>
                </div>
            </div>
            
            <div class="fretboard-container relative overflow-x-auto pb-4 custom-scrollbar">
                <div id="fretboard-grid" class="inline-flex min-w-full bg-orange-900/10 rounded border-y border-orange-900/30">
                    </div>
            </div>

            <div class="mt-6 p-4 bg-gray-950 rounded border border-gray-800">
                <p class="text-xs text-gray-500 uppercase tracking-widest mb-2">Editor Instructions</p>
                <p class="text-sm text-gray-400">Click on a string/fret intersection to place a note. Click again to remove it. Notes will play a preview tone automatically.</p>
            </div>
        </div>
    `;

    renderFrets(fretboardData);
    setupFretboardListeners(fretboardData);
}

function renderFrets(data) {
    const grid = document.getElementById('fretboard-grid');
    const numFrets = 24;
    const strings = data.tuning.reverse(); // Standard high-to-low visual

    grid.innerHTML = '';

    for (let f = 0; f <= numFrets; f++) {
        const fretElement = document.createElement('div');
        fretElement.className = `fret flex flex-col items-center justify-between py-2 ${f === 0 ? 'bg-gray-800 w-12' : 'w-16 border-r border-gray-700'}`;
        
        // Add fret markers (dots)
        if ([3, 5, 7, 9, 12, 15, 17, 19, 21].includes(f)) {
            const dot = document.createElement('div');
            dot.className = "absolute bottom-[-15px] w-2 h-2 bg-gray-600 rounded-full";
            if (f === 12) {
               fretElement.innerHTML += `<div class="absolute bottom-[-15px] flex gap-1"><div class="w-2 h-2 bg-gray-600 rounded-full"></div><div class="w-2 h-2 bg-gray-600 rounded-full"></div></div>`;
            } else {
               fretElement.appendChild(dot);
            }
        }

        // Create String positions within the fret
        strings.forEach((noteName, sIndex) => {
            const stringPos = document.createElement('div');
            stringPos.className = "string-point w-full h-6 flex items-center justify-center relative cursor-pointer group";
            stringPos.dataset.fret = f;
            stringPos.dataset.string = sIndex;

            // Visual String Line
            const line = document.createElement('div');
            line.className = `absolute w-full h-[1px] bg-gray-500 z-0 group-hover:bg-blue-400 transition-colors`;
            stringPos.appendChild(line);

            // Check if note exists
            const hasNote = data.notes.find(n => n.f === f && n.s === sIndex);
            if (hasNote) {
                const noteMarker = createNoteMarker();
                stringPos.appendChild(noteMarker);
            }

            fretElement.appendChild(stringPos);
        });

        grid.appendChild(fretElement);
    }
}

function createNoteMarker() {
    const marker = document.createElement('div');
    marker.className = "w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-lg z-10 animate-in fade-in zoom-in duration-200";
    return marker;
}

function setupFretboardListeners(data) {
    document.getElementById('fretboard-grid').addEventListener('click', (e) => {
        const point = e.target.closest('.string-point');
        if (!point) return;

        const fret = parseInt(point.dataset.fret);
        const string = parseInt(point.dataset.string);
        
        const noteIndex = data.notes.findIndex(n => n.f === fret && n.s === string);

        if (noteIndex > -1) {
            data.notes.splice(noteIndex, 1);
            point.querySelector('.w-4')?.remove();
        } else {
            data.notes.push({ f: fret, s: string });
            point.appendChild(createNoteMarker());
            // playNotePreview(fret, string); // Future integration with audioManager
        }
    });

    document.getElementById('clear-fretboard').onclick = () => {
        data.notes = [];
        renderFrets(data);
        showNotification('Fretboard cleared', 'info');
    };
}

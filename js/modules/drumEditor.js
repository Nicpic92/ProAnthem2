/**
 * ProAnthem Drum Tab Editor
 * A step-sequencer style interface for percussion mapping.
 */

import { showNotification } from './ui.js';

export function initDrumEditor(container, songData) {
    const drumData = songData?.drum_data || { 
        steps: 16, 
        patterns: {
            'Kick': [],
            'Snare': [],
            'Hi-Hat (Closed)': [],
            'Hi-Hat (Open)': [],
            'Crash': [],
            'Tom 1': []
        } 
    };

    container.innerHTML = `
        <div class="drum-editor-wrapper p-6 bg-gray-900 rounded-xl border border-gray-800 shadow-2xl">
            <div class="flex justify-between items-center mb-8">
                <div>
                    <h3 class="text-xl font-bold text-red-500">Drum Pattern Builder</h3>
                    <p class="text-xs text-gray-500 mt-1 uppercase tracking-widest">16-Step Sequencer</p>
                </div>
                <div class="flex gap-3">
                    <button id="play-drums" class="btn bg-green-600/20 text-green-500 border border-green-500/50 hover:bg-green-600/40 px-4 py-2 text-sm">
                        Play Pattern
                    </button>
                    <button id="clear-drums" class="text-xs bg-gray-800 hover:bg-red-900/40 text-gray-400 p-2 rounded border border-gray-700">
                        Clear Grid
                    </button>
                </div>
            </div>

            <div class="drum-grid-container overflow-x-auto pb-4 custom-scrollbar">
                <table class="w-full border-collapse">
                    <thead>
                        <tr>
                            <th class="p-2 text-left text-xs text-gray-600 uppercase border-b border-gray-800 w-32">Instrument</th>
                            ${Array.from({length: drumData.steps}).map((_, i) => `
                                <th class="p-2 text-center text-xs border-b border-gray-800 ${i % 4 === 0 ? 'bg-gray-800/50 text-blue-400' : 'text-gray-600'}">
                                    ${i + 1}
                                </th>
                            `).join('')}
                        </tr>
                    </thead>
                    <tbody id="drum-grid-body">
                        </tbody>
                </table>
            </div>

            <div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="p-4 bg-gray-950 rounded border border-gray-800">
                    <label class="block text-xs text-gray-500 uppercase mb-2">Pattern Density</label>
                    <div class="flex items-center gap-4">
                        <input type="range" min="8" max="32" step="8" value="${drumData.steps}" class="flex-grow accent-red-500">
                        <span class="text-sm font-mono">${drumData.steps} Steps</span>
                    </div>
                </div>
                <div class="p-4 bg-gray-950 rounded border border-gray-800 flex items-center">
                    <p class="text-xs text-gray-400 italic">Pro-Tip: Use the spacebar to preview the pattern in real-time once the audio engine is active.</p>
                </div>
            </div>
        </div>
    `;

    renderDrumGrid(drumData);
    setupDrumListeners(drumData);
}

function renderDrumGrid(data) {
    const body = document.getElementById('drum-grid-body');
    body.innerHTML = '';

    Object.keys(data.patterns).forEach(instr => {
        const row = document.createElement('tr');
        row.className = "border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors";
        
        row.innerHTML = `
            <td class="p-3 text-sm font-bold text-gray-300 border-r border-gray-800">${instr}</td>
            ${Array.from({length: data.steps}).map((_, step) => {
                const isActive = data.patterns[instr].includes(step);
                return `
                    <td class="p-1 border-r border-gray-800/30">
                        <div 
                            data-instr="${instr}" 
                            data-step="${step}" 
                            class="drum-cell h-10 w-full rounded-md cursor-pointer transition-all ${isActive ? 'bg-red-600 shadow-[0_0_10px_rgba(239,68,68,0.4)]' : 'bg-gray-800 hover:bg-gray-700'}">
                        </div>
                    </td>
                `;
            }).join('')}
        `;
        body.appendChild(row);
    });
}

function setupDrumListeners(data) {
    document.getElementById('drum-grid-body').addEventListener('click', (e) => {
        const cell = e.target.closest('.drum-cell');
        if (!cell) return;

        const instr = cell.dataset.instr;
        const step = parseInt(cell.dataset.step);
        
        const stepIndex = data.patterns[instr].indexOf(step);

        if (stepIndex > -1) {
            // Remove hit
            data.patterns[instr].splice(stepIndex, 1);
            cell.classList.remove('bg-red-600', 'shadow-[0_0_10px_rgba(239,68,68,0.4)]');
            cell.classList.add('bg-gray-800');
        } else {
            // Add hit
            data.patterns[instr].push(step);
            cell.classList.remove('bg-gray-800');
            cell.classList.add('bg-red-600', 'shadow-[0_0_10px_rgba(239,68,68,0.4)]');
            // playDrumPreview(instr); // Integration point for audioManager
        }
    });

    document.getElementById('clear-drums').onclick = () => {
        Object.keys(data.patterns).forEach(key => data.patterns[key] = []);
        renderDrumGrid(data);
        showNotification('Drum grid cleared', 'info');
    };
}

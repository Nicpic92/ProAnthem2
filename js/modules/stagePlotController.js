/**
 * ProAnthem Stage Plot Controller
 * Manages draggable stage assets and input list generation.
 */

import { apiRequest } from '../api.js';

const state = {
    items: [],
    counter: 0
};

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('stage-canvas');
    const assetItems = document.querySelectorAll('.asset-item');

    // 1. Setup Draggable Library
    assetItems.forEach(item => {
        item.ondragstart = (e) => {
            e.dataTransfer.setData('type', item.dataset.type);
            e.dataTransfer.setData('icon', item.querySelector('span').innerText);
        };
    });

    // 2. Canvas Drop Logic
    canvas.ondragover = (e) => e.preventDefault();

    canvas.ondrop = (e) => {
        e.preventDefault();
        const type = e.dataTransfer.getData('type');
        const icon = e.dataTransfer.getData('icon');
        
        const rect = canvas.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        addItemToStage(type, icon, x, y);
    };

    // 3. Save Functionality
    document.getElementById('save-plot-btn').onclick = async () => {
        try {
            await apiRequest('stage-plots', { layout: state.items }, 'POST');
            alert('Stage plot saved successfully!');
        } catch (err) {
            console.error('Save failed', err);
        }
    };

    document.getElementById('clear-stage-btn').onclick = () => {
        state.items = [];
        canvas.querySelectorAll('.stage-item').forEach(el => el.remove());
        updateInputList();
    };
});

function addItemToStage(type, icon, x, y, id = null) {
    const canvas = document.getElementById('stage-canvas');
    const itemId = id || `item-${Date.now()}`;
    
    const el = document.createElement('div');
    el.id = itemId;
    el.className = 'stage-item absolute p-2 bg-gray-800 rounded-lg border border-blue-500 shadow-lg flex flex-col items-center z-10';
    el.style.left = `${x}%`;
    el.style.top = `${y}%`;
    el.style.transform = 'translate(-50%, -50%)';
    
    el.innerHTML = `
        <span class="text-2xl">${icon}</span>
        <input type="text" class="bg-transparent text-[8px] text-center w-16 border-none focus:outline-none" value="${type}">
        <button class="absolute -top-2 -right-2 bg-red-500 rounded-full w-4 h-4 text-[10px] flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">×</button>
    `;

    // Make item draggable after placement
    el.draggable = true;
    el.ondragstart = (e) => {
        e.dataTransfer.setData('existing-id', itemId);
    };

    // Remove item
    el.querySelector('button').onclick = () => {
        el.remove();
        state.items = state.items.filter(i => i.id !== itemId);
        updateInputList();
    };

    canvas.appendChild(el);
    
    if (!id) {
        state.items.push({ id: itemId, type, icon, x, y });
        updateInputList();
    }
}

function updateInputList() {
    const listContainer = document.getElementById('input-list');
    if (state.items.length === 0) {
        listContainer.innerHTML = '<p class="text-xs text-gray-600 italic">Add items to generate list.</p>';
        return;
    }

    listContainer.innerHTML = state.items
        .map((item, index) => `
            <div class="flex items-center gap-3 p-2 bg-gray-800/50 rounded border border-gray-700">
                <span class="text-blue-500 font-mono text-xs">${index + 1}</span>
                <span class="text-xs font-bold uppercase">${item.type}</span>
                <input type="text" placeholder="Note (e.g. XLR)" class="flex-grow bg-transparent text-[10px] border-b border-gray-700">
            </div>
        `).join('');
}

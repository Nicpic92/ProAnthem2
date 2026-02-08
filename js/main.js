import { checkAccess } from './auth.js';
import * as songEditor from './modules/songEditor.js';
import * as setlistManager from './modules/setlistManager.js';

document.addEventListener('DOMContentLoaded', () => {
    const isDemo = window.location.pathname.includes('demo');
    
    if (!isDemo && !checkAccess()) return;

    // Initialize tools
    if (document.getElementById('block-editor-container')) {
        songEditor.init(isDemo);
    }
    
    if (document.getElementById('setlist-container')) {
        setlistManager.init(isDemo);
    }
});

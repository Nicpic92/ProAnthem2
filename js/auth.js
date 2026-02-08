/**
 * js/auth.js
 * Master Authentication & Access Control
 */

import { apiRequest } from './api.js';

export function saveToken(token) {
    localStorage.setItem('pa_token', token);
}

export function getToken() {
    return localStorage.getItem('pa_token');
}

export function logout() {
    localStorage.removeItem('pa_token');
    window.location.href = '/index.html';
}

/**
 * Resolves the SyntaxError in main.js
 */
export function checkAccess() {
    const user = getUserPayload();
    if (!user) {
        window.location.href = '/index.html';
        return false;
    }
    return true;
}

export function getUserPayload() {
    const token = getToken();
    if (!token) return null;
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(window.atob(base64)).user;
    } catch (e) {
        return null;
    }
}

export async function handleLogin(email, password) {
    try {
        const data = await apiRequest('login', { email, password }, 'POST');
        if (data.token) {
            saveToken(data.token);
            window.location.href = '/dashboard.html';
        }
    } catch (err) {
        alert(err.message || 'Login failed.');
        throw err;
    }
}

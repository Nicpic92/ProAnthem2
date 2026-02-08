/**
 * js/auth.js
 * Master Authentication Controller for Neon Integration
 */

import { apiRequest } from './api.js';

export function saveToken(token) {
    localStorage.setItem('pa_token', token);
}

export function getToken() {
    return localStorage.getItem('pa_token');
}

/**
 * The specific function your index.html is calling
 */
export async function handleLogin(email, password) {
    try {
        const data = await apiRequest('login', { email, password }, 'POST');
        if (data.token) {
            saveToken(data.token);
            window.location.href = '/dashboard.html';
        } else {
            throw new Error(data.message || 'Login failed');
        }
    } catch (err) {
        console.error('Auth Error:', err);
        alert(err.message || 'Connection to Neon failed.');
    }
}

export function getUserPayload() {
    const token = getToken();
    if (!token) return null;
    try {
        const base64Url = token.split('.')[1];
        return JSON.parse(window.atob(base64Url)).user;
    } catch (e) {
        return null;
    }
}

export function logout() {
    localStorage.removeItem('pa_token');
    window.location.href = '/index.html';
}

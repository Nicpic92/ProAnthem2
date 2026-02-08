/**
 * js/auth.js - FULL UNTRUNCATED CODE
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
        console.error('Login logic failed:', err);
        alert(err.message || 'Login failed. Please check credentials.');
        throw err;
    }
}

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
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload).user;
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
        } else {
            throw new Error(data.message || 'Login failed');
        }
    } catch (err) {
        alert(err.message || 'Login error. Check Neon connection.');
        throw err;
    }
}

/**
 * js/auth.js
 * Master Authentication & Access Control
 */
import { apiRequest } from './api.js';

// 1. SAVE TOKEN
export function saveToken(token) {
    localStorage.setItem('pa_token', token);
}

// 2. GET TOKEN
export function getToken() {
    return localStorage.getItem('pa_token');
}

// 3. LOGOUT
export function logout() {
    localStorage.removeItem('pa_token');
    window.location.href = '/index.html';
}

// 4. DECODE USER DATA
export function getUserPayload() {
    const token = getToken();
    if (!token) return null;
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload).user;
    } catch (e) {
        return null;
    }
}

// 5. LOGIN HANDLER (Fixes the SyntaxError)
export async function handleLogin(email, password) {
    try {
        const data = await apiRequest('login', { email, password }, 'POST');
        if (data.token) {
            saveToken(data.token);
            window.location.href = '/dashboard.html';
        }
    } catch (err) {
        console.error('Login error:', err);
        alert(err.message || 'Login failed. Check credentials.');
        throw err;
    }
}

// 6. ACCESS GATEKEEPER
export function checkAccess() {
    const user = getUserPayload();
    if (!user) {
        window.location.href = '/index.html';
        return false;
    }
    return true;
}

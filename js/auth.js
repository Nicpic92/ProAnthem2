import { apiRequest } from './api.js';

export function getToken() { return localStorage.getItem('user_token'); }

export function getUserPayload() {
    const token = getToken();
    if (!token) return null;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.user || null;
    } catch (e) {
        localStorage.removeItem('user_token');
        return null;
    }
}

export function checkAccess() {
    const user = getUserPayload();
    if (!user) {
        window.location.href = '/proanthem_index.html';
        return false;
    }
    return true; // Everyone is 'active' in the free version
}

export async function handleLogin(e) {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
        const data = await apiRequest('login', { email, password }, 'POST');
        if (data.token) {
            localStorage.setItem('user_token', data.token);
            window.location.href = '/dashboard.html';
        }
    } catch (err) {
        alert('Login failed: ' + err.message);
    }
}

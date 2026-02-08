import { apiRequest } from './api.js';

export function getUserPayload() {
    const token = localStorage.getItem('user_token');
    if (!token) return null;
    try {
        return JSON.parse(atob(token.split('.')[1])).user;
    } catch (e) {
        return null;
    }
}

export function checkAccess() {
    const user = getUserPayload();
    if (!user) {
        window.location.href = '/proanthem_index.html';
        return false;
    }
    return true;
}

export async function handleLogin(event) {
    event.preventDefault();
    const email = event.target.email.value;
    const password = event.target.password.value;

    try {
        const res = await apiRequest('login', { email, password }, 'POST');
        if (res.token) {
            localStorage.setItem('user_token', res.token);
            window.location.href = '/dashboard.html';
        }
    } catch (err) {
        alert(err.message);
    }
}

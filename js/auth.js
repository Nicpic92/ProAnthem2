import { apiRequest } from './api.js';

/**
 * Decodes the JWT token to get user data
 * @returns {object|null} The user payload or null if invalid
 */
export function getUserPayload() {
    const token = localStorage.getItem('user_token');
    if (!token) return null;
    try {
        // Base64 decode the payload part of the JWT
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload).user;
    } catch (e) {
        console.error("Token decoding failed", e);
        localStorage.removeItem('user_token');
        return null;
    }
}

/**
 * Guards routes to ensure only logged-in users can enter
 * @returns {boolean}
 */
export function checkAccess() {
    const user = getUserPayload();
    if (!user) {
        window.location.href = '/proanthem_index.html';
        return false;
    }
    // In this free version, we don't block based on 'active' status,
    // but the payload still contains it for compatibility.
    return true;
}

/**
 * Handles the login form submission
 * @param {Event} event 
 */
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
        console.error("Login failed:", err);
        alert(err.message || "Invalid email or password.");
    }
}

/**
 * Logs the user out and cleans up storage
 */
export function logout() {
    localStorage.removeItem('user_token');
    window.location.href = '/proanthem_index.html';
}

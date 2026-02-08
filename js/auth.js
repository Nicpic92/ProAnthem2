/**
 * js/auth.js
 * Single source of truth for Authentication and Permissions
 */

import { apiRequest } from './api.js';

/**
 * Saves the JWT to localStorage
 */
export function saveToken(token) {
    localStorage.setItem('pa_token', token);
}

/**
 * Retrieves the JWT from localStorage
 */
export function getToken() {
    return localStorage.getItem('pa_token');
}

/**
 * Logs the user out and redirects to login
 */
export function logout() {
    localStorage.removeItem('pa_token');
    window.location.href = '/index.html';
}

/**
 * Decodes the JWT to get user metadata and permissions
 */
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
        console.error("Token decoding failed", e);
        return null;
    }
}

/**
 * Checks specific permissions defined in your Neon 'roles' table
 * Example: checkPermission('can_use_stems')
 */
export function checkPermission(permissionName) {
    const user = getUserPayload();
    if (!user || !user.permissions) return false;
    return !!user.permissions[permissionName];
}

/**
 * Handles the Login process for index.html
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
        alert(err.message || 'Check your credentials and Neon connection.');
        throw err; // Allow the UI to reset the button state
    }
}

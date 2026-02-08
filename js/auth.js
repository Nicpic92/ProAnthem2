/**
 * ProAnthem Client-side Auth Handler
 * Integrated with Neon Role-Based Access Control
 */

export function saveToken(token) {
    localStorage.setItem('pa_token', token);
}

export function getToken() {
    return localStorage.getItem('pa_token');
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

export function checkPermission(permissionName) {
    const user = getUserPayload();
    if (!user || !user.permissions) return false;
    // Check against Neon role flags: manage_band, setlists, stems, etc.
    return !!user.permissions[permissionName];
}

export function logout() {
    localStorage.removeItem('pa_token');
    window.location.href = '/index.html';
}

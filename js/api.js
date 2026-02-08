/**
 * ProAnthem API Connector
 * Centralizes all fetch calls to the Vercel /api folder.
 */

// Retrieve the token from browser storage
function getToken() {
    return localStorage.getItem('user_token');
}

/**
 * Global API Request handler
 * @param {string} endpoint - The function name in /api (e.g., 'login')
 * @param {object} data - The payload to send
 * @param {string} method - GET, POST, PUT, or DELETE
 */
export async function apiRequest(endpoint, data = null, method = 'GET') {
    const token = getToken();
    
    const options = { 
        method, 
        headers: { 
            'Content-Type': 'application/json' 
        } 
    };

    // Attach Bearer token for authenticated routes
    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }

    // Attach body data for write operations
    if (data && (method === 'POST' || method === 'PUT' || method === 'DELETE')) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`/api/${endpoint}`, options);

        // Handle unauthorized or expired sessions
        if (response.status === 401) {
            localStorage.removeItem('user_token');
            window.location.href = '/proanthem_index.html'; 
            throw new Error('Session expired. Please log in again.');
        }

        // Return null for successful "No Content" responses
        if (response.status === 204) return null;

        const responseData = await response.json();

        if (!response.ok) {
            throw new Error(responseData.message || `API Error: ${response.status}`);
        }

        return responseData;
    } catch (error) {
        console.error(`API Request Error [${endpoint}]:`, error);
        throw error;
    }
}

// Shortcut exports for common band tools
export const getSetlists = () => apiRequest('setlists');
export const saveSetlist = (data) => apiRequest('setlists', data, 'POST');
export const getFinances = () => apiRequest('finances');
export const getMerch = () => apiRequest('merch');

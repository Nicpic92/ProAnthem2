/**
 * js/api.js - Master API Request Helper
 */
export async function apiRequest(endpoint, data = null, method = 'GET') {
    const token = localStorage.getItem('pa_token');
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    };

    if (data && method !== 'GET') {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`/api/${endpoint}`, options);
        
        // Handle non-JSON (HTML 404/500) responses gracefully
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            const errorText = await response.text();
            console.error("Server returned non-JSON:", errorText);
            throw new Error("Server communication error. Check your API routes.");
        }

        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'API request failed.');
        }

        return result;
    } catch (err) {
        console.error(`API Request Error [${endpoint}]:`, err);
        throw err;
    }
}

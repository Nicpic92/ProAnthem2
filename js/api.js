export async function apiRequest(endpoint, data = null, method = 'GET') {
    const token = localStorage.getItem('user_token');
    const options = { 
        method, 
        headers: { 'Content-Type': 'application/json' } 
    };
    if (token) options.headers['Authorization'] = `Bearer ${token}`;
    if (data) options.body = JSON.stringify(data);

    try {
        const response = await fetch(`/api/${endpoint}`, options);

        if (response.status === 401) {
            localStorage.removeItem('user_token');
            window.location.href = '/proanthem_index.html';
            return;
        }

        if (response.status === 204) return null;
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'API Error');
        return result;
    } catch (error) {
        console.error('API Request Failed:', error);
        throw error;
    }
}

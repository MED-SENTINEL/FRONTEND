import * as env from '$env/static/public';
const BASE_URL = env.PUBLIC_API_BASE_URL || 'http://localhost:8000';


function getToken() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('sentinel_token');
}

function getUserId() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('sentinel_user_id');
}

/**
 * @param {string} endpoint
 * @param {any} options
 */
export async function apiFetch(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        const error = new Error(body.detail || `API Error: ${response.statusText}`);
        error.status = response.status;
        throw error;
    }

    return response.json();
}


/**
 * Fetch with Authorization header but no Content-Type (for FormData uploads)
 * @param {string} endpoint
 * @param {any} options
 */
export async function apiUpload(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const token = getToken();
    const headers = new Headers(options.headers || {});
    if (token) {
        headers.append('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.detail || `Upload failed: ${response.statusText}`);
    }
    return response.json();
}


export const reportsApi = {
    list: (patientId) => apiFetch(`/api/reports/${patientId}`),
    upload: async (formData) => {
        return apiUpload('/api/reports/upload', {
            method: 'POST',
            body: formData,
        });
    },
    getFile: async (reportId) => {
        const token = getToken();
        const headers = new Headers();
        if (token) headers.append('Authorization', `Bearer ${token}`);

        const response = await fetch(`${BASE_URL}/api/reports/file/${reportId}`, {
            headers,
        });

        if (!response.ok) {
            const body = await response.json().catch(() => ({}));
            throw new Error(body.detail || `File retrieval failed: ${response.statusText}`);
        }
        
        const blob = await response.blob();
        return URL.createObjectURL(blob);
    }
};


export const profileApi = {
    get: () => apiFetch('/api/profile/me'),
    onboard: (data) => apiFetch('/api/profile/onboard', { method: 'POST', body: JSON.stringify(data) }),
    update: (data) => apiFetch('/api/profile/me', { method: 'PUT', body: JSON.stringify(data) }),
};


export const shareApi = {
    validate: (shareKey, passcode) => apiFetch(`/api/share/validate/${shareKey}`, {
        method: 'POST',
        body: JSON.stringify({ passcode }),
    }),
    getFileUrl: (shareKey, passcode, reportId) => {
        return `${BASE_URL}/api/share/validate/${shareKey}/file/${reportId}?passcode=${passcode}`;
    }
};

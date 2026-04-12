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
    delete: async (reportId) => {
        const token = getToken();
        const headers = new Headers();
        if (token) headers.append('Authorization', `Bearer ${token}`);
        const response = await fetch(`${BASE_URL}/api/reports/${reportId}`, {
            method: 'DELETE',
            headers,
        });
        if (!response.ok) {
            const body = await response.json().catch(() => ({}));
            throw new Error(body.detail || `Delete failed: ${response.statusText}`);
        }
        return true;
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


export const aiApi = {
    /** Run OCR + anomaly detection on a specific report */
    analyze: (reportId) => apiFetch(`/api/ai/analyze/${reportId}`, { method: 'POST' }),
    
    /** Get comprehensive health insights for a patient */
    insights: (patientId) => apiFetch(`/api/ai/insights/${patientId}`, { method: 'POST' }),
    
    /** Chat with LISA AI assistant */
    chat: (message) => apiFetch('/api/ai/chat', { 
        method: 'POST', 
        body: JSON.stringify({ message }) 
    }),
    
    /** Get all past AI analyses for a patient */
    history: (patientId, type = null) => {
        const query = type ? `?analysis_type=${type}` : '';
        return apiFetch(`/api/ai/history/${patientId}${query}`);
    }
};


export const bloodworkApi = {
    /** List all bloodwork entries for a patient */
    list: (patientId) => apiFetch(`/api/bloodwork/${patientId}`),
    
    /** Create a new bloodwork entry */
    create: (data) => apiFetch('/api/bloodwork/', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    
    /** Delete a bloodwork entry */
    delete: async (entryId) => {
        const token = getToken();
        const headers = new Headers();
        if (token) headers.append('Authorization', `Bearer ${token}`);
        const response = await fetch(`${BASE_URL}/api/bloodwork/${entryId}`, {
            method: 'DELETE',
            headers,
        });
        if (!response.ok) {
            const body = await response.json().catch(() => ({}));
            throw new Error(body.detail || `Delete failed: ${response.statusText}`);
        }
        return true;
    },
};


export const doctorApi = {
    /** Create a clinical note for a patient */
    createNote: (data) => apiFetch('/api/doctor/notes', {
        method: 'POST',
        body: JSON.stringify(data),
    }),

    /** Get all notes for a patient */
    getNotes: (patientId) => apiFetch(`/api/doctor/notes/${patientId}`),

    /** Delete a note */
    deleteNote: async (noteId) => {
        const token = getToken();
        const headers = new Headers();
        if (token) headers.append('Authorization', `Bearer ${token}`);
        const response = await fetch(`${BASE_URL}/api/doctor/notes/${noteId}`, {
            method: 'DELETE',
            headers,
        });
        if (!response.ok) {
            const body = await response.json().catch(() => ({}));
            throw new Error(body.detail || `Delete failed: ${response.statusText}`);
        }
        return true;
    },

    /** Chat with Clinical LISA */
    clinicalChat: (message, patientId) => apiFetch('/api/doctor/lisa-clinical', {
        method: 'POST',
        body: JSON.stringify({ message, patient_id: patientId }),
    }),

    /** Get access logs for a patient */
    getAccessLogs: (patientId) => apiFetch(`/api/doctor/access-logs/${patientId}`),
};

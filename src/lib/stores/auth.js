import { writable, get } from 'svelte/store';
import { apiFetch } from '../api/client';

/** @type {import('svelte/store').Writable<any>} */
export const currentUser = writable(null);

/** @type {import('svelte/store').Writable<boolean>} */
export const isAuthenticated = writable(false);

function loadStoredUser() {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('sentinel_user');
    const token = localStorage.getItem('sentinel_token');
    if (stored && token) {
        try {
            const user = JSON.parse(stored);
            currentUser.set(user);
            isAuthenticated.set(true);
        } catch (e) {
            clearStorage();
        }
    }
}

function clearStorage() {
    localStorage.removeItem('sentinel_user');
    localStorage.removeItem('sentinel_user_id');
    localStorage.removeItem('sentinel_token');
}

loadStoredUser();

export async function login(email, password) {
    const response = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
    // response = { user: {...}, token: "..." }
    const { user, token } = response;
    currentUser.set(user);
    isAuthenticated.set(true);
    localStorage.setItem('sentinel_user', JSON.stringify(user));
    localStorage.setItem('sentinel_user_id', user.id);
    localStorage.setItem('sentinel_token', token);

    // Now fetch the full merged user+profile from /me (includes blood_type etc.)
    await refreshUser();

    return response;
}

export async function register(data) {
    // Register returns the user (no token — needs verification first)
    const user = await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
    });
    return user;
}

export async function verifyEmail(email, code) {
    const response = await apiFetch('/api/auth/verify', {
        method: 'POST',
        body: JSON.stringify({ email, code }),
    });
    // response = { user: {...}, token: "..." }
    const { user, token } = response;
    currentUser.set(user);
    isAuthenticated.set(true);
    localStorage.setItem('sentinel_user', JSON.stringify(user));
    localStorage.setItem('sentinel_user_id', user.id);
    localStorage.setItem('sentinel_token', token);
    return response;
}

export async function resendCode(email) {
    return await apiFetch('/api/auth/resend-code', {
        method: 'POST',
        body: JSON.stringify({ email }),
    });
}

export function logout() {
    currentUser.set(null);
    isAuthenticated.set(false);
    clearStorage();
    if (typeof window !== 'undefined') {
        window.location.href = '/login';
    }
}

/**
 * Refresh the current user data from the API.
 * Useful after onboarding to update is_onboarded flag.
 */
export async function refreshUser() {
    try {
        const user = await apiFetch('/api/auth/me');
        currentUser.set(user);
        localStorage.setItem('sentinel_user', JSON.stringify(user));
        return user;
    } catch (e) {
        // Token invalid — log out
        logout();
        return null;
    }
}

export async function handleSSOCallback(token) {
    localStorage.setItem('sentinel_token', token);
    try {
        const user = await refreshUser();
        if (user) {
            isAuthenticated.set(true);
            localStorage.setItem('sentinel_user_id', user.id);
            return user;
        }
    } catch (err) {
        logout();
        throw err;
    }
}

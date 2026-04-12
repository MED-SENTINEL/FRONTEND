/**
 * Doctor Session Store
 * Manages multi-patient sessions persisted in localStorage.
 * Each session = a validated share key access to a patient's data.
 */
import { writable, get } from 'svelte/store';

const STORAGE_KEY = 'sentinel_doctor_sessions';
const ACTIVE_KEY = 'sentinel_active_patient';

/**
 * Load sessions from localStorage
 */
function loadSessions() {
    if (typeof window === 'undefined') return [];
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function saveSessions(sessions) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

function loadActiveId() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ACTIVE_KEY);
}

function saveActiveId(id) {
    if (typeof window === 'undefined') return;
    if (id) {
        localStorage.setItem(ACTIVE_KEY, id);
    } else {
        localStorage.removeItem(ACTIVE_KEY);
    }
}

/** All saved patient sessions */
export const doctorSessions = writable(loadSessions());

/** Currently active patient data (full response from validate) */
export const activePatient = writable(null);

/** Active patient's share key */
export const activeShareKey = writable(loadActiveId());

/**
 * Add a new patient session after successful share key validation.
 * @param {object} params
 * @param {string} params.shareKey
 * @param {string} params.passcode
 * @param {object} params.patientData - Full response from /api/share/validate
 */
export function addSession({ shareKey, passcode, patientData }) {
    const sessions = get(doctorSessions);
    
    // Remove existing session for this key (refresh)
    const filtered = sessions.filter(s => s.shareKey !== shareKey);
    
    const newSession = {
        shareKey,
        passcode,
        patientName: patientData.patient_profile?.full_name || 'Patient',
        patientId: patientData.patient_profile?.id,
        permissions: patientData.permissions,
        expiresAt: patientData.key_expires_at,
        usageRemaining: patientData.usage_remaining,
        accessedAt: new Date().toISOString(),
    };
    
    const updated = [newSession, ...filtered];
    doctorSessions.set(updated);
    saveSessions(updated);
    
    // Set as active
    activePatient.set(patientData);
    activeShareKey.set(shareKey);
    saveActiveId(shareKey);
}

/**
 * Switch to a different saved patient session.
 * Returns the session data so caller can re-validate if needed.
 */
export function switchPatient(shareKey) {
    const sessions = get(doctorSessions);
    const session = sessions.find(s => s.shareKey === shareKey);
    if (session) {
        activeShareKey.set(shareKey);
        saveActiveId(shareKey);
    }
    return session;
}

/**
 * Remove a patient session.
 */
export function removeSession(shareKey) {
    const sessions = get(doctorSessions);
    const updated = sessions.filter(s => s.shareKey !== shareKey);
    doctorSessions.set(updated);
    saveSessions(updated);
    
    // If we removed the active one, clear it
    if (get(activeShareKey) === shareKey) {
        activePatient.set(null);
        activeShareKey.set(null);
        saveActiveId(null);
    }
}

/**
 * Clear all sessions (e.g. on logout).
 */
export function clearAllSessions() {
    doctorSessions.set([]);
    activePatient.set(null);
    activeShareKey.set(null);
    if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(ACTIVE_KEY);
    }
}

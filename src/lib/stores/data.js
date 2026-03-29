import { writable, get } from 'svelte/store';
import { apiFetch, reportsApi } from '../api/client';
import { currentUser } from './auth';

/** @type {import('svelte/store').Writable<any[]>} */
export const traumaPins = writable([]);

/** @type {import('svelte/store').Writable<any[]>} */
export const reports = writable([]);

export const loading = writable(false);
export const error = writable(null);

export async function fetchMyData() {
    const user = get(currentUser);
    if (!user) return;
    loading.set(true);
    error.set(null);
    try {
        const [tData, rData] = await Promise.all([
            apiFetch(`/api/trauma/${user.id}`),
            reportsApi.list(user.id)
        ]);
        
        traumaPins.set(tData.map(pin => ({
            ...pin,
            x: pin.position_x,
            y: pin.position_y,
            z: pin.position_z,
        })));
        reports.set(rData);

    } catch (err) {
        // If we get a 404 or 401 for our own data, the DB was likely reset or token expired. Let's auto-logout to clear local cache.
        if (err.status === 404 || err.status === 401 || err.message.includes('not found') || err.message.includes('expired') || err.message.includes('invalid token')) {
            console.warn("Auth or user data issue, forcing logout to clear stale cache.");
            import('./auth').then(({ logout }) => logout());
        } else {
            error.set(err.message);
        }
    } finally {
        loading.set(false);
    }
}

export async function addTraumaPin(x, y, z, note = "EXTERNAL_TRAUMA") {
    const user = get(currentUser);
    if (!user) return;
    try {
        const newPin = await apiFetch('/api/trauma/', {
            method: 'POST',
            body: JSON.stringify({
                patient_id: user.id,
                position_x: x,
                position_y: y,
                position_z: z,
                title: note,
                trauma_type: 'injury',
                severity: 'medium',
                notes: note,
            })
        });
        // Normalize for frontend use
        const normalized = {
            ...newPin,
            x: newPin.position_x,
            y: newPin.position_y,
            z: newPin.position_z,
        };
        traumaPins.update(pins => [...pins, normalized]);
        return normalized;
    } catch (err) {
        error.set(err.message);
    }
}

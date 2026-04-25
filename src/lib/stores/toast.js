/**
 * Toast Notification Store
 * Global toast system for success, error, warning, and info messages.
 */
import { writable } from 'svelte/store';

export const toasts = writable([]);

let toastId = 0;

/**
 * Add a toast notification.
 * @param {'success'|'error'|'warning'|'info'} type
 * @param {string} title
 * @param {string} [message]
 * @param {number} [duration=4000] - Auto-dismiss duration in ms. Set to 0 for persistent.
 */
export function addToast(type, title, message = '', duration = 4000) {
    const id = ++toastId;
    const toast = { id, type, title, message, duration };
    
    toasts.update(t => [...t, toast]);

    if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
    }

    return id;
}

/**
 * Remove a toast by id.
 */
export function removeToast(id) {
    toasts.update(t => t.filter(toast => toast.id !== id));
}

/** Shorthand helpers */
export const toast = {
    success: (title, message) => addToast('success', title, message),
    error: (title, message) => addToast('error', title, message, 6000),
    warning: (title, message) => addToast('warning', title, message, 5000),
    info: (title, message) => addToast('info', title, message),
};

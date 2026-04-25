/**
 * Theme Store
 * Manages dark/light mode with localStorage persistence.
 * Default: dark mode.
 */
import { writable } from 'svelte/store';

const STORAGE_KEY = 'sentinel_theme';

function getInitialTheme() {
    if (typeof window === 'undefined') return 'dark';
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
    // Default to dark
    return 'dark';
}

export const theme = writable(getInitialTheme());

/**
 * Initialize theme on mount — applies the class to <html> and subscribes to changes.
 * Call this once in +layout.svelte onMount.
 */
export function initTheme() {
    if (typeof window === 'undefined') return;

    const stored = getInitialTheme();
    applyTheme(stored);

    theme.subscribe(value => {
        applyTheme(value);
        localStorage.setItem(STORAGE_KEY, value);
    });
}

function applyTheme(value) {
    if (typeof document === 'undefined') return;
    const html = document.documentElement;
    if (value === 'dark') {
        html.classList.add('dark');
    } else {
        html.classList.remove('dark');
    }
}

/** Toggle between light and dark */
export function toggleTheme() {
    theme.update(t => t === 'dark' ? 'light' : 'dark');
}

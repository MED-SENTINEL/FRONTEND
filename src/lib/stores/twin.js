import { writable } from 'svelte/store';

export const modelType = writable('skeleton'); // 'skeleton', 'male', 'female'
export const autoRotate = writable(true);
export const isLoaded = writable(false);

import { writable } from 'svelte/store';

export const modelType = writable('skeleton'); // 'skeleton', 'male', 'female'
export const rotation = writable(0);
export const zoom = writable(1);
export const autoRotate = writable(true);
export const isLoaded = writable(false);

export function setModel(type) {
  modelType.set(type);
}

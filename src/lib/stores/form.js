import { writable } from 'svelte/store';

export const traumaForm = writable({
    title: "",
    notes: "",
    body_region: "",
    severity: "medium",
    trauma_type: "condition",
    occurred_at: "",
    position_x: 0,
    position_y: 0,
    position_z: 0,
    showAddForm: false
});

export const isPicking = writable(false);
export const pickedPosition = writable(null); // {x, y, z}

export function resetForm() {
    traumaForm.set({
        title: "",
        notes: "",
        body_region: "",
        severity: "medium",
        trauma_type: "condition",
        occurred_at: "",
        position_x: 0,
        position_y: 0,
        position_z: 0,
        showAddForm: false
    });
    isPicking.set(false);
    pickedPosition.set(null);
}

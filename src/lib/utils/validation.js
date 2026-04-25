/**
 * Centralized validation utilities for SENTINEL forms.
 * Each function returns { valid: boolean, error: string|null }
 */

export function validateRequired(value, label = 'Field') {
    if (!value || (typeof value === 'string' && !value.trim())) {
        return { valid: false, error: `${label} is required` };
    }
    return { valid: true, error: null };
}

export function validatePhone(value) {
    if (!value) return { valid: true, error: null }; // optional
    const digits = value.replace(/[\s\-\+\(\)]/g, '');
    if (!/^\d+$/.test(digits)) {
        return { valid: false, error: 'Phone must contain only numbers' };
    }
    if (digits.length < 10 || digits.length > 15) {
        return { valid: false, error: 'Phone must be 10-15 digits' };
    }
    return { valid: true, error: null };
}

export function validateEmail(value) {
    if (!value) return { valid: false, error: 'Email is required' };
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(value.trim())) {
        return { valid: false, error: 'Enter a valid email address' };
    }
    return { valid: true, error: null };
}

export function validatePassword(value) {
    if (!value) return { valid: false, error: 'Password is required', strength: 0 };
    
    let strength = 0;
    const checks = {
        length: value.length >= 8,
        uppercase: /[A-Z]/.test(value),
        lowercase: /[a-z]/.test(value),
        number: /[0-9]/.test(value),
        special: /[^A-Za-z0-9]/.test(value),
    };

    strength = Object.values(checks).filter(Boolean).length;

    if (value.length < 8) {
        return { valid: false, error: 'Password must be at least 8 characters', strength, checks };
    }
    if (!checks.uppercase) {
        return { valid: false, error: 'Include at least one uppercase letter', strength, checks };
    }
    if (!checks.number) {
        return { valid: false, error: 'Include at least one number', strength, checks };
    }
    return { valid: true, error: null, strength, checks };
}

export function validatePasswordMatch(password, confirm) {
    if (password !== confirm) {
        return { valid: false, error: 'Passwords do not match' };
    }
    return { valid: true, error: null };
}

export function validateNumericRange(value, min, max, label = 'Value') {
    if (!value && value !== 0) return { valid: true, error: null }; // optional
    const num = parseFloat(value);
    if (isNaN(num)) {
        return { valid: false, error: `${label} must be a number` };
    }
    if (num < min || num > max) {
        return { valid: false, error: `${label} must be between ${min} and ${max}` };
    }
    return { valid: true, error: null };
}

export function validateDate(value, options = {}) {
    if (!value) return { valid: true, error: null }; // optional
    const date = new Date(value);
    if (isNaN(date.getTime())) {
        return { valid: false, error: 'Invalid date' };
    }
    if (options.noFuture && date > new Date()) {
        return { valid: false, error: 'Date cannot be in the future' };
    }
    if (options.minYear && date.getFullYear() < options.minYear) {
        return { valid: false, error: `Date must be after ${options.minYear}` };
    }
    return { valid: true, error: null };
}

/**
 * Returns a password strength label and color class
 */
export function getPasswordStrength(strength) {
    if (strength <= 1) return { label: 'Weak', color: 'bg-red-500', textColor: 'text-red-600' };
    if (strength <= 2) return { label: 'Fair', color: 'bg-amber-500', textColor: 'text-amber-600' };
    if (strength <= 3) return { label: 'Good', color: 'bg-yellow-500', textColor: 'text-yellow-600' };
    if (strength <= 4) return { label: 'Strong', color: 'bg-emerald-500', textColor: 'text-emerald-600' };
    return { label: 'Very Strong', color: 'bg-cyan-500', textColor: 'text-cyan-600' };
}

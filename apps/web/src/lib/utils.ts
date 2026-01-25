// Utility functions

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Format date to Thai locale
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions) {
    return new Date(date).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        ...options,
    });
}

// Format datetime to Thai locale
export function formatDateTime(date: string | Date) {
    return new Date(date).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

// Truncate text
export function truncate(text: string, length: number) {
    if (text.length <= length) return text;
    return text.slice(0, length) + '...';
}

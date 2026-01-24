// Toaster component stub

'use client';

export function Toaster() {
    return null; // Will be implemented with a toast library
}

export function useToast() {
    return {
        toast: ({ title, description }: { title?: string; description?: string }) => {
            console.log('Toast:', title, description);
        },
    };
}

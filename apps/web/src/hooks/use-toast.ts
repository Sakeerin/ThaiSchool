// Toast hook for notifications

'use client';

import * as React from 'react';

interface Toast {
    id: string;
    title?: string;
    description?: string;
    variant?: 'default' | 'destructive';
}

interface ToastContextValue {
    toasts: Toast[];
    toast: (options: Omit<Toast, 'id'>) => void;
    dismiss: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined);

let toastCount = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = React.useState<Toast[]>([]);

    const toast = React.useCallback((options: Omit<Toast, 'id'>) => {
        const id = `toast-${++toastCount}`;
        setToasts((prev) => [...prev, { ...options, id }]);

        // Auto dismiss after 5 seconds
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 5000);
    }, []);

    const dismiss = React.useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return React.createElement(
        ToastContext.Provider,
        { value: { toasts, toast, dismiss } },
        children
    );
}

export function useToast() {
    const context = React.useContext(ToastContext);

    // Return a no-op toast function if context is not available
    // This allows the hook to work without the provider for simpler cases
    if (!context) {
        return {
            toast: (options: Omit<Toast, 'id'>) => {
                console.log('Toast:', options.title, options.description);
            },
            toasts: [] as Toast[],
            dismiss: (_id: string) => { },
        };
    }

    return context;
}

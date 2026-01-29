// Checkbox Component

'use client';

import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CheckboxProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
    ({ className, checked = false, onCheckedChange, ...props }, ref) => {
        return (
            <button
                ref={ref}
                role="checkbox"
                type="button"
                aria-checked={checked}
                onClick={() => onCheckedChange?.(!checked)}
                className={cn(
                    'peer h-4 w-4 shrink-0 rounded-sm border border-gray-300 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                    checked
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'bg-white dark:bg-gray-800 dark:border-gray-600',
                    className
                )}
                {...props}
            >
                {checked && (
                    <span className="flex items-center justify-center text-current">
                        <Check className="h-3 w-3" />
                    </span>
                )}
            </button>
        );
    }
);
Checkbox.displayName = 'Checkbox';

export { Checkbox };

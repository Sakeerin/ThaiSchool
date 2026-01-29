// RadioGroup Component

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface RadioGroupContextValue {
    value?: string;
    onValueChange?: (value: string) => void;
    name: string;
}

const RadioGroupContext = React.createContext<RadioGroupContextValue>({
    name: '',
});

interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
    value?: string;
    onValueChange?: (value: string) => void;
    name?: string;
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
    ({ className, value, onValueChange, name, ...props }, ref) => {
        const generatedName = React.useId();
        return (
            <RadioGroupContext.Provider value={{ value, onValueChange, name: name || generatedName }}>
                <div
                    ref={ref}
                    className={cn('grid gap-2', className)}
                    role="radiogroup"
                    {...props}
                />
            </RadioGroupContext.Provider>
        );
    }
);
RadioGroup.displayName = 'RadioGroup';

interface RadioGroupItemProps extends React.InputHTMLAttributes<HTMLInputElement> {
    value: string;
}

const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
    ({ className, value, id, ...props }, ref) => {
        const context = React.useContext(RadioGroupContext);
        const isChecked = context.value === value;

        return (
            <input
                ref={ref}
                type="radio"
                id={id}
                name={context.name}
                value={value}
                checked={isChecked}
                onChange={() => context.onValueChange?.(value)}
                className={cn(
                    'aspect-square h-4 w-4 rounded-full border border-gray-300 text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600',
                    className
                )}
                {...props}
            />
        );
    }
);
RadioGroupItem.displayName = 'RadioGroupItem';

export { RadioGroup, RadioGroupItem };

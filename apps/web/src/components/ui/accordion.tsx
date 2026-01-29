// Accordion Component

'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccordionContextValue {
    value?: string;
    onValueChange?: (value: string) => void;
    type: 'single' | 'multiple';
}

const AccordionContext = React.createContext<AccordionContextValue>({
    type: 'single',
});

interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
    type?: 'single' | 'multiple';
    value?: string;
    onValueChange?: (value: string) => void;
    collapsible?: boolean;
}

const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
    ({ className, type = 'single', value, onValueChange, children, ...props }, ref) => {
        const [internalValue, setInternalValue] = React.useState<string>('');
        const currentValue = value ?? internalValue;
        const handleValueChange = onValueChange ?? setInternalValue;

        return (
            <AccordionContext.Provider value={{ value: currentValue, onValueChange: handleValueChange, type }}>
                <div ref={ref} className={cn('space-y-2', className)} {...props}>
                    {children}
                </div>
            </AccordionContext.Provider>
        );
    }
);
Accordion.displayName = 'Accordion';

interface AccordionItemContextValue {
    value: string;
    isOpen: boolean;
    toggle: () => void;
}

const AccordionItemContext = React.createContext<AccordionItemContextValue>({
    value: '',
    isOpen: false,
    toggle: () => { },
});

interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
    value: string;
}

const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
    ({ className, value, children, ...props }, ref) => {
        const context = React.useContext(AccordionContext);
        const isOpen = context.value === value;

        const toggle = () => {
            context.onValueChange?.(isOpen ? '' : value);
        };

        return (
            <AccordionItemContext.Provider value={{ value, isOpen, toggle }}>
                <div ref={ref} className={cn('border-b', className)} {...props}>
                    {children}
                </div>
            </AccordionItemContext.Provider>
        );
    }
);
AccordionItem.displayName = 'AccordionItem';

interface AccordionTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { }

const AccordionTrigger = React.forwardRef<HTMLButtonElement, AccordionTriggerProps>(
    ({ className, children, ...props }, ref) => {
        const { isOpen, toggle } = React.useContext(AccordionItemContext);

        return (
            <button
                ref={ref}
                type="button"
                onClick={toggle}
                className={cn(
                    'flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline w-full text-left',
                    className
                )}
                {...props}
            >
                {children}
                <ChevronDown
                    className={cn(
                        'h-4 w-4 shrink-0 transition-transform duration-200',
                        isOpen && 'rotate-180'
                    )}
                />
            </button>
        );
    }
);
AccordionTrigger.displayName = 'AccordionTrigger';

interface AccordionContentProps extends React.HTMLAttributes<HTMLDivElement> { }

const AccordionContent = React.forwardRef<HTMLDivElement, AccordionContentProps>(
    ({ className, children, ...props }, ref) => {
        const { isOpen } = React.useContext(AccordionItemContext);

        if (!isOpen) return null;

        return (
            <div
                ref={ref}
                className={cn('overflow-hidden text-sm transition-all pb-4 pt-0', className)}
                {...props}
            >
                {children}
            </div>
        );
    }
);
AccordionContent.displayName = 'AccordionContent';

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };

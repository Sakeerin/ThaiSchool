// Badge Component - Status and role indicators

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
    {
        variants: {
            variant: {
                default: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
                primary: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
                secondary: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
                success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
                warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
                danger: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
                info: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    );
}

// Role badge with Thai labels
const roleConfig: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
    SUPER_ADMIN: { label: 'ผู้ดูแลสูงสุด', variant: 'danger' },
    ADMIN: { label: 'ผู้ดูแลระบบ', variant: 'primary' },
    TEACHER: { label: 'ครู', variant: 'secondary' },
    STUDENT: { label: 'นักเรียน', variant: 'info' },
    PARENT: { label: 'ผู้ปกครอง', variant: 'success' },
};

function RoleBadge({ role }: { role: string }) {
    const config = roleConfig[role] || { label: role, variant: 'default' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
}

// Status badge
const statusConfig: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
    ACTIVE: { label: 'ใช้งาน', variant: 'success' },
    INACTIVE: { label: 'ไม่ใช้งาน', variant: 'default' },
    ON_LEAVE: { label: 'ลา', variant: 'warning' },
    RESIGNED: { label: 'ลาออก', variant: 'danger' },
    GRADUATED: { label: 'จบการศึกษา', variant: 'info' },
    TRANSFERRED: { label: 'ย้าย', variant: 'warning' },
    DROPPED: { label: 'พ้นสภาพ', variant: 'danger' },
    RETIRED: { label: 'เกษียณ', variant: 'default' },
};

function StatusBadge({ status, isActive }: { status?: string; isActive?: boolean }) {
    if (isActive !== undefined) {
        return (
            <Badge variant={isActive ? 'success' : 'default'}>
                {isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
            </Badge>
        );
    }
    const config = statusConfig[status || ''] || { label: status || '-', variant: 'default' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
}

export { Badge, badgeVariants, RoleBadge, StatusBadge };

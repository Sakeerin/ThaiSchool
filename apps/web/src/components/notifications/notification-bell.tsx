'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Bell, Check, X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    useNotifications,
    useUnreadNotificationCount,
    useMarkNotificationAsRead,
    useMarkAllNotificationsAsRead,
} from '@/hooks/use-notifications';
import { UserNotification, NotificationType } from '@/lib/api/notifications';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';

const notificationTypeLabels: Record<NotificationType, { label: string; color: string }> = {
    ASSIGNMENT_NEW: { label: 'งานใหม่', color: 'bg-blue-500' },
    ASSIGNMENT_DUE: { label: 'งานใกล้ครบกำหนด', color: 'bg-orange-500' },
    ASSIGNMENT_GRADED: { label: 'ตรวจงานแล้ว', color: 'bg-green-500' },
    EXAM_UPCOMING: { label: 'สอบเร็วๆ นี้', color: 'bg-purple-500' },
    EXAM_RESULT: { label: 'ผลสอบ', color: 'bg-teal-500' },
    GRADE_UPDATED: { label: 'อัพเดตเกรด', color: 'bg-indigo-500' },
    MESSAGE_NEW: { label: 'ข้อความใหม่', color: 'bg-pink-500' },
    ANNOUNCEMENT: { label: 'ประกาศ', color: 'bg-yellow-500' },
    SYSTEM: { label: 'ระบบ', color: 'bg-gray-500' },
};

export function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const { data: countData } = useUnreadNotificationCount();
    const { data: notificationsData } = useNotifications({ limit: 5 });
    const markAsRead = useMarkNotificationAsRead();
    const markAllAsRead = useMarkAllNotificationsAsRead();

    const unreadCount = countData?.count ?? 0;
    const notifications = notificationsData?.items ?? [];

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkAsRead = (id: string) => {
        markAsRead.mutate(id);
    };

    const handleMarkAllAsRead = () => {
        markAllAsRead.mutate();
    };

    const formatTime = (dateStr: string) => {
        try {
            return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: th });
        } catch {
            return dateStr;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <Badge
                        variant="destructive"
                        className="absolute -right-1 -top-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                )}
            </Button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 rounded-lg border bg-popover shadow-lg z-50">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b px-4 py-3">
                        <h3 className="font-semibold">การแจ้งเตือน</h3>
                        {unreadCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleMarkAllAsRead}
                                className="text-xs"
                            >
                                <Check className="h-3 w-3 mr-1" />
                                อ่านทั้งหมด
                            </Button>
                        )}
                    </div>

                    {/* Notification List */}
                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="py-8 text-center text-muted-foreground">
                                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p>ไม่มีการแจ้งเตือน</p>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {notifications.map((notification) => (
                                    <NotificationItem
                                        key={notification.id}
                                        notification={notification}
                                        onMarkAsRead={handleMarkAsRead}
                                        formatTime={formatTime}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="border-t px-4 py-3">
                        <Link
                            href="/dashboard/notifications"
                            className="flex items-center justify-center text-sm text-primary hover:underline"
                            onClick={() => setIsOpen(false)}
                        >
                            ดูทั้งหมด
                            <ExternalLink className="h-3 w-3 ml-1" />
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}

interface NotificationItemProps {
    notification: UserNotification;
    onMarkAsRead: (id: string) => void;
    formatTime: (dateStr: string) => string;
}

function NotificationItem({ notification, onMarkAsRead, formatTime }: NotificationItemProps) {
    const typeInfo = notificationTypeLabels[notification.type] || {
        label: 'แจ้งเตือน',
        color: 'bg-gray-500',
    };

    return (
        <div
            className={cn(
                'relative px-4 py-3 hover:bg-muted/50 transition-colors',
                !notification.isRead && 'bg-primary/5'
            )}
        >
            {notification.link ? (
                <Link href={notification.link} className="block">
                    <NotificationContent notification={notification} typeInfo={typeInfo} formatTime={formatTime} />
                </Link>
            ) : (
                <NotificationContent notification={notification} typeInfo={typeInfo} formatTime={formatTime} />
            )}

            {!notification.isRead && (
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onMarkAsRead(notification.id);
                    }}
                    className="absolute right-2 top-2 p-1 rounded hover:bg-muted"
                    title="ทำเครื่องหมายว่าอ่านแล้ว"
                >
                    <Check className="h-3 w-3 text-muted-foreground" />
                </button>
            )}
        </div>
    );
}

interface NotificationContentProps {
    notification: UserNotification;
    typeInfo: { label: string; color: string };
    formatTime: (dateStr: string) => string;
}

function NotificationContent({ notification, typeInfo, formatTime }: NotificationContentProps) {
    return (
        <>
            <div className="flex items-center gap-2 mb-1">
                <span
                    className={cn(
                        'px-1.5 py-0.5 text-[10px] font-medium text-white rounded',
                        typeInfo.color
                    )}
                >
                    {typeInfo.label}
                </span>
                <span className="text-[10px] text-muted-foreground">
                    {formatTime(notification.createdAt)}
                </span>
            </div>
            <p className="font-medium text-sm line-clamp-1">{notification.title}</p>
            <p className="text-xs text-muted-foreground line-clamp-2">{notification.content}</p>
        </>
    );
}

export default NotificationBell;

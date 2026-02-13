'use client';

import { useState } from 'react';
import { Bell, Check, Trash2, Filter, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
    useNotifications,
    useUnreadNotificationCount,
    useMarkNotificationAsRead,
    useMarkAllNotificationsAsRead,
    useDeleteNotification,
} from '@/hooks/use-notifications';
import { NotificationType } from '@/lib/api/notifications';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';
import Link from 'next/link';

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

export default function NotificationsPage() {
    const [filterRead, setFilterRead] = useState<string>('all');
    const [filterType, setFilterType] = useState<string>('all');

    const params: any = {};
    if (filterRead === 'unread') params.isRead = false;
    if (filterRead === 'read') params.isRead = true;
    if (filterType !== 'all') params.type = filterType;

    const { data, isLoading } = useNotifications(params);
    const { data: countData } = useUnreadNotificationCount();
    const markAsRead = useMarkNotificationAsRead();
    const markAllAsRead = useMarkAllNotificationsAsRead();
    const deleteNotification = useDeleteNotification();

    const notifications = data?.items ?? [];
    const unreadCount = countData?.count ?? 0;

    const formatTime = (dateStr: string) => {
        try {
            return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: th });
        } catch {
            return dateStr;
        }
    };

    return (
        <div className="container mx-auto py-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Bell className="h-6 w-6" />
                        การแจ้งเตือน
                    </h1>
                    <p className="text-muted-foreground">
                        {unreadCount > 0 ? `คุณมี ${unreadCount} การแจ้งเตือนที่ยังไม่ได้อ่าน` : 'ไม่มีการแจ้งเตือนใหม่'}
                    </p>
                </div>
                {unreadCount > 0 && (
                    <Button
                        variant="outline"
                        onClick={() => markAllAsRead.mutate()}
                        disabled={markAllAsRead.isPending}
                    >
                        <CheckCheck className="h-4 w-4 mr-2" />
                        อ่านทั้งหมด
                    </Button>
                )}
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">กรอง:</span>
                        </div>
                        <Select value={filterRead} onValueChange={setFilterRead}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="สถานะ" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">ทั้งหมด</SelectItem>
                                <SelectItem value="unread">ยังไม่อ่าน</SelectItem>
                                <SelectItem value="read">อ่านแล้ว</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={filterType} onValueChange={setFilterType}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="ประเภท" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">ทุกประเภท</SelectItem>
                                {Object.entries(notificationTypeLabels).map(([key, { label }]) => (
                                    <SelectItem key={key} value={key}>
                                        {label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Notification List */}
            <div className="space-y-3">
                {isLoading ? (
                    // Loading skeleton
                    Array.from({ length: 5 }).map((_, i) => (
                        <Card key={i}>
                            <CardContent className="p-4">
                                <div className="flex items-start gap-4">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-5 w-3/4" />
                                        <Skeleton className="h-4 w-1/2" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : notifications.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                            <p className="text-lg font-medium">ไม่มีการแจ้งเตือน</p>
                            <p className="text-muted-foreground">
                                {filterRead !== 'all' || filterType !== 'all'
                                    ? 'ลองเปลี่ยนตัวกรองเพื่อดูการแจ้งเตือนอื่น'
                                    : 'เมื่อมีการแจ้งเตือนใหม่ จะแสดงที่นี่'}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    notifications.map((notification) => {
                        const typeInfo = notificationTypeLabels[notification.type] || {
                            label: 'แจ้งเตือน',
                            color: 'bg-gray-500',
                        };

                        return (
                            <Card
                                key={notification.id}
                                className={cn(
                                    'transition-all hover:shadow-md',
                                    !notification.isRead && 'border-l-4 border-l-primary bg-primary/5'
                                )}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-4">
                                        <div
                                            className={cn(
                                                'flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-white',
                                                typeInfo.color
                                            )}
                                        >
                                            <Bell className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge variant="secondary" className="text-xs">
                                                    {typeInfo.label}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">
                                                    {formatTime(notification.createdAt)}
                                                </span>
                                                {!notification.isRead && (
                                                    <Badge variant="default" className="text-xs">
                                                        ใหม่
                                                    </Badge>
                                                )}
                                            </div>
                                            {notification.link ? (
                                                <Link href={notification.link} className="block">
                                                    <h3 className="font-medium hover:text-primary transition-colors">
                                                        {notification.title}
                                                    </h3>
                                                </Link>
                                            ) : (
                                                <h3 className="font-medium">{notification.title}</h3>
                                            )}
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {notification.content}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {!notification.isRead && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => markAsRead.mutate(notification.id)}
                                                    title="ทำเครื่องหมายว่าอ่านแล้ว"
                                                >
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:text-destructive"
                                                onClick={() => deleteNotification.mutate(notification.id)}
                                                title="ลบ"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>
        </div>
    );
}

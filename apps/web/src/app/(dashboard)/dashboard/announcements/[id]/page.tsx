'use client';

import { use } from 'react';
import { ArrowLeft, Calendar, Paperclip, Download, User } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAnnouncement } from '@/hooks/use-notifications';
import { AnnouncementType, Priority } from '@/lib/api/notifications';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

const typeConfig: Record<AnnouncementType, { label: string; color: string }> = {
    GENERAL: { label: 'ทั่วไป', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
    ACADEMIC: { label: 'วิชาการ', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
    ACTIVITY: { label: 'กิจกรรม', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
    URGENT: { label: 'เร่งด่วน', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
};

export default function AnnouncementDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const { data: announcement, isLoading } = useAnnouncement(resolvedParams.id);

    const formatDate = (dateStr: string) => {
        try {
            return format(new Date(dateStr), 'd MMMM yyyy เวลา HH:mm น.', { locale: th });
        } catch {
            return dateStr;
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto py-6 space-y-6">
                <Skeleton className="h-8 w-32" />
                <Card>
                    <CardHeader>
                        <div className="space-y-3">
                            <Skeleton className="h-6 w-24" />
                            <Skeleton className="h-8 w-3/4" />
                            <Skeleton className="h-4 w-48" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-64 w-full" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!announcement) {
        return (
            <div className="container mx-auto py-6">
                <Card>
                    <CardContent className="py-12 text-center">
                        <p className="text-lg font-medium">ไม่พบประกาศ</p>
                        <p className="text-muted-foreground mb-4">ประกาศที่คุณต้องการอาจถูกลบหรือไม่มีอยู่</p>
                        <Link href="/dashboard/announcements">
                            <Button variant="outline">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                กลับไปหน้าประกาศ
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const typeInfo = typeConfig[announcement.type] || typeConfig.GENERAL;
    const hasAttachments = announcement.attachments && announcement.attachments.length > 0;

    return (
        <div className="container mx-auto py-6 space-y-6">
            {/* Back Button */}
            <Link href="/dashboard/announcements">
                <Button variant="ghost" className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    กลับ
                </Button>
            </Link>

            {/* Announcement Content */}
            <Card>
                <CardHeader className="space-y-4">
                    <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary" className={cn(typeInfo.color)}>
                            {typeInfo.label}
                        </Badge>
                        {announcement.priority === 'URGENT' && (
                            <Badge variant="destructive">เร่งด่วน</Badge>
                        )}
                        {announcement.priority === 'HIGH' && (
                            <Badge variant="outline" className="border-orange-500 text-orange-600">
                                สำคัญ
                            </Badge>
                        )}
                    </div>
                    <h1 className="text-2xl font-bold">{announcement.title}</h1>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {announcement.publishedAt
                                ? formatDate(announcement.publishedAt)
                                : formatDate(announcement.createdAt)}
                        </span>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Content */}
                    <div
                        className="prose prose-sm dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: announcement.content }}
                    />

                    {/* Attachments */}
                    {hasAttachments && (
                        <div className="border-t pt-6">
                            <h3 className="font-medium mb-3 flex items-center gap-2">
                                <Paperclip className="h-4 w-4" />
                                ไฟล์แนบ ({announcement.attachments?.length})
                            </h3>
                            <div className="space-y-2">
                                {announcement.attachments?.map((attachment: any, index: number) => (
                                    <a
                                        key={index}
                                        href={attachment.url || attachment}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 p-3 rounded-lg border hover:bg-muted transition-colors"
                                    >
                                        <Download className="h-4 w-4 text-muted-foreground" />
                                        <span className="flex-1 truncate">
                                            {attachment.name || `ไฟล์แนบ ${index + 1}`}
                                        </span>
                                        <Button variant="ghost" size="sm">
                                            ดาวน์โหลด
                                        </Button>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

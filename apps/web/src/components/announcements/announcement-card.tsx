'use client';

import Link from 'next/link';
import { Calendar, Paperclip, AlertTriangle, Info, Megaphone, BookOpen } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Announcement, AnnouncementType, Priority } from '@/lib/api/notifications';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

const typeConfig: Record<AnnouncementType, { label: string; icon: React.ReactNode; color: string }> = {
    GENERAL: { label: 'ทั่วไป', icon: <Info className="h-4 w-4" />, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
    ACADEMIC: { label: 'วิชาการ', icon: <BookOpen className="h-4 w-4" />, color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
    ACTIVITY: { label: 'กิจกรรม', icon: <Megaphone className="h-4 w-4" />, color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
    URGENT: { label: 'เร่งด่วน', icon: <AlertTriangle className="h-4 w-4" />, color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
};

const priorityConfig: Record<Priority, { label: string; color: string }> = {
    LOW: { label: 'ต่ำ', color: 'border-slate-300 dark:border-slate-600' },
    NORMAL: { label: 'ปกติ', color: 'border-slate-400 dark:border-slate-500' },
    HIGH: { label: 'สูง', color: 'border-orange-400 dark:border-orange-500' },
    URGENT: { label: 'เร่งด่วน', color: 'border-red-500 dark:border-red-400' },
};

interface AnnouncementCardProps {
    announcement: Announcement;
    showFullContent?: boolean;
}

export function AnnouncementCard({ announcement, showFullContent = false }: AnnouncementCardProps) {
    const typeInfo = typeConfig[announcement.type] || typeConfig.GENERAL;
    const priorityInfo = priorityConfig[announcement.priority] || priorityConfig.NORMAL;

    const formatDate = (dateStr: string) => {
        try {
            return format(new Date(dateStr), 'd MMM yyyy HH:mm น.', { locale: th });
        } catch {
            return dateStr;
        }
    };

    const hasAttachments = announcement.attachments && announcement.attachments.length > 0;

    return (
        <Card className={cn('transition-all hover:shadow-md', priorityInfo.color, 'border-l-4')}>
            <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary" className={cn('flex items-center gap-1', typeInfo.color)}>
                            {typeInfo.icon}
                            {typeInfo.label}
                        </Badge>
                        {announcement.priority === 'URGENT' && (
                            <Badge variant="destructive" className="animate-pulse">
                                เร่งด่วน
                            </Badge>
                        )}
                        {announcement.priority === 'HIGH' && (
                            <Badge variant="outline" className="border-orange-500 text-orange-600">
                                สำคัญ
                            </Badge>
                        )}
                    </div>
                    {hasAttachments && (
                        <Badge variant="outline" className="flex items-center gap-1">
                            <Paperclip className="h-3 w-3" />
                            {announcement.attachments?.length}
                        </Badge>
                    )}
                </div>
                <CardTitle className="text-lg mt-2">{announcement.title}</CardTitle>
                <CardDescription className="flex items-center gap-1 text-xs">
                    <Calendar className="h-3 w-3" />
                    {announcement.publishedAt ? formatDate(announcement.publishedAt) : formatDate(announcement.createdAt)}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {showFullContent ? (
                    <div
                        className="prose prose-sm dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: announcement.content }}
                    />
                ) : (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                        {announcement.content.replace(/<[^>]*>/g, '')}
                    </p>
                )}
            </CardContent>
            {!showFullContent && (
                <CardFooter className="pt-0">
                    <Link href={`/dashboard/announcements/${announcement.id}`}>
                        <Button variant="link" className="p-0 h-auto">
                            อ่านเพิ่มเติม →
                        </Button>
                    </Link>
                </CardFooter>
            )}
        </Card>
    );
}

export default AnnouncementCard;

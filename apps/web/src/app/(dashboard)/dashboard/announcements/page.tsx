'use client';

import { useState } from 'react';
import { Megaphone, Filter } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useAnnouncements } from '@/hooks/use-notifications';
import { AnnouncementCard } from '@/components/announcements/announcement-card';
import { AnnouncementType } from '@/lib/api/notifications';

const announcementTypes: { value: string; label: string }[] = [
    { value: 'all', label: 'ทุกประเภท' },
    { value: 'GENERAL', label: 'ทั่วไป' },
    { value: 'ACADEMIC', label: 'วิชาการ' },
    { value: 'ACTIVITY', label: 'กิจกรรม' },
    { value: 'URGENT', label: 'เร่งด่วน' },
];

export default function AnnouncementsPage() {
    const [filterType, setFilterType] = useState<string>('all');

    const params: any = {};
    if (filterType !== 'all') params.type = filterType as AnnouncementType;

    const { data, isLoading } = useAnnouncements(params);
    const announcements = data?.items ?? [];

    return (
        <div className="container mx-auto py-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Megaphone className="h-6 w-6" />
                    ประกาศโรงเรียน
                </h1>
                <p className="text-muted-foreground">
                    ข่าวสาร ประกาศ และกิจกรรมจากโรงเรียน
                </p>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">กรอง:</span>
                        </div>
                        <Select value={filterType} onValueChange={setFilterType}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="ประเภท" />
                            </SelectTrigger>
                            <SelectContent>
                                {announcementTypes.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                        {type.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Announcements List */}
            <div className="space-y-4">
                {isLoading ? (
                    // Loading skeleton
                    Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i}>
                            <CardContent className="p-6">
                                <div className="space-y-3">
                                    <div className="flex gap-2">
                                        <Skeleton className="h-6 w-20" />
                                        <Skeleton className="h-6 w-16" />
                                    </div>
                                    <Skeleton className="h-6 w-3/4" />
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-16 w-full" />
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : announcements.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <Megaphone className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                            <p className="text-lg font-medium">ไม่มีประกาศ</p>
                            <p className="text-muted-foreground">
                                {filterType !== 'all'
                                    ? 'ลองเปลี่ยนตัวกรองเพื่อดูประกาศอื่น'
                                    : 'เมื่อมีประกาศใหม่ จะแสดงที่นี่'}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    announcements.map((announcement) => (
                        <AnnouncementCard key={announcement.id} announcement={announcement} />
                    ))
                )}
            </div>
        </div>
    );
}

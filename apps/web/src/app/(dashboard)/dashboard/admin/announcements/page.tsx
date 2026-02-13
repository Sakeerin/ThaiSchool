'use client';

import { useState } from 'react';
import { Megaphone, Plus, Pencil, Trash2, Eye, EyeOff, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
    useAnnouncements,
    useDeleteAnnouncement,
    usePublishAnnouncement,
} from '@/hooks/use-notifications';
import { Announcement, AnnouncementType, Priority } from '@/lib/api/notifications';
import { AnnouncementForm } from './components/announcement-form';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

const typeConfig: Record<AnnouncementType, { label: string; color: string }> = {
    GENERAL: { label: 'ทั่วไป', color: 'bg-blue-100 text-blue-800' },
    ACADEMIC: { label: 'วิชาการ', color: 'bg-green-100 text-green-800' },
    ACTIVITY: { label: 'กิจกรรม', color: 'bg-purple-100 text-purple-800' },
    URGENT: { label: 'เร่งด่วน', color: 'bg-red-100 text-red-800' },
};

const priorityConfig: Record<Priority, { label: string; color: string }> = {
    LOW: { label: 'ต่ำ', color: 'text-slate-500' },
    NORMAL: { label: 'ปกติ', color: 'text-slate-600' },
    HIGH: { label: 'สูง', color: 'text-orange-600' },
    URGENT: { label: 'เร่งด่วน', color: 'text-red-600' },
};

export default function AdminAnnouncementsPage() {
    const [filterType, setFilterType] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const { toast } = useToast();

    const params: any = {};
    if (filterType !== 'all') params.type = filterType as AnnouncementType;

    const { data, isLoading, refetch } = useAnnouncements(params);
    const deleteAnnouncement = useDeleteAnnouncement();
    const publishAnnouncement = usePublishAnnouncement();

    // Filter by status client-side since API filters published only
    const allAnnouncements = data?.items ?? [];
    const announcements = filterStatus === 'all'
        ? allAnnouncements
        : filterStatus === 'published'
            ? allAnnouncements.filter((a) => a.isPublished)
            : allAnnouncements.filter((a) => !a.isPublished);

    const formatDate = (dateStr: string) => {
        try {
            return format(new Date(dateStr), 'd MMM yyyy HH:mm น.', { locale: th });
        } catch {
            return dateStr;
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteAnnouncement.mutateAsync(id);
            toast({
                title: 'สำเร็จ',
                description: 'ลบประกาศเรียบร้อยแล้ว',
            });
            setDeletingId(null);
        } catch (error) {
            toast({
                title: 'เกิดข้อผิดพลาด',
                description: 'ไม่สามารถลบประกาศได้',
                variant: 'destructive',
            });
        }
    };

    const handlePublish = async (id: string) => {
        try {
            await publishAnnouncement.mutateAsync(id);
            toast({
                title: 'สำเร็จ',
                description: 'เผยแพร่ประกาศเรียบร้อยแล้ว',
            });
        } catch (error) {
            toast({
                title: 'เกิดข้อผิดพลาด',
                description: 'ไม่สามารถเผยแพร่ประกาศได้',
                variant: 'destructive',
            });
        }
    };

    const handleFormSuccess = () => {
        setIsCreateDialogOpen(false);
        setEditingAnnouncement(null);
        refetch();
    };

    return (
        <div className="container mx-auto py-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Megaphone className="h-6 w-6" />
                        จัดการประกาศ
                    </h1>
                    <p className="text-muted-foreground">
                        สร้าง แก้ไข และเผยแพร่ประกาศโรงเรียน
                    </p>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            สร้างประกาศใหม่
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>สร้างประกาศใหม่</DialogTitle>
                        </DialogHeader>
                        <AnnouncementForm onSuccess={handleFormSuccess} />
                    </DialogContent>
                </Dialog>
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
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="ประเภท" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">ทุกประเภท</SelectItem>
                                <SelectItem value="GENERAL">ทั่วไป</SelectItem>
                                <SelectItem value="ACADEMIC">วิชาการ</SelectItem>
                                <SelectItem value="ACTIVITY">กิจกรรม</SelectItem>
                                <SelectItem value="URGENT">เร่งด่วน</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="สถานะ" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">ทั้งหมด</SelectItem>
                                <SelectItem value="published">เผยแพร่แล้ว</SelectItem>
                                <SelectItem value="draft">ฉบับร่าง</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Announcements List */}
            <div className="space-y-3">
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i}>
                            <CardContent className="p-4">
                                <div className="flex items-start gap-4">
                                    <Skeleton className="h-6 w-20" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-5 w-3/4" />
                                        <Skeleton className="h-4 w-1/2" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : announcements.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <Megaphone className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                            <p className="text-lg font-medium">ไม่มีประกาศ</p>
                            <p className="text-muted-foreground mb-4">
                                เริ่มสร้างประกาศใหม่เพื่อแจ้งข่าวสารให้ผู้ใช้งาน
                            </p>
                            <Button onClick={() => setIsCreateDialogOpen(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                สร้างประกาศใหม่
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    announcements.map((announcement) => {
                        const typeInfo = typeConfig[announcement.type] || typeConfig.GENERAL;
                        const priorityInfo = priorityConfig[announcement.priority] || priorityConfig.NORMAL;

                        return (
                            <Card key={announcement.id}>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap mb-2">
                                                <Badge variant="secondary" className={cn(typeInfo.color)}>
                                                    {typeInfo.label}
                                                </Badge>
                                                <Badge
                                                    variant={announcement.isPublished ? 'default' : 'outline'}
                                                    className={announcement.isPublished ? '' : 'text-muted-foreground'}
                                                >
                                                    {announcement.isPublished ? (
                                                        <>
                                                            <Eye className="h-3 w-3 mr-1" />
                                                            เผยแพร่แล้ว
                                                        </>
                                                    ) : (
                                                        <>
                                                            <EyeOff className="h-3 w-3 mr-1" />
                                                            ฉบับร่าง
                                                        </>
                                                    )}
                                                </Badge>
                                                {announcement.priority !== 'NORMAL' && (
                                                    <span className={cn('text-xs font-medium', priorityInfo.color)}>
                                                        ความสำคัญ: {priorityInfo.label}
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="font-medium line-clamp-1">{announcement.title}</h3>
                                            <p className="text-sm text-muted-foreground line-clamp-1">
                                                {announcement.content.replace(/<[^>]*>/g, '')}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {announcement.publishedAt
                                                    ? `เผยแพร่: ${formatDate(announcement.publishedAt)}`
                                                    : `สร้างเมื่อ: ${formatDate(announcement.createdAt)}`}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {!announcement.isPublished && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handlePublish(announcement.id)}
                                                    disabled={publishAnnouncement.isPending}
                                                >
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    เผยแพร่
                                                </Button>
                                            )}
                                            <Dialog
                                                open={editingAnnouncement?.id === announcement.id}
                                                onOpenChange={(open) => !open && setEditingAnnouncement(null)}
                                            >
                                                <DialogTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => setEditingAnnouncement(announcement)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                                    <DialogHeader>
                                                        <DialogTitle>แก้ไขประกาศ</DialogTitle>
                                                    </DialogHeader>
                                                    <AnnouncementForm
                                                        announcement={editingAnnouncement!}
                                                        onSuccess={handleFormSuccess}
                                                    />
                                                </DialogContent>
                                            </Dialog>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => setDeletingId(announcement.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                            <ConfirmDialog
                                                open={deletingId === announcement.id}
                                                onOpenChange={(open) => !open && setDeletingId(null)}
                                                title="ยืนยันการลบ"
                                                description={`คุณต้องการลบประกาศ "${announcement.title}" หรือไม่?`}
                                                confirmText="ลบ"
                                                onConfirm={() => handleDelete(announcement.id)}
                                            />
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

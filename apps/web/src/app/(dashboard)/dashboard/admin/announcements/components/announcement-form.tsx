'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import {
    useCreateAnnouncement,
    useUpdateAnnouncement,
} from '@/hooks/use-notifications';
import { Announcement, AnnouncementType, Priority, CreateAnnouncementDto, UpdateAnnouncementDto } from '@/lib/api/notifications';
import { useToast } from '@/hooks/use-toast';

interface AnnouncementFormProps {
    announcement?: Announcement;
    onSuccess?: () => void;
}

const typeOptions: { value: AnnouncementType; label: string }[] = [
    { value: 'GENERAL', label: 'ทั่วไป' },
    { value: 'ACADEMIC', label: 'วิชาการ' },
    { value: 'ACTIVITY', label: 'กิจกรรม' },
    { value: 'URGENT', label: 'เร่งด่วน' },
];

const priorityOptions: { value: Priority; label: string }[] = [
    { value: 'LOW', label: 'ต่ำ' },
    { value: 'NORMAL', label: 'ปกติ' },
    { value: 'HIGH', label: 'สูง' },
    { value: 'URGENT', label: 'เร่งด่วน' },
];

export function AnnouncementForm({ announcement, onSuccess }: AnnouncementFormProps) {
    const isEditing = !!announcement;
    const { toast } = useToast();

    const [type, setType] = useState<AnnouncementType>(announcement?.type || 'GENERAL');
    const [priority, setPriority] = useState<Priority>(announcement?.priority || 'NORMAL');
    const [content, setContent] = useState(announcement?.content || '');
    const [isPublished, setIsPublished] = useState(announcement?.isPublished || false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            title: announcement?.title || '',
        },
    });

    const createAnnouncement = useCreateAnnouncement();
    const updateAnnouncement = useUpdateAnnouncement();

    const isLoading = createAnnouncement.isPending || updateAnnouncement.isPending;

    const onSubmit = async (data: { title: string }) => {
        try {
            if (isEditing) {
                const dto: UpdateAnnouncementDto = {
                    title: data.title,
                    content,
                    type,
                    priority,
                    isPublished,
                };
                await updateAnnouncement.mutateAsync({ id: announcement.id, dto });
                toast({
                    title: 'สำเร็จ',
                    description: 'อัพเดตประกาศเรียบร้อยแล้ว',
                });
            } else {
                const dto: CreateAnnouncementDto = {
                    title: data.title,
                    content,
                    type,
                    priority,
                    isPublished,
                };
                await createAnnouncement.mutateAsync(dto);
                toast({
                    title: 'สำเร็จ',
                    description: isPublished ? 'สร้างและเผยแพร่ประกาศเรียบร้อยแล้ว' : 'บันทึกฉบับร่างเรียบร้อยแล้ว',
                });
            }
            onSuccess?.();
        } catch (error) {
            toast({
                title: 'เกิดข้อผิดพลาด',
                description: 'ไม่สามารถบันทึกประกาศได้',
                variant: 'destructive',
            });
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
                <Label htmlFor="title">หัวข้อ *</Label>
                <Input
                    id="title"
                    placeholder="กรอกหัวข้อประกาศ"
                    {...register('title', { required: 'กรุณากรอกหัวข้อ' })}
                />
                {errors.title && (
                    <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
            </div>

            {/* Type and Priority */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>ประเภท</Label>
                    <Select value={type} onValueChange={(v) => setType(v as AnnouncementType)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {typeOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>ความสำคัญ</Label>
                    <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {priorityOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Content */}
            <div className="space-y-2">
                <Label>เนื้อหา *</Label>
                <RichTextEditor
                    content={content}
                    onChange={setContent}
                    placeholder="เขียนเนื้อหาประกาศที่นี่..."
                />
            </div>

            {/* Publish Toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                    <p className="font-medium">เผยแพร่ทันที</p>
                    <p className="text-sm text-muted-foreground">
                        เปิดเพื่อเผยแพร่ประกาศให้ผู้ใช้เห็นทันที
                    </p>
                </div>
                <Switch checked={isPublished} onCheckedChange={setIsPublished} />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
                <Button type="submit" disabled={isLoading || !content.trim()}>
                    {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {isEditing ? 'บันทึกการเปลี่ยนแปลง' : isPublished ? 'เผยแพร่' : 'บันทึกฉบับร่าง'}
                </Button>
            </div>
        </form>
    );
}

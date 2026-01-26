// Content Form Component - Add/Edit lesson content

'use client';

import { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { FileUploader, FilePreview } from '@/components/ui/file-uploader';
import { ContentTypeCard } from '@/components/ui/content-renderer';
import { useAddContent, useUpdateContent } from '@/hooks/use-lessons';
import { LessonContent, ContentType, CreateLessonContentDto, UpdateLessonContentDto } from '@/lib/api/lessons';
import { UploadedFile } from '@/lib/api/upload';
import { Loader2, ArrowLeft } from 'lucide-react';

interface ContentFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    lessonId: string;
    content?: LessonContent | null;
    onSuccess?: () => void;
}

const contentTypes: ContentType[] = ['TEXT', 'VIDEO', 'PDF', 'AUDIO', 'LINK'];

export function ContentForm({ open, onOpenChange, lessonId, content, onSuccess }: ContentFormProps) {
    const [step, setStep] = useState<'type' | 'content'>(content ? 'content' : 'type');
    const [type, setType] = useState<ContentType>('TEXT');
    const [title, setTitle] = useState('');
    const [textContent, setTextContent] = useState('');
    const [linkUrl, setLinkUrl] = useState('');
    const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);

    const addMutation = useAddContent();
    const updateMutation = useUpdateContent();

    const isEditing = !!content;
    const isPending = addMutation.isPending || updateMutation.isPending;

    useEffect(() => {
        if (open) {
            if (content) {
                setStep('content');
                setType(content.type);
                setTitle(content.title);
                setTextContent(content.content || '');
                setLinkUrl(content.fileUrl || content.content || '');
                if (content.fileUrl) {
                    setUploadedFile({
                        key: '',
                        url: content.fileUrl,
                        originalName: content.title,
                        mimeType: getMimeTypeFromContentType(content.type),
                        size: content.fileSize || 0,
                    });
                }
            } else {
                setStep('type');
                setType('TEXT');
                setTitle('');
                setTextContent('');
                setLinkUrl('');
                setUploadedFile(null);
            }
        }
    }, [open, content]);

    const handleTypeSelect = (selectedType: ContentType) => {
        setType(selectedType);
        setStep('content');
    };

    const handleFileUpload = (file: UploadedFile) => {
        setUploadedFile(file);
        if (!title) {
            // Use filename as title
            setTitle(file.originalName.replace(/\.[^/.]+$/, ''));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (isEditing) {
                const dto: UpdateLessonContentDto = {
                    title,
                    content: type === 'TEXT' ? textContent : type === 'LINK' ? linkUrl : undefined,
                    fileUrl: type !== 'TEXT' && type !== 'LINK' ? uploadedFile?.url : type === 'LINK' ? linkUrl : undefined,
                };
                await updateMutation.mutateAsync({
                    contentId: content.id,
                    dto,
                    lessonId,
                });
            } else {
                const dto: CreateLessonContentDto = {
                    lessonId,
                    type,
                    title,
                    content: type === 'TEXT' ? textContent : type === 'LINK' ? linkUrl : undefined,
                    fileUrl: type !== 'TEXT' && type !== 'LINK' ? uploadedFile?.url : type === 'LINK' ? linkUrl : undefined,
                    fileSize: uploadedFile?.size,
                };
                await addMutation.mutateAsync(dto);
            }

            onOpenChange(false);
            onSuccess?.();
        } catch (error) {
            console.error('Failed to save content:', error);
        }
    };

    const canSubmit = () => {
        if (!title) return false;
        if (type === 'TEXT' && !textContent) return false;
        if (type === 'LINK' && !linkUrl) return false;
        if (['VIDEO', 'PDF', 'AUDIO'].includes(type) && !uploadedFile) return false;
        return true;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                {step === 'type' ? (
                    <>
                        <DialogHeader>
                            <DialogTitle>เลือกประเภทเนื้อหา</DialogTitle>
                            <DialogDescription>
                                เลือกประเภทเนื้อหาที่ต้องการเพิ่มในบทเรียน
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-3 gap-4 py-4">
                            {contentTypes.map((t) => (
                                <ContentTypeCard
                                    key={t}
                                    type={t}
                                    onClick={() => handleTypeSelect(t)}
                                />
                            ))}
                        </div>
                    </>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <div className="flex items-center gap-2">
                                {!isEditing && (
                                    <button
                                        type="button"
                                        onClick={() => setStep('type')}
                                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                    </button>
                                )}
                                <DialogTitle>
                                    {isEditing ? 'แก้ไขเนื้อหา' : `เพิ่มเนื้อหา: ${getContentTypeLabel(type)}`}
                                </DialogTitle>
                            </div>
                            <DialogDescription>
                                กรอกข้อมูลเนื้อหาที่ต้องการ
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                            <div className="grid gap-2">
                                <Label htmlFor="title">ชื่อเนื้อหา *</Label>
                                <Input
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="เช่น บทนำ, วิดีโอประกอบ"
                                    required
                                />
                            </div>

                            {type === 'TEXT' && (
                                <div className="grid gap-2">
                                    <Label>เนื้อหา *</Label>
                                    <RichTextEditor
                                        content={textContent}
                                        onChange={setTextContent}
                                        placeholder="พิมพ์เนื้อหาที่นี่..."
                                    />
                                </div>
                            )}

                            {type === 'LINK' && (
                                <div className="grid gap-2">
                                    <Label htmlFor="url">URL *</Label>
                                    <Input
                                        id="url"
                                        type="url"
                                        value={linkUrl}
                                        onChange={(e) => setLinkUrl(e.target.value)}
                                        placeholder="https://example.com"
                                        required
                                    />
                                </div>
                            )}

                            {['VIDEO', 'PDF', 'AUDIO'].includes(type) && (
                                <div className="grid gap-2">
                                    <Label>อัปโหลดไฟล์ *</Label>
                                    {uploadedFile ? (
                                        <FilePreview
                                            file={uploadedFile}
                                            onRemove={() => setUploadedFile(null)}
                                        />
                                    ) : (
                                        <FileUploader
                                            onUpload={handleFileUpload}
                                            accept={getAcceptedTypes(type)}
                                            folder="lessons"
                                        />
                                    )}
                                </div>
                            )}
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isPending}
                            >
                                ยกเลิก
                            </Button>
                            <Button type="submit" disabled={isPending || !canSubmit()}>
                                {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                {isEditing ? 'บันทึก' : 'เพิ่มเนื้อหา'}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}

function getContentTypeLabel(type: ContentType): string {
    const labels: Record<ContentType, string> = {
        TEXT: 'ข้อความ',
        VIDEO: 'วิดีโอ',
        PDF: 'PDF',
        AUDIO: 'เสียง',
        LINK: 'ลิงก์',
        SLIDE: 'สไลด์',
        QUIZ: 'แบบทดสอบ',
    };
    return labels[type] || type;
}

function getMimeTypeFromContentType(type: ContentType): string {
    const mimeTypes: Record<ContentType, string> = {
        VIDEO: 'video/mp4',
        PDF: 'application/pdf',
        AUDIO: 'audio/mpeg',
        TEXT: 'text/html',
        LINK: 'text/plain',
        SLIDE: 'application/pdf',
        QUIZ: 'application/json',
    };
    return mimeTypes[type] || 'application/octet-stream';
}

function getAcceptedTypes(type: ContentType): Record<string, string[]> {
    switch (type) {
        case 'VIDEO':
            return { 'video/*': ['.mp4', '.webm', '.ogg'] };
        case 'PDF':
            return { 'application/pdf': ['.pdf'] };
        case 'AUDIO':
            return { 'audio/*': ['.mp3', '.wav', '.ogg'] };
        default:
            return {};
    }
}

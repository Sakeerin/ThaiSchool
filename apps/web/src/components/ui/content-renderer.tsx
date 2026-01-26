// Content Renderer Component - Displays lesson content based on type

'use client';

import { useState } from 'react';
import { Play, Pause, Volume2, VolumeX, ExternalLink, FileText, Video, Music, Type } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RichTextViewer } from './rich-text-editor';
import { ContentType, LessonContent } from '@/lib/api/lessons';

interface ContentRendererProps {
    content: LessonContent;
    className?: string;
}

export function ContentRenderer({ content, className }: ContentRendererProps) {
    switch (content.type) {
        case 'TEXT':
            return <TextContent content={content} className={className} />;
        case 'VIDEO':
            return <VideoContent content={content} className={className} />;
        case 'PDF':
            return <PdfContent content={content} className={className} />;
        case 'AUDIO':
            return <AudioContent content={content} className={className} />;
        case 'LINK':
            return <LinkContent content={content} className={className} />;
        default:
            return (
                <div className={cn('p-4 bg-gray-100 dark:bg-gray-800 rounded-lg', className)}>
                    <p className="text-gray-500">ไม่รองรับประเภทเนื้อหานี้</p>
                </div>
            );
    }
}

// Text Content
function TextContent({ content, className }: ContentRendererProps) {
    return (
        <div className={cn('bg-white dark:bg-gray-900 rounded-lg p-6', className)}>
            <RichTextViewer content={content.content || ''} />
        </div>
    );
}

// Video Content
function VideoContent({ content, className }: ContentRendererProps) {
    const [isPlaying, setIsPlaying] = useState(false);

    if (!content.fileUrl) {
        return (
            <div className={cn('p-4 bg-gray-100 dark:bg-gray-800 rounded-lg', className)}>
                <p className="text-gray-500">ไม่พบไฟล์วิดีโอ</p>
            </div>
        );
    }

    return (
        <div className={cn('rounded-lg overflow-hidden bg-black', className)}>
            <video
                src={content.fileUrl}
                controls
                className="w-full aspect-video"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
            >
                เบราว์เซอร์ของคุณไม่รองรับวิดีโอ
            </video>
            {content.duration && (
                <div className="p-2 bg-gray-900 text-gray-300 text-sm">
                    ความยาว: {formatDuration(content.duration)}
                </div>
            )}
        </div>
    );
}

// PDF Content
function PdfContent({ content, className }: ContentRendererProps) {
    if (!content.fileUrl) {
        return (
            <div className={cn('p-4 bg-gray-100 dark:bg-gray-800 rounded-lg', className)}>
                <p className="text-gray-500">ไม่พบไฟล์ PDF</p>
            </div>
        );
    }

    return (
        <div className={cn('rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700', className)}>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-red-500" />
                    <span className="font-medium text-gray-900 dark:text-white">{content.title}</span>
                </div>
                <a
                    href={content.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                >
                    เปิดในแท็บใหม่
                    <ExternalLink className="w-4 h-4" />
                </a>
            </div>
            <iframe
                src={content.fileUrl}
                className="w-full h-[600px] bg-white"
                title={content.title}
            />
        </div>
    );
}

// Audio Content
function AudioContent({ content, className }: ContentRendererProps) {
    if (!content.fileUrl) {
        return (
            <div className={cn('p-4 bg-gray-100 dark:bg-gray-800 rounded-lg', className)}>
                <p className="text-gray-500">ไม่พบไฟล์เสียง</p>
            </div>
        );
    }

    return (
        <div className={cn('rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 p-6', className)}>
            <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                    <Music className="w-8 h-8 text-white" />
                </div>
                <div className="text-white">
                    <h4 className="font-medium">{content.title}</h4>
                    {content.duration && (
                        <p className="text-sm text-white/80">{formatDuration(content.duration)}</p>
                    )}
                </div>
            </div>
            <audio src={content.fileUrl} controls className="w-full">
                เบราว์เซอร์ของคุณไม่รองรับไฟล์เสียง
            </audio>
        </div>
    );
}

// Link Content
function LinkContent({ content, className }: ContentRendererProps) {
    return (
        <a
            href={content.fileUrl || content.content || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
                'flex items-center gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
                className
            )}
        >
            <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <ExternalLink className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 dark:text-white">{content.title}</h4>
                <p className="text-sm text-gray-500 truncate">
                    {content.fileUrl || content.content}
                </p>
            </div>
        </a>
    );
}

// Utility function
function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Content type card for selection
interface ContentTypeCardProps {
    type: ContentType;
    selected?: boolean;
    onClick?: () => void;
}

const contentTypeInfo: Record<ContentType, { icon: React.ComponentType<{ className?: string }>; label: string; description: string; color: string }> = {
    TEXT: { icon: Type, label: 'ข้อความ', description: 'เนื้อหาแบบ Rich Text', color: 'blue' },
    VIDEO: { icon: Video, label: 'วิดีโอ', description: 'ไฟล์วิดีโอ MP4, WebM', color: 'red' },
    PDF: { icon: FileText, label: 'PDF', description: 'เอกสาร PDF', color: 'orange' },
    AUDIO: { icon: Music, label: 'เสียง', description: 'ไฟล์เสียง MP3, WAV', color: 'purple' },
    LINK: { icon: ExternalLink, label: 'ลิงก์', description: 'ลิงก์ภายนอก', color: 'green' },
    SLIDE: { icon: FileText, label: 'สไลด์', description: 'งานนำเสนอ', color: 'yellow' },
    QUIZ: { icon: FileText, label: 'แบบทดสอบ', description: 'แบบทดสอบสั้น', color: 'pink' },
};

export function ContentTypeCard({ type, selected, onClick }: ContentTypeCardProps) {
    const info = contentTypeInfo[type];
    if (!info) return null;

    const Icon = info.icon;

    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all hover:shadow-md',
                selected
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
            )}
        >
            <div className={cn(
                'w-12 h-12 rounded-lg flex items-center justify-center',
                `bg-${info.color}-100 dark:bg-${info.color}-900/30`
            )}>
                <Icon className={cn('w-6 h-6', `text-${info.color}-600 dark:text-${info.color}-400`)} />
            </div>
            <div className="text-center">
                <p className="font-medium text-gray-900 dark:text-white">{info.label}</p>
                <p className="text-xs text-gray-500">{info.description}</p>
            </div>
        </button>
    );
}

export default ContentRenderer;

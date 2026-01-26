// File Uploader Component - Drag and drop with progress

'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, File, Video, FileText, Music, Image as ImageIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { uploadApi, UploadedFile, UploadProgress } from '@/lib/api/upload';

interface FileUploaderProps {
    onUpload?: (file: UploadedFile) => void;
    onError?: (error: string) => void;
    accept?: Record<string, string[]>;
    maxSize?: number; // in bytes
    folder?: string;
    className?: string;
    disabled?: boolean;
}

const defaultAccept = {
    'video/*': ['.mp4', '.webm', '.ogg'],
    'audio/*': ['.mp3', '.wav', '.ogg'],
    'application/pdf': ['.pdf'],
    'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
};

const fileTypeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    video: Video,
    audio: Music,
    application: FileText,
    image: ImageIcon,
    default: File,
};

function getFileIcon(mimeType: string) {
    const type = mimeType.split('/')[0];
    return fileTypeIcons[type] || fileTypeIcons.default;
}

function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function FileUploader({
    onUpload,
    onError,
    accept = defaultAccept,
    maxSize = 100 * 1024 * 1024, // 100MB
    folder = 'lessons',
    className,
    disabled = false,
}: FileUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState<UploadProgress | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const onDrop = useCallback(
        async (acceptedFiles: File[]) => {
            if (acceptedFiles.length === 0) return;

            const file = acceptedFiles[0];

            if (file.size > maxSize) {
                onError?.(`ไฟล์มีขนาดใหญ่เกินไป (สูงสุด ${formatFileSize(maxSize)})`);
                return;
            }

            setSelectedFile(file);
            setUploading(true);
            setProgress({ loaded: 0, total: file.size, percent: 0 });

            try {
                const result = await uploadApi.uploadFile(file, folder, (p) => {
                    setProgress(p);
                });
                onUpload?.(result);
                setSelectedFile(null);
            } catch (error: any) {
                onError?.(error.response?.data?.message || 'เกิดข้อผิดพลาดในการอัปโหลด');
            } finally {
                setUploading(false);
                setProgress(null);
            }
        },
        [folder, maxSize, onError, onUpload]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept,
        maxFiles: 1,
        disabled: disabled || uploading,
    });

    const cancelUpload = () => {
        setSelectedFile(null);
        setUploading(false);
        setProgress(null);
    };

    const FileIcon = selectedFile ? getFileIcon(selectedFile.type) : File;

    return (
        <div className={cn('w-full', className)}>
            <div
                {...getRootProps()}
                className={cn(
                    'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
                    isDragActive
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500',
                    (disabled || uploading) && 'opacity-50 cursor-not-allowed'
                )}
            >
                <input {...getInputProps()} />

                {uploading && selectedFile ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-center gap-3">
                            <FileIcon className="w-8 h-8 text-blue-600" />
                            <div className="text-left">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[200px]">
                                    {selectedFile.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {formatFileSize(selectedFile.size)}
                                </p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${progress?.percent || 0}%` }}
                                />
                            </div>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>กำลังอัปโหลด...</span>
                                <span>{progress?.percent || 0}%</span>
                            </div>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                cancelUpload();
                            }}
                        >
                            <X className="w-4 h-4 mr-1" />
                            ยกเลิก
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="w-12 h-12 mx-auto rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            <Upload className="w-6 h-6 text-gray-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                ลากไฟล์มาวางที่นี่
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                หรือคลิกเพื่อเลือกไฟล์ (สูงสุด {formatFileSize(maxSize)})
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Compact file preview component
interface FilePreviewProps {
    file: UploadedFile | { url: string; originalName: string; mimeType: string; size: number };
    onRemove?: () => void;
}

export function FilePreview({ file, onRemove }: FilePreviewProps) {
    const FileIcon = getFileIcon(file.mimeType);
    const isImage = file.mimeType.startsWith('image/');
    const isVideo = file.mimeType.startsWith('video/');

    return (
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            {isImage ? (
                <img
                    src={file.url}
                    alt={file.originalName}
                    className="w-12 h-12 object-cover rounded"
                />
            ) : isVideo ? (
                <video
                    src={file.url}
                    className="w-12 h-12 object-cover rounded"
                />
            ) : (
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                    <FileIcon className="w-6 h-6 text-gray-500" />
                </div>
            )}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {file.originalName}
                </p>
                <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
            </div>
            {onRemove && (
                <button
                    type="button"
                    onClick={onRemove}
                    className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 hover:text-red-600"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </div>
    );
}

export default FileUploader;

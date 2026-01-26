// Upload Service - MinIO/S3 file management

import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
    GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { UploadedFile, FileValidationResult } from './dto';

@Injectable()
export class UploadService {
    private readonly logger = new Logger(UploadService.name);
    private readonly s3Client: S3Client;
    private readonly bucket: string;
    private readonly endpoint: string;

    // Allowed file types by category
    private readonly allowedTypes = {
        image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        video: ['video/mp4', 'video/webm', 'video/ogg'],
        audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm'],
        document: ['application/pdf'],
    };

    // Max file sizes in bytes
    private readonly maxSizes = {
        image: 10 * 1024 * 1024,     // 10MB
        video: 100 * 1024 * 1024,    // 100MB
        audio: 50 * 1024 * 1024,     // 50MB
        document: 20 * 1024 * 1024,  // 20MB
    };

    constructor(private readonly configService: ConfigService) {
        this.endpoint = this.configService.get('MINIO_ENDPOINT', 'http://localhost:9000');
        this.bucket = this.configService.get('MINIO_BUCKET', 'school-lms');

        this.s3Client = new S3Client({
            endpoint: this.endpoint,
            region: this.configService.get('MINIO_REGION', 'us-east-1'),
            credentials: {
                accessKeyId: this.configService.get('MINIO_ACCESS_KEY', 'minioadmin'),
                secretAccessKey: this.configService.get('MINIO_SECRET_KEY', 'minioadmin'),
            },
            forcePathStyle: true, // Required for MinIO
        });
    }

    /**
     * Validate file type and size
     */
    validateFile(file: Express.Multer.File): FileValidationResult {
        const category = this.getFileCategory(file.mimetype);

        if (!category) {
            return {
                valid: false,
                error: `ไม่รองรับไฟล์ประเภท ${file.mimetype}`,
            };
        }

        const maxSize = this.maxSizes[category];
        if (file.size > maxSize) {
            const maxSizeMB = maxSize / (1024 * 1024);
            return {
                valid: false,
                error: `ไฟล์มีขนาดใหญ่เกินไป (สูงสุด ${maxSizeMB}MB)`,
            };
        }

        return { valid: true };
    }

    /**
     * Get file category based on mime type
     */
    private getFileCategory(mimeType: string): 'image' | 'video' | 'audio' | 'document' | null {
        for (const [category, types] of Object.entries(this.allowedTypes)) {
            if (types.includes(mimeType)) {
                return category as 'image' | 'video' | 'audio' | 'document';
            }
        }
        return null;
    }

    /**
     * Generate unique file key
     */
    private generateFileKey(originalName: string, folder?: string): string {
        const ext = path.extname(originalName);
        const uuid = uuidv4();
        const timestamp = Date.now();
        const key = `${timestamp}-${uuid}${ext}`;

        if (folder) {
            return `${folder}/${key}`;
        }
        return key;
    }

    /**
     * Upload file to MinIO/S3
     */
    async uploadFile(
        file: Express.Multer.File,
        folder?: string,
    ): Promise<UploadedFile> {
        // Validate file
        const validation = this.validateFile(file);
        if (!validation.valid) {
            throw new BadRequestException(validation.error);
        }

        const key = this.generateFileKey(file.originalname, folder);

        try {
            const command = new PutObjectCommand({
                Bucket: this.bucket,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
                ContentLength: file.size,
            });

            await this.s3Client.send(command);

            const url = this.getPublicUrl(key);

            this.logger.log(`File uploaded: ${key}`);

            return {
                key,
                url,
                originalName: file.originalname,
                mimeType: file.mimetype,
                size: file.size,
            };
        } catch (error) {
            this.logger.error(`Failed to upload file: ${error.message}`);
            throw new BadRequestException('ไม่สามารถอัปโหลดไฟล์ได้');
        }
    }

    /**
     * Upload multiple files
     */
    async uploadFiles(
        files: Express.Multer.File[],
        folder?: string,
    ): Promise<UploadedFile[]> {
        return Promise.all(files.map((file) => this.uploadFile(file, folder)));
    }

    /**
     * Delete file from MinIO/S3
     */
    async deleteFile(key: string): Promise<void> {
        try {
            const command = new DeleteObjectCommand({
                Bucket: this.bucket,
                Key: key,
            });

            await this.s3Client.send(command);
            this.logger.log(`File deleted: ${key}`);
        } catch (error) {
            this.logger.error(`Failed to delete file: ${error.message}`);
            throw new BadRequestException('ไม่สามารถลบไฟล์ได้');
        }
    }

    /**
     * Get signed URL for private files (expires in 1 hour)
     */
    async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
        const command = new GetObjectCommand({
            Bucket: this.bucket,
            Key: key,
        });

        return getSignedUrl(this.s3Client, command, { expiresIn });
    }

    /**
     * Get public URL for file
     */
    getPublicUrl(key: string): string {
        return `${this.endpoint}/${this.bucket}/${key}`;
    }

    /**
     * Get content type for lesson content
     */
    getContentType(mimeType: string): 'VIDEO' | 'PDF' | 'AUDIO' | 'TEXT' | null {
        const category = this.getFileCategory(mimeType);
        switch (category) {
            case 'video':
                return 'VIDEO';
            case 'document':
                return 'PDF';
            case 'audio':
                return 'AUDIO';
            default:
                return null;
        }
    }
}

// Upload DTOs

import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UploadFileDto {
    @IsString()
    @IsOptional()
    folder?: string;
}

export interface UploadedFile {
    key: string;
    url: string;
    originalName: string;
    mimeType: string;
    size: number;
}

export interface FileValidationResult {
    valid: boolean;
    error?: string;
}

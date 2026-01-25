// Notifications DTOs

import { IsString, IsOptional, IsNotEmpty, IsEnum, IsBoolean, IsArray } from 'class-validator';
import { NotificationType, AnnouncementType, Priority, UserRole } from '@school/database';

export class CreateNotificationDto {
    @IsString()
    @IsNotEmpty()
    userId: string;

    @IsEnum(NotificationType)
    type: NotificationType;

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    content: string;

    @IsString()
    @IsOptional()
    link?: string;

    @IsOptional()
    data?: any;
}

export class CreateAnnouncementDto {
    @IsString()
    @IsNotEmpty({ message: 'กรุณากรอกหัวข้อ' })
    title: string;

    @IsString()
    @IsNotEmpty({ message: 'กรุณากรอกเนื้อหา' })
    content: string;

    @IsEnum(AnnouncementType)
    type: AnnouncementType;

    @IsEnum(Priority)
    @IsOptional()
    priority?: Priority;

    @IsArray()
    @IsOptional()
    targetRoles?: UserRole[];

    @IsArray()
    @IsOptional()
    targetGradeLevels?: string[];

    @IsArray()
    @IsOptional()
    targetClassrooms?: string[];

    @IsOptional()
    attachments?: any[];

    @IsBoolean()
    @IsOptional()
    isPublished?: boolean;
}

export class UpdateAnnouncementDto {
    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    content?: string;

    @IsEnum(AnnouncementType)
    @IsOptional()
    type?: AnnouncementType;

    @IsEnum(Priority)
    @IsOptional()
    priority?: Priority;

    @IsBoolean()
    @IsOptional()
    isPublished?: boolean;
}

export class NotificationQueryDto {
    @IsOptional()
    page?: number;

    @IsOptional()
    limit?: number;

    @IsBoolean()
    @IsOptional()
    isRead?: boolean;

    @IsEnum(NotificationType)
    @IsOptional()
    type?: NotificationType;
}

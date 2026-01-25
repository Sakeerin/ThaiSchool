// Lessons DTOs

import { IsString, IsOptional, IsNotEmpty, IsInt, IsBoolean, IsEnum, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { ContentType } from '@school/database';

export class CreateLessonDto {
    @IsString()
    @IsNotEmpty({ message: 'กรุณาเลือกรายวิชา' })
    subjectInstanceId: string;

    @IsString()
    @IsNotEmpty({ message: 'กรุณากรอกชื่อบทเรียน' })
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @Type(() => Number)
    @IsInt()
    @IsOptional()
    order?: number;
}

export class UpdateLessonDto {
    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @Type(() => Number)
    @IsInt()
    @IsOptional()
    order?: number;

    @IsBoolean()
    @IsOptional()
    isPublished?: boolean;
}

export class CreateLessonContentDto {
    @IsString()
    @IsNotEmpty()
    lessonId: string;

    @IsEnum(ContentType, { message: 'ประเภทเนื้อหาไม่ถูกต้อง' })
    type: ContentType;

    @IsString()
    @IsNotEmpty({ message: 'กรุณากรอกชื่อเนื้อหา' })
    title: string;

    @IsString()
    @IsOptional()
    content?: string;

    @IsString()
    @IsOptional()
    fileUrl?: string;

    @Type(() => Number)
    @IsInt()
    @IsOptional()
    fileSize?: number;

    @Type(() => Number)
    @IsInt()
    @IsOptional()
    duration?: number;

    @Type(() => Number)
    @IsInt()
    @IsOptional()
    order?: number;
}

export class UpdateLessonContentDto {
    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    content?: string;

    @IsString()
    @IsOptional()
    fileUrl?: string;

    @Type(() => Number)
    @IsInt()
    @IsOptional()
    order?: number;
}

export class LessonQueryDto {
    @IsOptional()
    page?: number;

    @IsOptional()
    limit?: number;

    @IsString()
    @IsOptional()
    subjectInstanceId?: string;

    @IsBoolean()
    @IsOptional()
    isPublished?: boolean;

    @IsString()
    @IsOptional()
    search?: string;
}

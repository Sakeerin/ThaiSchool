// Assignments DTOs

import { IsString, IsOptional, IsNotEmpty, IsNumber, IsBoolean, IsEnum, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { AssignmentType, SubmissionStatus } from '@school/database';

export class CreateAssignmentDto {
    @IsString()
    @IsNotEmpty({ message: 'กรุณาเลือกรายวิชา' })
    subjectInstanceId: string;

    @IsString()
    @IsNotEmpty({ message: 'กรุณากรอกชื่องาน' })
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    instructions?: string;

    @IsEnum(AssignmentType, { message: 'ประเภทงานไม่ถูกต้อง' })
    type: AssignmentType;

    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    maxScore?: number;

    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    weight?: number;

    @Type(() => Date)
    @IsDate()
    dueDate: Date;

    @IsBoolean()
    @IsOptional()
    allowLateSubmission?: boolean;

    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    latePenaltyPercent?: number;
}

export class UpdateAssignmentDto {
    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    instructions?: string;

    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    maxScore?: number;

    @Type(() => Date)
    @IsDate()
    @IsOptional()
    dueDate?: Date;

    @IsBoolean()
    @IsOptional()
    allowLateSubmission?: boolean;

    @IsBoolean()
    @IsOptional()
    isPublished?: boolean;
}

export class SubmitAssignmentDto {
    @IsString()
    @IsOptional()
    content?: string;

    @IsOptional()
    files?: any[];
}

export class GradeSubmissionDto {
    @Type(() => Number)
    @IsNumber()
    score: number;

    @IsString()
    @IsOptional()
    feedback?: string;
}

export class AssignmentQueryDto {
    @IsOptional()
    page?: number;

    @IsOptional()
    limit?: number;

    @IsString()
    @IsOptional()
    subjectInstanceId?: string;

    @IsEnum(AssignmentType)
    @IsOptional()
    type?: AssignmentType;

    @IsBoolean()
    @IsOptional()
    isPublished?: boolean;

    @IsString()
    @IsOptional()
    search?: string;
}

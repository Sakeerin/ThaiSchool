// Grades DTOs

import { IsString, IsOptional, IsNotEmpty, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateGradeDto {
    @IsString()
    @IsNotEmpty()
    studentId: string;

    @IsString()
    @IsNotEmpty()
    subjectInstanceId: string;

    @IsString()
    @IsOptional()
    gradingPeriodId?: string;

    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    classworkScore?: number;

    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    midtermScore?: number;

    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    finalScore?: number;

    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    behaviorScore?: number;

    @IsString()
    @IsOptional()
    remarks?: string;
}

export class UpdateGradeDto {
    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    classworkScore?: number;

    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    midtermScore?: number;

    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    finalScore?: number;

    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    behaviorScore?: number;

    @IsString()
    @IsOptional()
    remarks?: string;
}

export class BulkGradeDto {
    @IsString()
    @IsNotEmpty()
    subjectInstanceId: string;

    @IsString()
    @IsOptional()
    gradingPeriodId?: string;

    grades: {
        studentId: string;
        classworkScore?: number;
        midtermScore?: number;
        finalScore?: number;
    }[];
}

export class GradeQueryDto {
    @IsString()
    @IsOptional()
    studentId?: string;

    @IsString()
    @IsOptional()
    subjectInstanceId?: string;

    @IsString()
    @IsOptional()
    semesterId?: string;

    @IsString()
    @IsOptional()
    classroomId?: string;
}

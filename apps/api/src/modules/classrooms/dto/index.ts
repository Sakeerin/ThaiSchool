// Classrooms DTOs

import { IsString, IsOptional, IsNotEmpty, IsInt, IsEnum, Min, Max } from 'class-validator';
import { StudyPlan } from '@school/database';
import { Type } from 'class-transformer';

export class CreateClassroomDto {
    @IsString()
    @IsNotEmpty({ message: 'กรุณาเลือกปีการศึกษา' })
    academicYearId: string;

    @IsString()
    @IsNotEmpty({ message: 'กรุณาเลือกระดับชั้น' })
    gradeLevelId: string;

    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(20)
    room: number;

    @IsString()
    @IsNotEmpty()
    name: string;

    @Type(() => Number)
    @IsInt()
    @IsOptional()
    capacity?: number;

    @IsEnum(StudyPlan)
    @IsOptional()
    studyPlan?: StudyPlan;

    @IsString()
    @IsOptional()
    advisorId?: string;
}

export class UpdateClassroomDto {
    @IsString()
    @IsOptional()
    name?: string;

    @Type(() => Number)
    @IsInt()
    @IsOptional()
    capacity?: number;

    @IsEnum(StudyPlan)
    @IsOptional()
    studyPlan?: StudyPlan;

    @IsString()
    @IsOptional()
    advisorId?: string;
}

export class ClassroomQueryDto {
    @IsOptional()
    page?: number;

    @IsOptional()
    limit?: number;

    @IsString()
    @IsOptional()
    academicYearId?: string;

    @IsString()
    @IsOptional()
    gradeLevelId?: string;

    @IsString()
    @IsOptional()
    search?: string;
}

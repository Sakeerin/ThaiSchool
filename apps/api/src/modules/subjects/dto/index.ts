// Subjects DTOs

import { IsString, IsOptional, IsNotEmpty, IsNumber, IsArray, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSubjectDto {
    @IsString()
    @IsNotEmpty({ message: 'กรุณากรอกรหัสวิชา' })
    code: string;

    @IsString()
    @IsNotEmpty({ message: 'กรุณากรอกชื่อวิชา' })
    nameTh: string;

    @IsString()
    @IsOptional()
    nameEn?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsNotEmpty({ message: 'กรุณาเลือกกลุ่มสาระ' })
    subjectAreaId: string;

    @Type(() => Number)
    @IsNumber()
    @Min(0.5)
    credits: number;

    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    hoursPerWeek?: number;

    @IsArray()
    @IsOptional()
    gradeLevelIds?: string[];
}

export class UpdateSubjectDto {
    @IsString()
    @IsOptional()
    nameTh?: string;

    @IsString()
    @IsOptional()
    nameEn?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    credits?: number;

    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    hoursPerWeek?: number;

    @IsArray()
    @IsOptional()
    gradeLevelIds?: string[];
}

export class SubjectQueryDto {
    @IsOptional()
    page?: number;

    @IsOptional()
    limit?: number;

    @IsString()
    @IsOptional()
    subjectAreaId?: string;

    @IsString()
    @IsOptional()
    gradeLevelId?: string;

    @IsString()
    @IsOptional()
    search?: string;
}

export class CreateSubjectAreaDto {
    @IsString()
    @IsNotEmpty()
    code: string;

    @IsString()
    @IsNotEmpty()
    nameTh: string;

    @IsString()
    @IsNotEmpty()
    nameEn: string;

    @IsString()
    @IsOptional()
    color?: string;

    @IsString()
    @IsOptional()
    icon?: string;
}

export class CreateSubjectInstanceDto {
    @IsString()
    @IsNotEmpty()
    subjectId: string;

    @IsString()
    @IsNotEmpty()
    semesterId: string;
}

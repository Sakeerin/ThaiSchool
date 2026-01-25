// Academic Years DTOs

import { IsString, IsOptional, IsNotEmpty, IsInt, IsBoolean, IsDate, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { GradingPeriodType } from '@school/database';

export class CreateAcademicYearDto {
    @Type(() => Number)
    @IsInt()
    year: number;

    @IsString()
    @IsNotEmpty()
    name: string;

    @Type(() => Date)
    @IsDate()
    startDate: Date;

    @Type(() => Date)
    @IsDate()
    endDate: Date;

    @IsBoolean()
    @IsOptional()
    isCurrent?: boolean;
}

export class UpdateAcademicYearDto {
    @IsString()
    @IsOptional()
    name?: string;

    @Type(() => Date)
    @IsDate()
    @IsOptional()
    startDate?: Date;

    @Type(() => Date)
    @IsDate()
    @IsOptional()
    endDate?: Date;

    @IsBoolean()
    @IsOptional()
    isCurrent?: boolean;
}

export class CreateSemesterDto {
    @IsString()
    @IsNotEmpty()
    academicYearId: string;

    @Type(() => Number)
    @IsInt()
    number: number;

    @IsString()
    @IsNotEmpty()
    name: string;

    @Type(() => Date)
    @IsDate()
    startDate: Date;

    @Type(() => Date)
    @IsDate()
    endDate: Date;

    @IsBoolean()
    @IsOptional()
    isCurrent?: boolean;
}

export class CreateGradingPeriodDto {
    @IsString()
    @IsNotEmpty()
    semesterId: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    type: GradingPeriodType;

    @Type(() => Number)
    @IsNumber()
    weight: number;

    @Type(() => Date)
    @IsDate()
    startDate: Date;

    @Type(() => Date)
    @IsDate()
    endDate: Date;
}

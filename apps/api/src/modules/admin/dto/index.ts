// Admin DTOs

import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ReportSummaryQueryDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    academicYearId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    semesterId?: string;
}

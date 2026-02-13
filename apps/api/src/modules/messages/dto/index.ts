// Messages DTOs

import { IsString, IsOptional, IsNotEmpty, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendMessageDto {
    @ApiProperty({ description: 'Receiver user ID' })
    @IsString()
    @IsNotEmpty({ message: 'กรุณาระบุผู้รับ' })
    receiverId: string;

    @ApiProperty({ description: 'Message content' })
    @IsString()
    @IsNotEmpty({ message: 'กรุณากรอกข้อความ' })
    content: string;

    @ApiPropertyOptional({ description: 'Attachments (file URLs)' })
    @IsArray()
    @IsOptional()
    attachments?: string[];
}

export class MessageQueryDto {
    @ApiPropertyOptional({ description: 'Page number' })
    @IsOptional()
    page?: number;

    @ApiPropertyOptional({ description: 'Items per page' })
    @IsOptional()
    limit?: number;
}

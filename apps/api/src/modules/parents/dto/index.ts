// Parents DTOs

import { IsString, IsOptional, IsEmail, MinLength, IsNotEmpty, IsEnum, IsArray } from 'class-validator';
import { ParentRelationship } from '@school/database';

export class CreateParentDto {
    @IsString()
    @IsNotEmpty()
    titleTh: string;

    @IsString()
    @IsNotEmpty({ message: 'กรุณากรอกชื่อ' })
    firstNameTh: string;

    @IsString()
    @IsNotEmpty({ message: 'กรุณากรอกนามสกุล' })
    lastNameTh: string;

    @IsEnum(ParentRelationship, { message: 'ความสัมพันธ์ไม่ถูกต้อง' })
    relationship: ParentRelationship;

    @IsString()
    @IsNotEmpty({ message: 'กรุณากรอกเบอร์โทรศัพท์' })
    phone: string;

    @IsString()
    @IsOptional()
    lineId?: string;

    @IsString()
    @IsOptional()
    occupation?: string;

    @IsString()
    @IsOptional()
    workplace?: string;

    @IsString()
    @IsOptional()
    address?: string;

    @IsEmail({}, { message: 'อีเมลไม่ถูกต้อง' })
    @IsNotEmpty({ message: 'กรุณากรอกอีเมล' })
    email: string;

    @IsString()
    @MinLength(6, { message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' })
    @IsOptional()
    password?: string;

    @IsArray()
    @IsOptional()
    studentIds?: string[];
}

export class UpdateParentDto {
    @IsString()
    @IsOptional()
    titleTh?: string;

    @IsString()
    @IsOptional()
    firstNameTh?: string;

    @IsString()
    @IsOptional()
    lastNameTh?: string;

    @IsEnum(ParentRelationship)
    @IsOptional()
    relationship?: ParentRelationship;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsString()
    @IsOptional()
    lineId?: string;

    @IsString()
    @IsOptional()
    occupation?: string;

    @IsString()
    @IsOptional()
    workplace?: string;

    @IsString()
    @IsOptional()
    address?: string;
}

export class LinkStudentDto {
    @IsString()
    @IsNotEmpty()
    studentId: string;

    @IsOptional()
    isPrimary?: boolean;
}

export class ParentQueryDto {
    @IsOptional()
    page?: number;

    @IsOptional()
    limit?: number;

    @IsString()
    @IsOptional()
    search?: string;
}

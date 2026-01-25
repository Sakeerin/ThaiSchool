// Teachers DTOs

import { IsString, IsOptional, IsEmail, MinLength, IsNotEmpty } from 'class-validator';

export class CreateTeacherDto {
    @IsString()
    @IsNotEmpty({ message: 'กรุณากรอกเลขประจำตัวประชาชน' })
    nationalId: string;

    @IsString()
    @IsNotEmpty({ message: 'กรุณากรอกรหัสพนักงาน' })
    employeeCode: string;

    @IsString()
    @IsNotEmpty()
    titleTh: string;

    @IsString()
    @IsNotEmpty({ message: 'กรุณากรอกชื่อ' })
    firstNameTh: string;

    @IsString()
    @IsNotEmpty({ message: 'กรุณากรอกนามสกุล' })
    lastNameTh: string;

    @IsString()
    @IsOptional()
    titleEn?: string;

    @IsString()
    @IsOptional()
    firstNameEn?: string;

    @IsString()
    @IsOptional()
    lastNameEn?: string;

    @IsString()
    @IsOptional()
    position?: string;

    @IsString()
    @IsOptional()
    department?: string;

    @IsString()
    @IsOptional()
    educationLevel?: string;

    @IsString()
    @IsOptional()
    specialization?: string;

    @IsEmail({}, { message: 'อีเมลไม่ถูกต้อง' })
    @IsNotEmpty({ message: 'กรุณากรอกอีเมล' })
    email: string;

    @IsString()
    @MinLength(6, { message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' })
    @IsOptional()
    password?: string;
}

export class UpdateTeacherDto {
    @IsString()
    @IsOptional()
    titleTh?: string;

    @IsString()
    @IsOptional()
    firstNameTh?: string;

    @IsString()
    @IsOptional()
    lastNameTh?: string;

    @IsString()
    @IsOptional()
    titleEn?: string;

    @IsString()
    @IsOptional()
    firstNameEn?: string;

    @IsString()
    @IsOptional()
    lastNameEn?: string;

    @IsString()
    @IsOptional()
    position?: string;

    @IsString()
    @IsOptional()
    department?: string;

    @IsString()
    @IsOptional()
    educationLevel?: string;

    @IsString()
    @IsOptional()
    specialization?: string;

    @IsString()
    @IsOptional()
    photoUrl?: string;
}

export class TeacherQueryDto {
    @IsOptional()
    page?: number;

    @IsOptional()
    limit?: number;

    @IsString()
    @IsOptional()
    department?: string;

    @IsString()
    @IsOptional()
    search?: string;
}

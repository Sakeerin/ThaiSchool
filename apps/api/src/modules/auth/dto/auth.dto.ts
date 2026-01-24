// Auth DTOs - Data Transfer Objects for authentication

import { IsEmail, IsString, IsEnum, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({ example: 'teacher@school.ac.th' })
    @IsEmail({}, { message: 'อีเมลไม่ถูกต้อง' })
    email: string;

    @ApiProperty({ example: 'password123' })
    @IsString()
    @MinLength(6, { message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' })
    password: string;
}

export class RegisterDto {
    @ApiProperty({ example: 'user@school.ac.th' })
    @IsEmail({}, { message: 'อีเมลไม่ถูกต้อง' })
    email: string;

    @ApiProperty({ example: 'Password123!' })
    @IsString()
    @MinLength(8, { message: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' })
    @Matches(/[A-Z]/, { message: 'รหัสผ่านต้องมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว' })
    @Matches(/[0-9]/, { message: 'รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว' })
    password: string;

    @ApiProperty({ enum: ['TEACHER', 'STUDENT', 'PARENT'] })
    @IsEnum(['TEACHER', 'STUDENT', 'PARENT'], { message: 'ประเภทผู้ใช้ไม่ถูกต้อง' })
    role: string;
}

export class ChangePasswordDto {
    @ApiProperty()
    @IsString()
    @MinLength(1, { message: 'กรุณากรอกรหัสผ่านปัจจุบัน' })
    currentPassword: string;

    @ApiProperty()
    @IsString()
    @MinLength(8, { message: 'รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร' })
    @Matches(/[A-Z]/, { message: 'รหัสผ่านต้องมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว' })
    @Matches(/[0-9]/, { message: 'รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว' })
    newPassword: string;
}

export interface AuthResponse {
    accessToken: string;
    user: {
        id: string;
        email: string;
        role: string;
        profile: {
            type: string;
            name: string;
            code?: string;
            position?: string;
        } | null;
    };
}

// Auth Controller - Authentication endpoints

import {
    Controller,
    Post,
    Body,
    Get,
    UseGuards,
    Request,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { LoginDto, RegisterDto, ChangePasswordDto, AuthResponse } from './dto/auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'เข้าสู่ระบบ' })
    @ApiResponse({ status: 200, description: 'เข้าสู่ระบบสำเร็จ' })
    @ApiResponse({ status: 401, description: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' })
    async login(@Body() loginDto: LoginDto): Promise<AuthResponse> {
        return this.authService.login(loginDto);
    }

    @Post('register')
    @ApiOperation({ summary: 'สมัครสมาชิก' })
    @ApiResponse({ status: 201, description: 'สมัครสมาชิกสำเร็จ' })
    @ApiResponse({ status: 409, description: 'อีเมลถูกใช้งานแล้ว' })
    async register(@Body() registerDto: RegisterDto): Promise<AuthResponse> {
        return this.authService.register(registerDto);
    }

    @Get('profile')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'ดูข้อมูลโปรไฟล์' })
    @ApiResponse({ status: 200, description: 'ข้อมูลโปรไฟล์' })
    async getProfile(@Request() req: any) {
        return this.authService.getProfile(req.user.id);
    }

    @Post('change-password')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'เปลี่ยนรหัสผ่าน' })
    @ApiResponse({ status: 200, description: 'เปลี่ยนรหัสผ่านสำเร็จ' })
    async changePassword(
        @Request() req: any,
        @Body() changePasswordDto: ChangePasswordDto,
    ) {
        await this.authService.changePassword(
            req.user.id,
            changePasswordDto.currentPassword,
            changePasswordDto.newPassword,
        );
        return { message: 'เปลี่ยนรหัสผ่านสำเร็จ' };
    }
}

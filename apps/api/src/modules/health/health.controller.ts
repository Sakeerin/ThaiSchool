// Health Controller - System health check endpoint

import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../../database/prisma.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
    private readonly startTime = Date.now();

    constructor(private readonly prisma: PrismaService) { }

    @Get()
    @ApiOperation({ summary: 'ตรวจสอบสถานะระบบ (System health check)' })
    async getHealth() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            version: process.env.npm_package_version || '1.0.0',
            uptime: Math.floor((Date.now() - this.startTime) / 1000),
            environment: process.env.NODE_ENV || 'development',
        };
    }

    @Get('db')
    @ApiOperation({ summary: 'ตรวจสอบการเชื่อมต่อฐานข้อมูล (Database connectivity check)' })
    async getDatabaseHealth() {
        try {
            await this.prisma.$queryRaw`SELECT 1`;
            return {
                status: 'ok',
                database: 'connected',
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            return {
                status: 'error',
                database: 'disconnected',
                timestamp: new Date().toISOString(),
            };
        }
    }
}

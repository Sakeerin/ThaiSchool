// Admin Controller - Admin-only endpoints for dashboard, reports, system info

import {
    Controller,
    Get,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminService } from './admin.service';
import { ReportSummaryQueryDto } from './dto';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN' as any, 'SUPER_ADMIN' as any)
@ApiBearerAuth()
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    @Get('dashboard')
    @ApiOperation({ summary: 'Get admin dashboard statistics' })
    async getDashboardStats() {
        return this.adminService.getDashboardStats();
    }

    @Get('reports/summary')
    @ApiOperation({ summary: 'Get report summary for admin' })
    async getReportSummary(@Query() query: ReportSummaryQueryDto) {
        return this.adminService.getReportSummary(query);
    }

    @Get('system-info')
    @ApiOperation({ summary: 'Get system information and settings' })
    async getSystemInfo() {
        return this.adminService.getSystemInfo();
    }
}

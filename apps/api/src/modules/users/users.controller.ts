// Users Controller

import { Controller, Get, Param, Patch, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    @Roles('ADMIN', 'SUPER_ADMIN')
    @ApiOperation({ summary: 'ดูรายการผู้ใช้ทั้งหมด' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'role', required: false, enum: ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT'] })
    @ApiQuery({ name: 'search', required: false, type: String })
    async findAll(
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('role') role?: any,
        @Query('search') search?: string,
    ) {
        return this.usersService.findAll({ page, limit, role, search });
    }

    @Get(':id')
    @Roles('ADMIN', 'SUPER_ADMIN')
    @ApiOperation({ summary: 'ดูข้อมูลผู้ใช้' })
    async findById(@Param('id') id: string) {
        return this.usersService.findById(id);
    }

    @Patch(':id/status')
    @Roles('ADMIN', 'SUPER_ADMIN')
    @ApiOperation({ summary: 'เปลี่ยนสถานะผู้ใช้' })
    async updateStatus(
        @Param('id') id: string,
        @Query('active') active: boolean,
    ) {
        return this.usersService.updateStatus(id, active);
    }

    @Delete(':id')
    @Roles('SUPER_ADMIN')
    @ApiOperation({ summary: 'ลบผู้ใช้' })
    async delete(@Param('id') id: string) {
        return this.usersService.delete(id);
    }
}

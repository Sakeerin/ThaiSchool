// Students Controller

import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('students')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('students')
export class StudentsController {
    constructor(private readonly studentsService: StudentsService) { }

    @Get()
    @Roles('ADMIN', 'TEACHER')
    @ApiOperation({ summary: 'ดูรายชื่อนักเรียน' })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'classroomId', required: false })
    @ApiQuery({ name: 'gradeLevelId', required: false })
    @ApiQuery({ name: 'search', required: false })
    async findAll(
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('classroomId') classroomId?: string,
        @Query('gradeLevelId') gradeLevelId?: string,
        @Query('search') search?: string,
    ) {
        return this.studentsService.findAll({ page, limit, classroomId, gradeLevelId, search });
    }

    @Get(':id')
    @Roles('ADMIN', 'TEACHER')
    @ApiOperation({ summary: 'ดูข้อมูลนักเรียน' })
    async findById(@Param('id') id: string) {
        return this.studentsService.findById(id);
    }

    @Post()
    @Roles('ADMIN')
    @ApiOperation({ summary: 'เพิ่มนักเรียน' })
    async create(@Body() data: any) {
        return this.studentsService.create(data);
    }

    @Patch(':id')
    @Roles('ADMIN')
    @ApiOperation({ summary: 'แก้ไขข้อมูลนักเรียน' })
    async update(@Param('id') id: string, @Body() data: any) {
        return this.studentsService.update(id, data);
    }

    @Delete(':id')
    @Roles('ADMIN')
    @ApiOperation({ summary: 'ลบนักเรียน' })
    async delete(@Param('id') id: string) {
        return this.studentsService.delete(id);
    }

    @Get('classroom/:classroomId')
    @Roles('ADMIN', 'TEACHER')
    @ApiOperation({ summary: 'ดูนักเรียนในห้อง' })
    async getByClassroom(@Param('classroomId') classroomId: string) {
        return this.studentsService.getByClassroom(classroomId);
    }
}

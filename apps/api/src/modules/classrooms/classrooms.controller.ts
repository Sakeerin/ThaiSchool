// Classrooms Controller

import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ClassroomsService } from './classrooms.service';
import { CreateClassroomDto, UpdateClassroomDto, ClassroomQueryDto } from './dto';

@ApiTags('Classrooms')
@Controller('classrooms')
export class ClassroomsController {
    constructor(private readonly classroomsService: ClassroomsService) { }

    @Get()
    @ApiOperation({ summary: 'Get all classrooms with pagination' })
    async findAll(@Query() query: ClassroomQueryDto) {
        return this.classroomsService.findAll(query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get classroom by ID with students' })
    async findById(@Param('id') id: string) {
        return this.classroomsService.findById(id);
    }

    @Get(':id/students')
    @ApiOperation({ summary: 'Get students in classroom' })
    async getStudents(@Param('id') id: string) {
        return this.classroomsService.getStudents(id);
    }

    @Get('academic-year/:academicYearId')
    @ApiOperation({ summary: 'Get classrooms by academic year' })
    async getByAcademicYear(@Param('academicYearId') academicYearId: string) {
        return this.classroomsService.getByAcademicYear(academicYearId);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create new classroom' })
    async create(@Body() dto: CreateClassroomDto) {
        return this.classroomsService.create(dto);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update classroom' })
    async update(@Param('id') id: string, @Body() dto: UpdateClassroomDto) {
        return this.classroomsService.update(id, dto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete classroom' })
    async delete(@Param('id') id: string) {
        return this.classroomsService.delete(id);
    }

    @Put(':id/advisor/:advisorId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Assign advisor to classroom' })
    async assignAdvisor(
        @Param('id') id: string,
        @Param('advisorId') advisorId: string,
    ) {
        return this.classroomsService.assignAdvisor(id, advisorId);
    }

    @Delete(':id/advisor')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Remove advisor from classroom' })
    async removeAdvisor(@Param('id') id: string) {
        return this.classroomsService.removeAdvisor(id);
    }
}

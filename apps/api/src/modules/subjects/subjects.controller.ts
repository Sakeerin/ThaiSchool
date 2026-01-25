// Subjects Controller

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
import { SubjectsService } from './subjects.service';
import {
    CreateSubjectDto,
    UpdateSubjectDto,
    SubjectQueryDto,
    CreateSubjectAreaDto,
    CreateSubjectInstanceDto,
} from './dto';

@ApiTags('Subjects')
@Controller('subjects')
export class SubjectsController {
    constructor(private readonly subjectsService: SubjectsService) { }

    // Subject Areas
    @Get('areas')
    @ApiOperation({ summary: 'Get all subject areas (8 กลุ่มสาระ)' })
    async findAllAreas() {
        return this.subjectsService.findAllAreas();
    }

    @Post('areas')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create new subject area' })
    async createArea(@Body() dto: CreateSubjectAreaDto) {
        return this.subjectsService.createArea(dto);
    }

    // Grade Levels
    @Get('grade-levels')
    @ApiOperation({ summary: 'Get all grade levels' })
    async getGradeLevels() {
        return this.subjectsService.getGradeLevels();
    }

    @Get('grade-levels/:gradeLevelId/subjects')
    @ApiOperation({ summary: 'Get subjects by grade level' })
    async getSubjectsByGradeLevel(@Param('gradeLevelId') gradeLevelId: string) {
        return this.subjectsService.getSubjectsByGradeLevel(gradeLevelId);
    }

    // Subjects
    @Get()
    @ApiOperation({ summary: 'Get all subjects with pagination' })
    async findAll(@Query() query: SubjectQueryDto) {
        return this.subjectsService.findAll(query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get subject by ID' })
    async findById(@Param('id') id: string) {
        return this.subjectsService.findById(id);
    }

    @Get('code/:code')
    @ApiOperation({ summary: 'Get subject by code' })
    async findByCode(@Param('code') code: string) {
        return this.subjectsService.findByCode(code);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create new subject' })
    async create(@Body() dto: CreateSubjectDto) {
        return this.subjectsService.create(dto);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update subject' })
    async update(@Param('id') id: string, @Body() dto: UpdateSubjectDto) {
        return this.subjectsService.update(id, dto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete subject' })
    async delete(@Param('id') id: string) {
        return this.subjectsService.delete(id);
    }

    // Subject Instances
    @Post('instances')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create subject instance for semester' })
    async createInstance(@Body() dto: CreateSubjectInstanceDto) {
        return this.subjectsService.createInstance(dto);
    }

    @Get('instances/semester/:semesterId')
    @ApiOperation({ summary: 'Get subject instances by semester' })
    async getInstancesBySemester(@Param('semesterId') semesterId: string) {
        return this.subjectsService.getInstancesBySemester(semesterId);
    }

    @Post('instances/:instanceId/assign-teacher/:teacherId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Assign teacher to subject instance' })
    async assignTeacher(
        @Param('instanceId') instanceId: string,
        @Param('teacherId') teacherId: string,
    ) {
        return this.subjectsService.assignTeacher(instanceId, teacherId);
    }
}

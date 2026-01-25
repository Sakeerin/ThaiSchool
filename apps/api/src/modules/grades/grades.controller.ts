// Grades Controller

import {
    Controller,
    Get,
    Post,
    Put,
    Body,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GradesService } from './grades.service';
import { CreateGradeDto, UpdateGradeDto, BulkGradeDto, GradeQueryDto } from './dto';

@ApiTags('Grades')
@Controller('grades')
export class GradesController {
    constructor(private readonly gradesService: GradesService) { }

    @Get('student/:studentId')
    @ApiOperation({ summary: 'Get grades by student' })
    async findByStudent(
        @Param('studentId') studentId: string,
        @Query('semesterId') semesterId?: string,
    ) {
        return this.gradesService.findByStudent(studentId, semesterId);
    }

    @Get('subject-instance/:subjectInstanceId')
    @ApiOperation({ summary: 'Get grades by subject instance' })
    async findBySubjectInstance(
        @Param('subjectInstanceId') subjectInstanceId: string,
    ) {
        return this.gradesService.findBySubjectInstance(subjectInstanceId);
    }

    @Get('classroom/:classroomId/semester/:semesterId')
    @ApiOperation({ summary: 'Get grades by classroom and semester' })
    async getClassroomGrades(
        @Param('classroomId') classroomId: string,
        @Param('semesterId') semesterId: string,
    ) {
        return this.gradesService.getClassroomGrades(classroomId, semesterId);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create grade record' })
    async create(@Body() dto: CreateGradeDto) {
        return this.gradesService.create(dto);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update grade record' })
    async update(@Param('id') id: string, @Body() dto: UpdateGradeDto) {
        return this.gradesService.update(id, dto);
    }

    @Post('bulk')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Bulk create/update grades' })
    async bulkCreateOrUpdate(@Body() dto: BulkGradeDto) {
        return this.gradesService.bulkCreateOrUpdate(dto);
    }

    // GPA Calculations
    @Get('gpa/student/:studentId/semester/:semesterId')
    @ApiOperation({ summary: 'Calculate GPA for student in semester' })
    async calculateGPA(
        @Param('studentId') studentId: string,
        @Param('semesterId') semesterId: string,
    ) {
        return this.gradesService.calculateGPA(studentId, semesterId);
    }

    @Get('gpax/student/:studentId')
    @ApiOperation({ summary: 'Calculate cumulative GPAX for student' })
    async calculateGPAX(@Param('studentId') studentId: string) {
        return this.gradesService.calculateGPAX(studentId);
    }
}

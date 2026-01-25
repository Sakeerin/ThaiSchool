// Assignments Controller

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
    Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AssignmentsService } from './assignments.service';
import {
    CreateAssignmentDto,
    UpdateAssignmentDto,
    SubmitAssignmentDto,
    GradeSubmissionDto,
    AssignmentQueryDto,
} from './dto';

@ApiTags('Assignments')
@Controller('assignments')
export class AssignmentsController {
    constructor(private readonly assignmentsService: AssignmentsService) { }

    @Get()
    @ApiOperation({ summary: 'Get all assignments with pagination' })
    async findAll(@Query() query: AssignmentQueryDto) {
        return this.assignmentsService.findAll(query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get assignment by ID with submissions' })
    async findById(@Param('id') id: string) {
        return this.assignmentsService.findById(id);
    }

    @Get('subject-instance/:subjectInstanceId')
    @ApiOperation({ summary: 'Get assignments by subject instance' })
    async getBySubjectInstance(@Param('subjectInstanceId') subjectInstanceId: string) {
        return this.assignmentsService.getAssignmentsBySubjectInstance(subjectInstanceId);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create new assignment' })
    async create(@Body() dto: CreateAssignmentDto, @Request() req: any) {
        const teacherId = req.user.teacher?.id;
        return this.assignmentsService.create(dto, teacherId);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update assignment' })
    async update(@Param('id') id: string, @Body() dto: UpdateAssignmentDto) {
        return this.assignmentsService.update(id, dto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete assignment' })
    async delete(@Param('id') id: string) {
        return this.assignmentsService.delete(id);
    }

    @Put(':id/publish')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Publish assignment' })
    async publish(@Param('id') id: string) {
        return this.assignmentsService.publish(id);
    }

    // Submissions
    @Post(':id/submit')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Submit assignment (student)' })
    async submit(
        @Param('id') id: string,
        @Body() dto: SubmitAssignmentDto,
        @Request() req: any,
    ) {
        const studentId = req.user.student?.id;
        return this.assignmentsService.submit(id, studentId, dto);
    }

    @Put('submissions/:submissionId/grade')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Grade submission (teacher)' })
    async gradeSubmission(
        @Param('submissionId') submissionId: string,
        @Body() dto: GradeSubmissionDto,
        @Request() req: any,
    ) {
        const teacherId = req.user.teacher?.id;
        return this.assignmentsService.gradeSubmission(submissionId, dto, teacherId);
    }

    @Put('submissions/:submissionId/return')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Return submission for revision' })
    async returnSubmission(
        @Param('submissionId') submissionId: string,
        @Body('feedback') feedback: string,
    ) {
        return this.assignmentsService.returnSubmission(submissionId, feedback);
    }

    @Get('student/:studentId/submissions')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get student submissions' })
    async getStudentSubmissions(@Param('studentId') studentId: string) {
        return this.assignmentsService.getStudentSubmissions(studentId);
    }
}

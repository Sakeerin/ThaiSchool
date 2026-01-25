// Exams Controller

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
import { ExamsService } from './exams.service';
import {
    CreateExamDto,
    UpdateExamDto,
    CreateQuestionDto,
    AddExamQuestionDto,
    SubmitExamAnswerDto,
    ExamQueryDto,
    CreateQuestionBankDto,
} from './dto';

@ApiTags('Exams')
@Controller('exams')
export class ExamsController {
    constructor(private readonly examsService: ExamsService) { }

    @Get()
    @ApiOperation({ summary: 'Get all exams with pagination' })
    async findAll(@Query() query: ExamQueryDto) {
        return this.examsService.findAll(query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get exam by ID with questions' })
    async findById(@Param('id') id: string) {
        return this.examsService.findById(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create new exam' })
    async create(@Body() dto: CreateExamDto, @Request() req: any) {
        const teacherId = req.user.teacher?.id;
        return this.examsService.create(dto, teacherId);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update exam' })
    async update(@Param('id') id: string, @Body() dto: UpdateExamDto) {
        return this.examsService.update(id, dto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete exam' })
    async delete(@Param('id') id: string) {
        return this.examsService.delete(id);
    }

    // Exam Questions
    @Post(':id/questions')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Add question to exam' })
    async addQuestion(@Param('id') id: string, @Body() dto: AddExamQuestionDto) {
        return this.examsService.addQuestion(id, dto);
    }

    @Delete(':id/questions/:questionId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Remove question from exam' })
    async removeQuestion(
        @Param('id') id: string,
        @Param('questionId') questionId: string,
    ) {
        return this.examsService.removeQuestion(id, questionId);
    }

    // Question Bank
    @Post('question-banks')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create question bank' })
    async createQuestionBank(@Body() dto: CreateQuestionBankDto) {
        return this.examsService.createQuestionBank(dto);
    }

    @Get('question-banks/subject/:subjectId')
    @ApiOperation({ summary: 'Get question banks by subject' })
    async getQuestionBanks(@Param('subjectId') subjectId: string) {
        return this.examsService.getQuestionBanks(subjectId);
    }

    @Post('questions')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create question in bank' })
    async createQuestion(@Body() dto: CreateQuestionDto) {
        return this.examsService.createQuestion(dto);
    }

    @Get('question-banks/:bankId/questions')
    @ApiOperation({ summary: 'Get questions by bank' })
    async getQuestionsByBank(@Param('bankId') bankId: string) {
        return this.examsService.getQuestionsByBank(bankId);
    }

    // Exam Attempts
    @Post(':id/start')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Start exam attempt (student)' })
    async startAttempt(@Param('id') id: string, @Request() req: any) {
        const studentId = req.user.student?.id;
        return this.examsService.startAttempt(id, studentId);
    }

    @Put('attempts/:attemptId/answer')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Submit answer for question' })
    async submitAnswer(
        @Param('attemptId') attemptId: string,
        @Body() dto: SubmitExamAnswerDto,
    ) {
        return this.examsService.submitAnswer(attemptId, dto);
    }

    @Post('attempts/:attemptId/submit')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Submit exam for grading' })
    async submitExam(@Param('attemptId') attemptId: string) {
        return this.examsService.submitExam(attemptId);
    }

    @Get('attempts/:attemptId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get exam attempt' })
    async getAttempt(@Param('attemptId') attemptId: string) {
        return this.examsService.getAttempt(attemptId);
    }

    @Get('student/:studentId/attempts')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get student exam attempts' })
    async getStudentAttempts(@Param('studentId') studentId: string) {
        return this.examsService.getStudentAttempts(studentId);
    }
}

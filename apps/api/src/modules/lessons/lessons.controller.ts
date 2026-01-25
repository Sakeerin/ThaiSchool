// Lessons Controller

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
import { LessonsService } from './lessons.service';
import {
    CreateLessonDto,
    UpdateLessonDto,
    CreateLessonContentDto,
    UpdateLessonContentDto,
    LessonQueryDto,
} from './dto';

@ApiTags('Lessons')
@Controller('lessons')
export class LessonsController {
    constructor(private readonly lessonsService: LessonsService) { }

    @Get()
    @ApiOperation({ summary: 'Get all lessons with pagination' })
    async findAll(@Query() query: LessonQueryDto) {
        return this.lessonsService.findAll(query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get lesson by ID with contents' })
    async findById(@Param('id') id: string) {
        return this.lessonsService.findById(id);
    }

    @Get('subject-instance/:subjectInstanceId')
    @ApiOperation({ summary: 'Get published lessons by subject instance' })
    async getBySubjectInstance(@Param('subjectInstanceId') subjectInstanceId: string) {
        return this.lessonsService.getBySubjectInstance(subjectInstanceId);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create new lesson' })
    async create(@Body() dto: CreateLessonDto, @Request() req: any) {
        // Get teacher ID from user's teacher profile
        const teacherId = req.user.teacher?.id;
        return this.lessonsService.create(dto, teacherId);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update lesson' })
    async update(@Param('id') id: string, @Body() dto: UpdateLessonDto) {
        return this.lessonsService.update(id, dto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete lesson' })
    async delete(@Param('id') id: string) {
        return this.lessonsService.delete(id);
    }

    @Put(':id/publish')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Publish lesson' })
    async publish(@Param('id') id: string) {
        return this.lessonsService.publish(id);
    }

    @Put(':id/unpublish')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Unpublish lesson' })
    async unpublish(@Param('id') id: string) {
        return this.lessonsService.unpublish(id);
    }

    // Content endpoints
    @Post('contents')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Add content to lesson' })
    async addContent(@Body() dto: CreateLessonContentDto) {
        return this.lessonsService.addContent(dto);
    }

    @Put('contents/:contentId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update lesson content' })
    async updateContent(
        @Param('contentId') contentId: string,
        @Body() dto: UpdateLessonContentDto,
    ) {
        return this.lessonsService.updateContent(contentId, dto);
    }

    @Delete('contents/:contentId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete lesson content' })
    async deleteContent(@Param('contentId') contentId: string) {
        return this.lessonsService.deleteContent(contentId);
    }

    @Put(':id/reorder-contents')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Reorder lesson contents' })
    async reorderContents(
        @Param('id') id: string,
        @Body('contentIds') contentIds: string[],
    ) {
        return this.lessonsService.reorderContents(id, contentIds);
    }
}

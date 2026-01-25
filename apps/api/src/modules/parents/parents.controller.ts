// Parents Controller

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
import { ParentsService } from './parents.service';
import { CreateParentDto, UpdateParentDto, ParentQueryDto, LinkStudentDto } from './dto';

@ApiTags('Parents')
@Controller('parents')
export class ParentsController {
    constructor(private readonly parentsService: ParentsService) { }

    @Get()
    @ApiOperation({ summary: 'Get all parents with pagination' })
    async findAll(@Query() query: ParentQueryDto) {
        return this.parentsService.findAll(query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get parent by ID' })
    async findById(@Param('id') id: string) {
        return this.parentsService.findById(id);
    }

    @Get(':id/children')
    @ApiOperation({ summary: 'Get children of a parent' })
    async getChildren(@Param('id') id: string) {
        return this.parentsService.getChildren(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create new parent' })
    async create(@Body() dto: CreateParentDto) {
        return this.parentsService.create(dto);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update parent' })
    async update(@Param('id') id: string, @Body() dto: UpdateParentDto) {
        return this.parentsService.update(id, dto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete parent' })
    async delete(@Param('id') id: string) {
        return this.parentsService.delete(id);
    }

    @Post(':id/link-student')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Link student to parent' })
    async linkStudent(@Param('id') id: string, @Body() dto: LinkStudentDto) {
        return this.parentsService.linkStudent(id, dto);
    }

    @Delete(':id/unlink-student/:studentId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Unlink student from parent' })
    async unlinkStudent(
        @Param('id') id: string,
        @Param('studentId') studentId: string,
    ) {
        return this.parentsService.unlinkStudent(id, studentId);
    }
}

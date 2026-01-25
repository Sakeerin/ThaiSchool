// Teachers Controller

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
import { TeachersService } from './teachers.service';
import { CreateTeacherDto, UpdateTeacherDto, TeacherQueryDto } from './dto';

@ApiTags('Teachers')
@Controller('teachers')
export class TeachersController {
    constructor(private readonly teachersService: TeachersService) { }

    @Get()
    @ApiOperation({ summary: 'Get all teachers with pagination' })
    async findAll(@Query() query: TeacherQueryDto) {
        return this.teachersService.findAll(query);
    }

    @Get('departments')
    @ApiOperation({ summary: 'Get list of all departments' })
    async getDepartments() {
        return this.teachersService.getDepartments();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get teacher by ID' })
    async findById(@Param('id') id: string) {
        return this.teachersService.findById(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create new teacher' })
    async create(@Body() dto: CreateTeacherDto) {
        return this.teachersService.create(dto);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update teacher' })
    async update(@Param('id') id: string, @Body() dto: UpdateTeacherDto) {
        return this.teachersService.update(id, dto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete teacher' })
    async delete(@Param('id') id: string) {
        return this.teachersService.delete(id);
    }

    @Get('department/:department')
    @ApiOperation({ summary: 'Get teachers by department' })
    async getByDepartment(@Param('department') department: string) {
        return this.teachersService.getByDepartment(department);
    }
}

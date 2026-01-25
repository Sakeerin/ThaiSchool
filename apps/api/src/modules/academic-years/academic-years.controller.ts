// Academic Years Controller

import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AcademicYearsService } from './academic-years.service';
import {
    CreateAcademicYearDto,
    UpdateAcademicYearDto,
    CreateSemesterDto,
    CreateGradingPeriodDto,
} from './dto';

@ApiTags('Academic Years')
@Controller('academic-years')
export class AcademicYearsController {
    constructor(private readonly academicYearsService: AcademicYearsService) { }

    @Get()
    @ApiOperation({ summary: 'Get all academic years' })
    async findAll() {
        return this.academicYearsService.findAll();
    }

    @Get('current')
    @ApiOperation({ summary: 'Get current academic year' })
    async findCurrent() {
        return this.academicYearsService.findCurrent();
    }

    @Get('current-semester')
    @ApiOperation({ summary: 'Get current semester' })
    async getCurrentSemester() {
        return this.academicYearsService.getCurrentSemester();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get academic year by ID' })
    async findById(@Param('id') id: string) {
        return this.academicYearsService.findById(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create new academic year' })
    async create(@Body() dto: CreateAcademicYearDto) {
        return this.academicYearsService.create(dto);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update academic year' })
    async update(@Param('id') id: string, @Body() dto: UpdateAcademicYearDto) {
        return this.academicYearsService.update(id, dto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete academic year' })
    async delete(@Param('id') id: string) {
        return this.academicYearsService.delete(id);
    }

    @Put(':id/set-current')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Set academic year as current' })
    async setCurrent(@Param('id') id: string) {
        return this.academicYearsService.setCurrent(id);
    }

    // Semesters
    @Post('semesters')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create semester' })
    async createSemester(@Body() dto: CreateSemesterDto) {
        return this.academicYearsService.createSemester(dto);
    }

    @Put('semesters/:id/set-current')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Set semester as current' })
    async setCurrentSemester(@Param('id') id: string) {
        return this.academicYearsService.setCurrentSemester(id);
    }

    // Grading Periods
    @Post('grading-periods')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create grading period' })
    async createGradingPeriod(@Body() dto: CreateGradingPeriodDto) {
        return this.academicYearsService.createGradingPeriod(dto);
    }

    @Get('semesters/:semesterId/grading-periods')
    @ApiOperation({ summary: 'Get grading periods by semester' })
    async getGradingPeriodsBySemester(@Param('semesterId') semesterId: string) {
        return this.academicYearsService.getGradingPeriodsBySemester(semesterId);
    }
}

// Upload Controller - File upload endpoints

import {
    Controller,
    Post,
    Delete,
    Param,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    UploadedFiles,
    BadRequestException,
    Body,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UploadService } from './upload.service';
import { UploadFileDto } from './dto';
import { memoryStorage } from 'multer';

@ApiTags('Upload')
@Controller('upload')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UploadController {
    constructor(private readonly uploadService: UploadService) { }

    @Post('file')
    @ApiOperation({ summary: 'Upload a single file' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary' },
                folder: { type: 'string' },
            },
            required: ['file'],
        },
    })
    @UseInterceptors(
        FileInterceptor('file', {
            storage: memoryStorage(),
            limits: { fileSize: 100 * 1024 * 1024 }, // 100MB max
        }),
    )
    async uploadFile(
        @UploadedFile() file: Express.Multer.File,
        @Body() dto: UploadFileDto,
    ) {
        if (!file) {
            throw new BadRequestException('กรุณาเลือกไฟล์');
        }

        return this.uploadService.uploadFile(file, dto.folder);
    }

    @Post('files')
    @ApiOperation({ summary: 'Upload multiple files' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                files: {
                    type: 'array',
                    items: { type: 'string', format: 'binary' },
                },
                folder: { type: 'string' },
            },
            required: ['files'],
        },
    })
    @UseInterceptors(
        FilesInterceptor('files', 10, {
            storage: memoryStorage(),
            limits: { fileSize: 100 * 1024 * 1024 },
        }),
    )
    async uploadFiles(
        @UploadedFiles() files: Express.Multer.File[],
        @Body() dto: UploadFileDto,
    ) {
        if (!files || files.length === 0) {
            throw new BadRequestException('กรุณาเลือกไฟล์');
        }

        return this.uploadService.uploadFiles(files, dto.folder);
    }

    @Delete(':key')
    @ApiOperation({ summary: 'Delete a file' })
    async deleteFile(@Param('key') key: string) {
        await this.uploadService.deleteFile(key);
        return { message: 'ลบไฟล์สำเร็จ' };
    }

    @Post('signed-url/:key')
    @ApiOperation({ summary: 'Get signed URL for a file' })
    async getSignedUrl(@Param('key') key: string) {
        const url = await this.uploadService.getSignedUrl(key);
        return { url };
    }
}

// Notifications Controller

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
import { NotificationsService } from './notifications.service';
import {
    CreateNotificationDto,
    CreateAnnouncementDto,
    UpdateAnnouncementDto,
    NotificationQueryDto,
} from './dto';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get current user notifications' })
    async getUserNotifications(@Query() query: NotificationQueryDto, @Request() req: any) {
        return this.notificationsService.getUserNotifications(req.user.id, query);
    }

    @Get('unread-count')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get unread notification count' })
    async getUnreadCount(@Request() req: any) {
        return this.notificationsService.getUnreadCount(req.user.id);
    }

    @Put(':id/read')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Mark notification as read' })
    async markAsRead(@Param('id') id: string) {
        return this.notificationsService.markAsRead(id);
    }

    @Put('read-all')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Mark all notifications as read' })
    async markAllAsRead(@Request() req: any) {
        return this.notificationsService.markAllAsRead(req.user.id);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete notification' })
    async delete(@Param('id') id: string) {
        return this.notificationsService.delete(id);
    }

    // Announcements
    @Get('announcements')
    @ApiOperation({ summary: 'Get published announcements' })
    async getAnnouncements(@Query() query: { page?: number; limit?: number; type?: string }) {
        return this.notificationsService.getAnnouncements(query);
    }

    @Get('announcements/:id')
    @ApiOperation({ summary: 'Get announcement by ID' })
    async getAnnouncementById(@Param('id') id: string) {
        return this.notificationsService.getAnnouncementById(id);
    }

    @Post('announcements')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create announcement' })
    async createAnnouncement(@Body() dto: CreateAnnouncementDto, @Request() req: any) {
        return this.notificationsService.createAnnouncement(dto, req.user.id);
    }

    @Put('announcements/:id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update announcement' })
    async updateAnnouncement(@Param('id') id: string, @Body() dto: UpdateAnnouncementDto) {
        return this.notificationsService.updateAnnouncement(id, dto);
    }

    @Delete('announcements/:id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete announcement' })
    async deleteAnnouncement(@Param('id') id: string) {
        return this.notificationsService.deleteAnnouncement(id);
    }

    @Put('announcements/:id/publish')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Publish announcement' })
    async publishAnnouncement(@Param('id') id: string) {
        return this.notificationsService.publishAnnouncement(id);
    }
}

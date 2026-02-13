// Messages Controller

import {
    Controller,
    Get,
    Post,
    Put,
    Body,
    Param,
    Query,
    UseGuards,
    Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { MessagesService } from './messages.service';
import { SendMessageDto, MessageQueryDto } from './dto';

@ApiTags('Messages')
@Controller('messages')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MessagesController {
    constructor(private readonly messagesService: MessagesService) { }

    @Get('conversations')
    @ApiOperation({ summary: 'Get all conversations' })
    async getConversations(@Request() req: any) {
        return this.messagesService.getConversations(req.user.id);
    }

    @Get('unread-count')
    @ApiOperation({ summary: 'Get unread message count' })
    async getUnreadCount(@Request() req: any) {
        return this.messagesService.getUnreadCount(req.user.id);
    }

    @Get('search-users')
    @ApiOperation({ summary: 'Search users for messaging' })
    async searchUsers(
        @Request() req: any,
        @Query('q') query: string,
        @Query('role') role?: string
    ) {
        return this.messagesService.searchUsers(req.user.id, query || '', role);
    }

    @Get(':userId')
    @ApiOperation({ summary: 'Get messages with a specific user' })
    async getMessages(
        @Param('userId') userId: string,
        @Query() query: MessageQueryDto,
        @Request() req: any
    ) {
        return this.messagesService.getMessages(req.user.id, userId, query);
    }

    @Post()
    @ApiOperation({ summary: 'Send a message' })
    async sendMessage(@Body() dto: SendMessageDto, @Request() req: any) {
        return this.messagesService.sendMessage(req.user.id, dto);
    }

    @Put(':id/read')
    @ApiOperation({ summary: 'Mark message as read' })
    async markAsRead(@Param('id') id: string, @Request() req: any) {
        return this.messagesService.markAsRead(id, req.user.id);
    }
}

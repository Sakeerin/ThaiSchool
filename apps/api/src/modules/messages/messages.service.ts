// Messages Service

import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { SendMessageDto, MessageQueryDto } from './dto';

@Injectable()
export class MessagesService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Get all conversations for a user
     * Returns a list of users the current user has exchanged messages with
     */
    async getConversations(userId: string) {
        // Get all unique users this user has messaged or received from
        const sentMessages = await this.prisma.message.findMany({
            where: { senderId: userId },
            select: { receiverId: true },
            distinct: ['receiverId'],
        });

        const receivedMessages = await this.prisma.message.findMany({
            where: { receiverId: userId },
            select: { senderId: true },
            distinct: ['senderId'],
        });

        const userIds = new Set<string>();
        sentMessages.forEach((m) => userIds.add(m.receiverId));
        receivedMessages.forEach((m) => userIds.add(m.senderId));

        // Get user details and last message for each conversation
        const conversations = await Promise.all(
            Array.from(userIds).map(async (otherUserId) => {
                const user = await this.prisma.user.findUnique({
                    where: { id: otherUserId },
                    select: {
                        id: true,
                        email: true,
                        role: true,
                        student: {
                            select: {
                                firstNameTh: true,
                                lastNameTh: true,
                                studentCode: true,
                            },
                        },
                        teacher: {
                            select: {
                                titleTh: true,
                                firstNameTh: true,
                                lastNameTh: true,
                            },
                        },
                        parent: {
                            select: {
                                titleTh: true,
                                firstNameTh: true,
                                lastNameTh: true,
                            },
                        },
                    },
                });

                const lastMessage = await this.prisma.message.findFirst({
                    where: {
                        OR: [
                            { senderId: userId, receiverId: otherUserId },
                            { senderId: otherUserId, receiverId: userId },
                        ],
                    },
                    orderBy: { createdAt: 'desc' },
                });

                const unreadCount = await this.prisma.message.count({
                    where: {
                        senderId: otherUserId,
                        receiverId: userId,
                        isRead: false,
                    },
                });

                // Format display name based on role
                let displayName = user?.email || 'Unknown';
                if (user?.teacher) {
                    displayName = `${user.teacher.titleTh}${user.teacher.firstNameTh} ${user.teacher.lastNameTh}`;
                } else if (user?.parent) {
                    displayName = `${user.parent.titleTh}${user.parent.firstNameTh} ${user.parent.lastNameTh}`;
                } else if (user?.student) {
                    displayName = `${user.student.firstNameTh} ${user.student.lastNameTh}`;
                }

                return {
                    user: {
                        id: user?.id,
                        email: user?.email,
                        role: user?.role,
                        displayName,
                    },
                    lastMessage: lastMessage
                        ? {
                            content: lastMessage.content,
                            createdAt: lastMessage.createdAt,
                            isRead: lastMessage.isRead,
                            isSentByMe: lastMessage.senderId === userId,
                        }
                        : null,
                    unreadCount,
                };
            })
        );

        // Sort by last message date
        return conversations.sort((a, b) => {
            if (!a.lastMessage) return 1;
            if (!b.lastMessage) return -1;
            return new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime();
        });
    }

    /**
     * Get messages between current user and another user
     */
    async getMessages(userId: string, otherUserId: string, params: MessageQueryDto) {
        const { page = 1, limit = 50 } = params;

        const messages = await this.prisma.message.findMany({
            where: {
                OR: [
                    { senderId: userId, receiverId: otherUserId },
                    { senderId: otherUserId, receiverId: userId },
                ],
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
            include: {
                sender: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                    },
                },
            },
        });

        const total = await this.prisma.message.count({
            where: {
                OR: [
                    { senderId: userId, receiverId: otherUserId },
                    { senderId: otherUserId, receiverId: userId },
                ],
            },
        });

        // Mark messages as read
        await this.prisma.message.updateMany({
            where: {
                senderId: otherUserId,
                receiverId: userId,
                isRead: false,
            },
            data: {
                isRead: true,
                readAt: new Date(),
            },
        });

        return {
            data: messages.reverse(), // Return in ascending order for chat display
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Send a message
     */
    async sendMessage(senderId: string, dto: SendMessageDto) {
        // Verify receiver exists
        const receiver = await this.prisma.user.findUnique({
            where: { id: dto.receiverId },
        });

        if (!receiver) {
            throw new NotFoundException('ไม่พบผู้รับข้อความ');
        }

        const message = await this.prisma.message.create({
            data: {
                senderId,
                receiverId: dto.receiverId,
                content: dto.content,
                attachments: dto.attachments || undefined,
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                    },
                },
                receiver: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                    },
                },
            },
        });

        // Create notification for receiver
        await this.prisma.userNotification.create({
            data: {
                userId: dto.receiverId,
                type: 'MESSAGE_NEW',
                title: 'ข้อความใหม่',
                content: dto.content.substring(0, 100),
                link: `/dashboard/messages?user=${senderId}`,
            },
        });

        return message;
    }

    /**
     * Mark a message as read
     */
    async markAsRead(messageId: string, userId: string) {
        const message = await this.prisma.message.findUnique({
            where: { id: messageId },
        });

        if (!message) {
            throw new NotFoundException('ไม่พบข้อความ');
        }

        if (message.receiverId !== userId) {
            throw new ForbiddenException('ไม่สามารถอ่านข้อความนี้ได้');
        }

        return this.prisma.message.update({
            where: { id: messageId },
            data: {
                isRead: true,
                readAt: new Date(),
            },
        });
    }

    /**
     * Get unread message count
     */
    async getUnreadCount(userId: string) {
        const count = await this.prisma.message.count({
            where: {
                receiverId: userId,
                isRead: false,
            },
        });

        return { count };
    }

    /**
     * Search users for messaging (teachers can message parents, parents can message teachers)
     */
    async searchUsers(currentUserId: string, query: string, role?: string) {
        const currentUser = await this.prisma.user.findUnique({
            where: { id: currentUserId },
        });

        if (!currentUser) {
            throw new NotFoundException('ไม่พบผู้ใช้');
        }

        // Determine which roles can be messaged based on current user's role
        let allowedRoles: string[] = [];
        if (currentUser.role === 'TEACHER') {
            allowedRoles = ['PARENT', 'STUDENT', 'TEACHER', 'ADMIN'];
        } else if (currentUser.role === 'PARENT') {
            allowedRoles = ['TEACHER', 'ADMIN'];
        } else if (currentUser.role === 'STUDENT') {
            allowedRoles = ['TEACHER'];
        } else if (currentUser.role === 'ADMIN') {
            allowedRoles = ['TEACHER', 'PARENT', 'STUDENT', 'ADMIN'];
        }

        if (role && allowedRoles.includes(role)) {
            allowedRoles = [role];
        }

        const users = await this.prisma.user.findMany({
            where: {
                id: { not: currentUserId },
                role: { in: allowedRoles as any },
                isActive: true,
                OR: [
                    { email: { contains: query, mode: 'insensitive' } },
                    {
                        teacher: {
                            OR: [
                                { firstNameTh: { contains: query, mode: 'insensitive' } },
                                { lastNameTh: { contains: query, mode: 'insensitive' } },
                            ],
                        },
                    },
                    {
                        parent: {
                            OR: [
                                { firstNameTh: { contains: query, mode: 'insensitive' } },
                                { lastNameTh: { contains: query, mode: 'insensitive' } },
                            ],
                        },
                    },
                    {
                        student: {
                            OR: [
                                { firstNameTh: { contains: query, mode: 'insensitive' } },
                                { lastNameTh: { contains: query, mode: 'insensitive' } },
                            ],
                        },
                    },
                ],
            },
            select: {
                id: true,
                email: true,
                role: true,
                teacher: {
                    select: {
                        titleTh: true,
                        firstNameTh: true,
                        lastNameTh: true,
                    },
                },
                parent: {
                    select: {
                        titleTh: true,
                        firstNameTh: true,
                        lastNameTh: true,
                    },
                },
                student: {
                    select: {
                        firstNameTh: true,
                        lastNameTh: true,
                        studentCode: true,
                    },
                },
            },
            take: 20,
        });

        return users.map((user) => {
            let displayName = user.email;
            if (user.teacher) {
                displayName = `${user.teacher.titleTh}${user.teacher.firstNameTh} ${user.teacher.lastNameTh}`;
            } else if (user.parent) {
                displayName = `${user.parent.titleTh}${user.parent.firstNameTh} ${user.parent.lastNameTh}`;
            } else if (user.student) {
                displayName = `${user.student.firstNameTh} ${user.student.lastNameTh}`;
            }

            return {
                id: user.id,
                email: user.email,
                role: user.role,
                displayName,
            };
        });
    }
}

// Notifications Service

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
    CreateNotificationDto,
    CreateAnnouncementDto,
    UpdateAnnouncementDto,
    NotificationQueryDto,
} from './dto';

@Injectable()
export class NotificationsService {
    constructor(private readonly prisma: PrismaService) { }

    // =====================
    // User Notifications
    // =====================

    async getUserNotifications(userId: string, params: NotificationQueryDto) {
        const { page = 1, limit = 20, isRead, type } = params;

        const where: any = { userId };

        if (isRead !== undefined) {
            where.isRead = isRead;
        }

        if (type) {
            where.type = type;
        }

        return this.prisma.paginate('userNotification', {
            page,
            limit,
            where,
            orderBy: { createdAt: 'desc' },
        });
    }

    async create(data: CreateNotificationDto) {
        return this.prisma.userNotification.create({
            data: {
                userId: data.userId,
                type: data.type,
                title: data.title,
                content: data.content,
                link: data.link,
                data: data.data,
            },
        });
    }

    async createMany(notifications: CreateNotificationDto[]) {
        return this.prisma.userNotification.createMany({
            data: notifications.map((n) => ({
                userId: n.userId,
                type: n.type,
                title: n.title,
                content: n.content,
                link: n.link,
                data: n.data,
            })),
        });
    }

    async markAsRead(id: string) {
        const notification = await this.prisma.userNotification.findUnique({
            where: { id },
        });

        if (!notification) {
            throw new NotFoundException('ไม่พบการแจ้งเตือน');
        }

        return this.prisma.userNotification.update({
            where: { id },
            data: {
                isRead: true,
                readAt: new Date(),
            },
        });
    }

    async markAllAsRead(userId: string) {
        await this.prisma.userNotification.updateMany({
            where: { userId, isRead: false },
            data: {
                isRead: true,
                readAt: new Date(),
            },
        });

        return { message: 'อ่านการแจ้งเตือนทั้งหมดแล้ว' };
    }

    async getUnreadCount(userId: string) {
        const count = await this.prisma.userNotification.count({
            where: { userId, isRead: false },
        });

        return { count };
    }

    async delete(id: string) {
        await this.prisma.userNotification.delete({ where: { id } });
        return { message: 'ลบการแจ้งเตือนสำเร็จ' };
    }

    // =====================
    // Announcements
    // =====================

    async getAnnouncements(params: { page?: number; limit?: number; type?: string }) {
        const { page = 1, limit = 20, type } = params;

        const where: any = { isPublished: true };

        if (type) {
            where.type = type;
        }

        return this.prisma.paginate('announcement', {
            page,
            limit,
            where,
            orderBy: { publishedAt: 'desc' },
        });
    }

    async getAnnouncementById(id: string) {
        const announcement = await this.prisma.announcement.findUnique({
            where: { id },
        });

        if (!announcement) {
            throw new NotFoundException('ไม่พบประกาศ');
        }

        return announcement;
    }

    async createAnnouncement(data: CreateAnnouncementDto, createdById: string) {
        return this.prisma.announcement.create({
            data: {
                title: data.title,
                content: data.content,
                type: data.type,
                priority: data.priority ?? 'NORMAL',
                targetRoles: data.targetRoles ?? [],
                targetGradeLevels: data.targetGradeLevels ?? [],
                targetClassrooms: data.targetClassrooms ?? [],
                attachments: data.attachments,
                isPublished: data.isPublished ?? false,
                publishedAt: data.isPublished ? new Date() : null,
                createdById,
            },
        });
    }

    async updateAnnouncement(id: string, data: UpdateAnnouncementDto) {
        const announcement = await this.prisma.announcement.findUnique({
            where: { id },
        });

        if (!announcement) {
            throw new NotFoundException('ไม่พบประกาศ');
        }

        const updateData: any = { ...data };

        if (data.isPublished === true && !announcement.isPublished) {
            updateData.publishedAt = new Date();
        }

        return this.prisma.announcement.update({
            where: { id },
            data: updateData,
        });
    }

    async deleteAnnouncement(id: string) {
        await this.prisma.announcement.delete({ where: { id } });
        return { message: 'ลบประกาศสำเร็จ' };
    }

    async publishAnnouncement(id: string) {
        return this.prisma.announcement.update({
            where: { id },
            data: {
                isPublished: true,
                publishedAt: new Date(),
            },
        });
    }

    // =====================
    // Helper: Send notification to role
    // =====================

    async notifyByRole(role: string, notification: Omit<CreateNotificationDto, 'userId'>) {
        const users = await this.prisma.user.findMany({
            where: { role: role as any, isActive: true },
            select: { id: true },
        });

        const notifications = users.map((user) => ({
            ...notification,
            userId: user.id,
        }));

        return this.createMany(notifications);
    }

    async notifyByClassroom(classroomId: string, notification: Omit<CreateNotificationDto, 'userId'>) {
        const students = await this.prisma.student.findMany({
            where: { classroomId },
            select: { userId: true },
        });

        const notifications = students.map((student) => ({
            ...notification,
            userId: student.userId,
        }));

        return this.createMany(notifications);
    }
}

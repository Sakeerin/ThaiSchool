// Prisma Service - Database connection management

import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@school/database';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(PrismaService.name);

    constructor() {
        super({
            log: process.env.NODE_ENV === 'development'
                ? ['query', 'info', 'warn', 'error']
                : ['error'],
        });
    }

    async onModuleInit() {
        try {
            await this.$connect();
            this.logger.log('✅ Database connected successfully');
        } catch (error) {
            this.logger.error('❌ Database connection failed:', error);
            throw error;
        }
    }

    async onModuleDestroy() {
        await this.$disconnect();
        this.logger.log('Database disconnected');
    }

    // Helper for soft delete
    async softDelete(model: string, id: string) {
        return (this as any)[model].update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }

    // Helper for pagination
    async paginate<T>(
        model: string,
        params: {
            page?: number;
            limit?: number;
            where?: any;
            orderBy?: any;
            include?: any;
        },
    ): Promise<{ items: T[]; meta: { page: number; limit: number; total: number; totalPages: number } }> {
        const page = params.page || 1;
        const limit = params.limit || 20;
        const skip = (page - 1) * limit;

        const [items, total] = await Promise.all([
            (this as any)[model].findMany({
                where: params.where,
                orderBy: params.orderBy,
                include: params.include,
                skip,
                take: limit,
            }),
            (this as any)[model].count({ where: params.where }),
        ]);

        return {
            items,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
}

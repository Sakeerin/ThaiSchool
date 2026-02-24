// E2E Tests - Application smoke tests

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request, { Response } from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.setGlobalPrefix('api');
        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
                transform: true,
            }),
        );

        await app.init();
    }, 30000); // 30s timeout for DB connection

    afterAll(async () => {
        await app.close();
    });

    // ─────────────────────────────────────────────
    // Health Check
    // ─────────────────────────────────────────────

    describe('GET /api/health', () => {
        it('should return status ok', () => {
            return request(app.getHttpServer())
                .get('/api/health')
                .expect(200)
                .expect((res: Response) => {
                    expect(res.body.status).toBe('ok');
                    expect(res.body.timestamp).toBeDefined();
                    expect(res.body.uptime).toBeGreaterThanOrEqual(0);
                    expect(res.body.environment).toBeDefined();
                });
        });
    });

    // ─────────────────────────────────────────────
    // Auth Endpoints
    // ─────────────────────────────────────────────

    describe('POST /api/auth/login', () => {
        it('should return 401 for invalid credentials', () => {
            return request(app.getHttpServer())
                .post('/api/auth/login')
                .send({ email: 'invalid@school.ac.th', password: 'wrongpass' })
                .expect(401);
        });

        it('should return 400 for malformed request (missing email)', () => {
            return request(app.getHttpServer())
                .post('/api/auth/login')
                .send({ password: 'somepass' })
                .expect(400);
        });

        it('should return 400 for invalid email format', () => {
            return request(app.getHttpServer())
                .post('/api/auth/login')
                .send({ email: 'not-an-email', password: 'somepass' })
                .expect(400);
        });
    });

    describe('POST /api/auth/register', () => {
        it('should return 400 for weak password (no uppercase)', () => {
            return request(app.getHttpServer())
                .post('/api/auth/register')
                .send({ email: 'new@school.ac.th', password: 'password1!', role: 'STUDENT' })
                .expect(400);
        });

        it('should return 400 for invalid role', () => {
            return request(app.getHttpServer())
                .post('/api/auth/register')
                .send({ email: 'new@school.ac.th', password: 'Password1!', role: 'SUPERADMIN' })
                .expect(400);
        });
    });

    describe('GET /api/auth/profile', () => {
        it('should return 401 without JWT token', () => {
            return request(app.getHttpServer())
                .get('/api/auth/profile')
                .expect(401);
        });
    });
});

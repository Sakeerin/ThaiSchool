// Thai School LMS - API Entry Point

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';
import compression from 'compression';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Security
    app.use(helmet());
    app.use(compression());

    // CORS
    app.enableCors({
        origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
        credentials: true,
    });

    // Global prefix
    app.setGlobalPrefix('api');

    // Validation pipe
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            transformOptions: {
                enableImplicitConversion: true,
            },
        }),
    );

    // Swagger API documentation
    const config = new DocumentBuilder()
        .setTitle('Thai School LMS API')
        .setDescription('Learning Management System for Thai Schools (ป.1 - ม.6)')
        .setVersion('1.0')
        .addBearerAuth()
        .addTag('auth', 'Authentication endpoints')
        .addTag('users', 'User management')
        .addTag('students', 'Student management')
        .addTag('teachers', 'Teacher management')
        .addTag('classrooms', 'Classroom management')
        .addTag('subjects', 'Subject management')
        .addTag('lessons', 'Lesson content')
        .addTag('assignments', 'Assignments & submissions')
        .addTag('exams', 'Exams & question bank')
        .addTag('grades', 'Grading & reports')
        .addTag('notifications', 'Notifications & messaging')
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    const port = process.env.API_PORT || 4000;
    await app.listen(port);

    console.log(`🚀 Thai School LMS API running on: http://localhost:${port}`);
    console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}

bootstrap();

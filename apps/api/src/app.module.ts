// Thai School LMS - Root App Module

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// Core modules
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { StudentsModule } from './modules/students/students.module';
import { TeachersModule } from './modules/teachers/teachers.module';
import { ParentsModule } from './modules/parents/parents.module';
import { ClassroomsModule } from './modules/classrooms/classrooms.module';
import { SubjectsModule } from './modules/subjects/subjects.module';
import { LessonsModule } from './modules/lessons/lessons.module';
import { AssignmentsModule } from './modules/assignments/assignments.module';
import { ExamsModule } from './modules/exams/exams.module';
import { GradesModule } from './modules/grades/grades.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AdminModule } from './modules/admin/admin.module';
import { UploadModule } from './modules/upload/upload.module';

@Module({
    imports: [
        // Configuration
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ['.env.local', '.env'],
        }),

        // Database
        DatabaseModule,

        // Feature modules
        AuthModule,
        UsersModule,
        StudentsModule,
        TeachersModule,
        ParentsModule,
        ClassroomsModule,
        SubjectsModule,
        LessonsModule,
        AssignmentsModule,
        ExamsModule,
        GradesModule,
        NotificationsModule,
        AdminModule,
        UploadModule,
    ],
})
export class AppModule { }

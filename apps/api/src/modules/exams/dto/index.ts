// Exams DTOs

import { IsString, IsOptional, IsNotEmpty, IsNumber, IsBoolean, IsEnum, IsDate, IsArray, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ExamType, QuestionType, Difficulty } from '@school/database';

export class CreateExamDto {
    @IsString()
    @IsNotEmpty({ message: 'กรุณาเลือกรายวิชา' })
    subjectInstanceId: string;

    @IsString()
    @IsNotEmpty({ message: 'กรุณากรอกชื่อข้อสอบ' })
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    instructions?: string;

    @IsEnum(ExamType, { message: 'ประเภทข้อสอบไม่ถูกต้อง' })
    type: ExamType;

    @Type(() => Number)
    @IsNumber()
    maxScore: number;

    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    passingScore?: number;

    @Type(() => Date)
    @IsDate()
    startTime: Date;

    @Type(() => Date)
    @IsDate()
    endTime: Date;

    @Type(() => Number)
    @IsInt()
    duration: number; // minutes

    @IsBoolean()
    @IsOptional()
    shuffleQuestions?: boolean;

    @IsBoolean()
    @IsOptional()
    shuffleOptions?: boolean;

    @Type(() => Number)
    @IsInt()
    @IsOptional()
    maxAttempts?: number;
}

export class UpdateExamDto {
    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @Type(() => Date)
    @IsDate()
    @IsOptional()
    startTime?: Date;

    @Type(() => Date)
    @IsDate()
    @IsOptional()
    endTime?: Date;

    @IsBoolean()
    @IsOptional()
    isPublished?: boolean;
}

export class CreateQuestionDto {
    @IsString()
    @IsNotEmpty()
    questionBankId: string;

    @IsEnum(QuestionType, { message: 'ประเภทคำถามไม่ถูกต้อง' })
    type: QuestionType;

    @IsString()
    @IsNotEmpty({ message: 'กรุณากรอกคำถาม' })
    content: string;

    @IsString()
    @IsOptional()
    explanation?: string;

    @IsOptional()
    options?: any[]; // For MCQ: {id, text, isCorrect}

    @IsOptional()
    matchingPairs?: any[]; // For matching: {left, right}

    @IsString()
    @IsOptional()
    correctAnswer?: string; // For fill-in-blank

    @IsArray()
    @IsOptional()
    acceptedAnswers?: string[]; // Alternative correct answers

    @IsEnum(Difficulty)
    @IsOptional()
    difficulty?: Difficulty;

    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    points?: number;

    @IsArray()
    @IsOptional()
    tags?: string[];
}

export class AddExamQuestionDto {
    @IsString()
    @IsNotEmpty()
    questionId: string;

    @Type(() => Number)
    @IsInt()
    @IsOptional()
    order?: number;

    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    points?: number;
}

export class SubmitExamAnswerDto {
    @IsString()
    @IsNotEmpty()
    questionId: string;

    answer: any; // Can be string, number, array depending on question type
}

export class ExamQueryDto {
    @IsOptional()
    page?: number;

    @IsOptional()
    limit?: number;

    @IsString()
    @IsOptional()
    subjectInstanceId?: string;

    @IsEnum(ExamType)
    @IsOptional()
    type?: ExamType;

    @IsBoolean()
    @IsOptional()
    isPublished?: boolean;
}

export class CreateQuestionBankDto {
    @IsString()
    @IsNotEmpty()
    subjectId: string;

    @IsString()
    @IsNotEmpty({ message: 'กรุณากรอกชื่อคลังข้อสอบ' })
    name: string;

    @IsString()
    @IsOptional()
    description?: string;
}

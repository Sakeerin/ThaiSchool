// Student Transcript Page - Complete Academic Record (ปพ.6 style)

'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Printer, Download, GraduationCap, School, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useStudentGPAX } from '@/hooks/use-grades';
import api from '@/lib/api';

// Student profile interface
interface StudentProfile {
    id: string;
    studentCode: string;
    titleTh: string;
    firstNameTh: string;
    lastNameTh: string;
    titleEn?: string;
    firstNameEn?: string;
    lastNameEn?: string;
    nationalId: string;
    birthDate: string;
    enrollmentDate: string;
    classroom?: {
        name: string;
        gradeLevel?: {
            nameTh: string;
        };
    };
}

// Grade color mapping
const getGradeColor = (label: string) => {
    const colors: Record<string, string> = {
        'A': 'bg-green-500',
        'B+': 'bg-lime-500',
        'B': 'bg-yellow-500',
        'C+': 'bg-amber-500',
        'C': 'bg-orange-500',
        'D+': 'bg-red-400',
        'D': 'bg-red-500',
        'F': 'bg-gray-500',
    };
    return colors[label] || 'bg-gray-400';
};

// Placeholder for current student
const useCurrentStudent = () => {
    const [studentId, setStudentId] = useState<string | null>(null);

    useEffect(() => {
        const stored = typeof window !== 'undefined' ? localStorage.getItem('studentId') : null;
        setStudentId(stored);
    }, []);

    return studentId;
};

export default function StudentTranscriptPage() {
    const studentId = useCurrentStudent();
    const printRef = useRef<HTMLDivElement>(null);
    const [student, setStudent] = useState<StudentProfile | null>(null);
    const [loadingStudent, setLoadingStudent] = useState(true);

    const { data: gpaxData, isLoading: loadingGPAX } = useStudentGPAX(studentId || '');

    // Fetch student profile
    useEffect(() => {
        const fetchStudent = async () => {
            if (!studentId) return;
            try {
                const { data } = await api.get(`/students/${studentId}`);
                setStudent(data);
            } catch (error) {
                console.error('Failed to fetch student:', error);
            } finally {
                setLoadingStudent(false);
            }
        };
        fetchStudent();
    }, [studentId]);

    const handlePrint = () => {
        window.print();
    };

    if (!studentId) {
        return (
            <div className="text-center py-12">
                <GraduationCap className="h-12 w-12 mx-auto text-gray-400" />
                <p className="mt-4 text-gray-500">กรุณาเข้าสู่ระบบเพื่อดูทรานสคริปต์</p>
            </div>
        );
    }

    const loading = loadingStudent || loadingGPAX;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between print:hidden">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/student/grades">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            ทรานสคริปต์
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            ใบแสดงผลการเรียนตลอดหลักสูตร (ปพ.6)
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" disabled>
                        <Download className="w-4 h-4 mr-2" />
                        ดาวน์โหลด PDF
                    </Button>
                    <Button onClick={handlePrint}>
                        <Printer className="w-4 h-4 mr-2" />
                        พิมพ์
                    </Button>
                </div>
            </div>

            {/* Printable Transcript Content */}
            <div ref={printRef} className="print:p-8">
                {loading ? (
                    <Card>
                        <CardContent className="p-8">
                            <Skeleton className="h-8 w-64 mx-auto mb-6" />
                            <Skeleton className="h-[600px] w-full" />
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="print:shadow-none print:border-none">
                        <CardContent className="p-8">
                            {/* Document Header */}
                            <div className="text-center mb-8">
                                <div className="flex items-center justify-center gap-4 mb-4">
                                    <School className="w-12 h-12 text-blue-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">
                                    ใบแสดงผลการเรียน
                                </h2>
                                <h3 className="text-lg text-gray-600 mt-1">
                                    Transcript of Academic Record
                                </h3>
                                <p className="text-sm text-gray-500 mt-2">
                                    (ปพ.6 / Academic Transcript)
                                </p>
                            </div>

                            <Separator className="my-6" />

                            {/* Student Info Section */}
                            <div className="grid grid-cols-2 gap-6 mb-8">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <User className="w-5 h-5 text-gray-400" />
                                        <span className="font-medium">ข้อมูลนักเรียน</span>
                                    </div>
                                    <div className="ml-7 space-y-2 text-sm">
                                        <p><span className="text-gray-500">ชื่อ-นามสกุล:</span> {student?.titleTh}{student?.firstNameTh} {student?.lastNameTh}</p>
                                        {student?.firstNameEn && (
                                            <p><span className="text-gray-500">Name:</span> {student?.titleEn} {student?.firstNameEn} {student?.lastNameEn}</p>
                                        )}
                                        <p><span className="text-gray-500">รหัสนักเรียน:</span> {student?.studentCode}</p>
                                        <p><span className="text-gray-500">เลขประจำตัวประชาชน:</span> {student?.nationalId}</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <GraduationCap className="w-5 h-5 text-gray-400" />
                                        <span className="font-medium">ข้อมูลการศึกษา</span>
                                    </div>
                                    <div className="ml-7 space-y-2 text-sm">
                                        <p><span className="text-gray-500">ระดับชั้น:</span> {student?.classroom?.gradeLevel?.nameTh || '-'}</p>
                                        <p><span className="text-gray-500">ห้อง:</span> {student?.classroom?.name || '-'}</p>
                                        <p><span className="text-gray-500">วันที่เข้าเรียน:</span> {student?.enrollmentDate ? new Date(student.enrollmentDate).toLocaleDateString('th-TH') : '-'}</p>
                                    </div>
                                </div>
                            </div>

                            <Separator className="my-6" />

                            {/* GPAX Summary */}
                            <div className="mb-8">
                                <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6">
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">ผลการเรียนเฉลี่ยสะสม (GPAX)</p>
                                        <p className="text-4xl font-bold text-gray-900 dark:text-white mt-1">
                                            {gpaxData?.gpax?.toFixed(2) ?? '0.00'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-600 dark:text-gray-400">หน่วยกิตสะสม</p>
                                        <p className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mt-1">
                                            {gpaxData?.totalCredits ?? 0}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Semester Records */}
                            <div className="space-y-6">
                                <h4 className="text-lg font-semibold">ผลการเรียนรายภาคเรียน</h4>

                                {gpaxData?.semesters?.map((semesterData, idx) => (
                                    <div key={idx} className="border rounded-lg overflow-hidden">
                                        {/* Semester Header */}
                                        <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 flex items-center justify-between">
                                            <div>
                                                <span className="font-medium">
                                                    {semesterData.semester.academicYear.name}
                                                </span>
                                                <span className="text-gray-500 mx-2">/</span>
                                                <span>{semesterData.semester.name}</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-sm text-gray-500">
                                                    {semesterData.credits} หน่วยกิต
                                                </span>
                                                <Badge variant="outline" className="text-blue-600 border-blue-300">
                                                    GPA: {semesterData.gpa.toFixed(2)}
                                                </Badge>
                                            </div>
                                        </div>

                                        {/* Grades Table - This would need actual grade data */}
                                        <div className="p-4">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="border-b">
                                                        <th className="text-left py-2 font-medium">รหัสวิชา</th>
                                                        <th className="text-left py-2 font-medium">ชื่อวิชา</th>
                                                        <th className="text-center py-2 font-medium">หน่วยกิต</th>
                                                        <th className="text-center py-2 font-medium">เกรด</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr className="text-gray-500">
                                                        <td colSpan={4} className="py-4 text-center">
                                                            รายละเอียดวิชาจะแสดงเมื่อมีข้อมูลเพิ่มเติม
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ))}

                                {(!gpaxData?.semesters || gpaxData.semesters.length === 0) && (
                                    <Card>
                                        <CardContent className="py-12 text-center">
                                            <GraduationCap className="h-12 w-12 mx-auto text-gray-400" />
                                            <p className="mt-4 text-gray-500">ยังไม่มีข้อมูลผลการเรียน</p>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>

                            {/* Grade Scale Reference */}
                            <Separator className="my-8" />
                            <div className="text-sm">
                                <h5 className="font-medium mb-3">เกณฑ์การตัดเกรด</h5>
                                <div className="flex flex-wrap gap-4">
                                    {[
                                        { label: 'A', range: '80-100', point: '4.0' },
                                        { label: 'B+', range: '75-79', point: '3.5' },
                                        { label: 'B', range: '70-74', point: '3.0' },
                                        { label: 'C+', range: '65-69', point: '2.5' },
                                        { label: 'C', range: '60-64', point: '2.0' },
                                        { label: 'D+', range: '55-59', point: '1.5' },
                                        { label: 'D', range: '50-54', point: '1.0' },
                                        { label: 'F', range: '0-49', point: '0' },
                                    ].map(({ label, range, point }) => (
                                        <div key={label} className="flex items-center gap-2">
                                            <Badge className={`${getGradeColor(label)} text-white`}>
                                                {label}
                                            </Badge>
                                            <span className="text-gray-500">
                                                = {range}% ({point})
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Official Signature Section (for print) */}
                            <div className="mt-12 pt-8 border-t grid grid-cols-3 gap-8 text-center print:block hidden">
                                <div>
                                    <div className="h-16 border-b border-dashed border-gray-400 mb-2" />
                                    <p className="text-sm">ครูที่ปรึกษา</p>
                                </div>
                                <div>
                                    <div className="h-16 border-b border-dashed border-gray-400 mb-2" />
                                    <p className="text-sm">หัวหน้าวิชาการ</p>
                                </div>
                                <div>
                                    <div className="h-16 border-b border-dashed border-gray-400 mb-2" />
                                    <p className="text-sm">ผู้อำนวยการโรงเรียน</p>
                                </div>
                            </div>

                            {/* Print Date */}
                            <p className="text-xs text-gray-400 text-center mt-8 print:mt-12">
                                พิมพ์เมื่อ: {new Date().toLocaleDateString('th-TH', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .print\\:p-8,
                    .print\\:p-8 * {
                        visibility: visible;
                    }
                    .print\\:p-8 {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                    .print\\:block {
                        display: block !important;
                    }
                    .print\\:shadow-none {
                        box-shadow: none !important;
                    }
                    .print\\:border-none {
                        border: none !important;
                    }
                }
            `}</style>
        </div>
    );
}

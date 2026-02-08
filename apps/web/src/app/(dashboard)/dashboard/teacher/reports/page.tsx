// Teacher Reports Dashboard - Generate Thai Official Report Cards

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { FileText, Download, Printer, Users, GraduationCap, BookOpen, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { academicApi, Semester, Classroom } from '@/lib/api/subjects';
import api from '@/lib/api';

interface Student {
    id: string;
    studentCode: string;
    studentNumber: number;
    titleTh: string;
    firstNameTh: string;
    lastNameTh: string;
    classroom?: {
        name: string;
        gradeLevel?: {
            nameTh: string;
        };
    };
}

export default function TeacherReportsPage() {
    const searchParams = useSearchParams();
    const initialTab = searchParams.get('type') === 'report-card' ? 'pp5' : 'overview';

    const [activeTab, setActiveTab] = useState(initialTab);
    const [semesters, setSemesters] = useState<Semester[]>([]);
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedSemester, setSelectedSemester] = useState<string>('');
    const [selectedClassroom, setSelectedClassroom] = useState<string>('');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [reportDialogOpen, setReportDialogOpen] = useState(false);
    const [reportType, setReportType] = useState<'pp5' | 'pp6'>('pp5');

    // Fetch semesters
    useEffect(() => {
        const fetchSemesters = async () => {
            try {
                const data = await academicApi.getSemesters();
                setSemesters(data);
                const current = data.find((s) => s.isCurrent);
                if (current) setSelectedSemester(current.id);
                else if (data.length > 0) setSelectedSemester(data[0].id);
            } catch (error) {
                console.error('Failed to fetch semesters:', error);
            }
        };
        fetchSemesters();
    }, []);

    // Fetch classrooms based on semester
    useEffect(() => {
        const fetchClassrooms = async () => {
            if (!selectedSemester) return;
            try {
                const data = await academicApi.getClassroomsBySemester(selectedSemester);
                setClassrooms(data);
            } catch (error) {
                console.error('Failed to fetch classrooms:', error);
            }
        };
        fetchClassrooms();
    }, [selectedSemester]);

    // Fetch students based on classroom
    useEffect(() => {
        const fetchStudents = async () => {
            if (!selectedClassroom) {
                setStudents([]);
                return;
            }
            setLoading(true);
            try {
                const { data } = await api.get(`/students`, {
                    params: { classroomId: selectedClassroom },
                });
                setStudents(data.items || data);
            } catch (error) {
                console.error('Failed to fetch students:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, [selectedClassroom]);

    const filteredStudents = students.filter((student) => {
        const fullName = `${student.firstNameTh} ${student.lastNameTh} ${student.studentCode}`.toLowerCase();
        return fullName.includes(search.toLowerCase());
    });

    const handleGenerateReport = (student: Student, type: 'pp5' | 'pp6') => {
        setSelectedStudent(student);
        setReportType(type);
        setReportDialogOpen(true);
    };

    const handlePrintReport = () => {
        // In a real implementation, this would open a printable report view
        window.print();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        รายงานและเอกสาร
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        สร้างใบรายงานผล ปพ.5 และ ปพ.6
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">ภาพรวม</TabsTrigger>
                    <TabsTrigger value="pp5">ปพ.5 (ใบรายงานผลภาคเรียน)</TabsTrigger>
                    <TabsTrigger value="pp6">ปพ.6 (ใบแสดงผลการเรียน)</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('pp5')}>
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                        <FileText className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-base">ปพ.5</CardTitle>
                                        <CardDescription>ใบรายงานผลการเรียนประจำภาคเรียน</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-500">
                                    ใบแสดงผลการเรียนรายภาคเรียน แสดงเกรดและคะแนนของนักเรียนในแต่ละวิชา
                                </p>
                                <Button variant="outline" className="mt-4 w-full">
                                    สร้าง ปพ.5
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('pp6')}>
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                        <GraduationCap className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-base">ปพ.6</CardTitle>
                                        <CardDescription>ใบแสดงผลการเรียนตลอดหลักสูตร</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-500">
                                    ทรานสคริปต์แสดงผลการเรียนสะสมตั้งแต่เข้าเรียนจนถึงปัจจุบัน
                                </p>
                                <Button variant="outline" className="mt-4 w-full">
                                    สร้าง ปพ.6
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                        <BookOpen className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-base">รายงานสรุป</CardTitle>
                                        <CardDescription>สถิติและรายงานเชิงวิเคราะห์</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-500">
                                    รายงานสรุปสถิติ เปรียบเทียบผลการเรียน และวิเคราะห์แนวโน้ม
                                </p>
                                <Button variant="outline" className="mt-4 w-full" disabled>
                                    เร็วๆ นี้
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid gap-4 md:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">ห้องเรียนทั้งหมด</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{classrooms.length}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">นักเรียนทั้งหมด</CardTitle>
                                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">-</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">ปพ.5 ที่สร้างแล้ว</CardTitle>
                                <FileText className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">-</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">ปพ.6 ที่สร้างแล้ว</CardTitle>
                                <FileText className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">-</div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* PP5 Tab */}
                <TabsContent value="pp5" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>ปพ.5 - ใบรายงานผลการเรียนประจำภาคเรียน</CardTitle>
                            <CardDescription>
                                เลือกภาคเรียนและห้องเรียนเพื่อสร้างใบรายงานผลการเรียน
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Filters */}
                            <div className="flex flex-wrap gap-4">
                                <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                                    <SelectTrigger className="w-[280px]">
                                        <SelectValue placeholder="เลือกภาคเรียน" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {semesters.map((semester) => (
                                            <SelectItem key={semester.id} value={semester.id}>
                                                {semester.academicYear?.name} / {semester.name}
                                                {semester.isCurrent && <Badge variant="secondary" className="ml-2">ปัจจุบัน</Badge>}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={selectedClassroom} onValueChange={setSelectedClassroom}>
                                    <SelectTrigger className="w-[200px]">
                                        <SelectValue placeholder="เลือกห้องเรียน" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classrooms.map((classroom) => (
                                            <SelectItem key={classroom.id} value={classroom.id}>
                                                {classroom.gradeLevel?.nameTh} / {classroom.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <div className="relative flex-1 max-w-sm">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        placeholder="ค้นหานักเรียน..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            {/* Student List */}
                            {selectedClassroom ? (
                                loading ? (
                                    <div className="space-y-2">
                                        {[1, 2, 3].map((i) => (
                                            <Skeleton key={i} className="h-16 w-full" />
                                        ))}
                                    </div>
                                ) : filteredStudents.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500">
                                        ไม่พบนักเรียนในห้องนี้
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {filteredStudents.map((student) => (
                                            <div
                                                key={student.id}
                                                className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-medium">
                                                        {student.studentNumber}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">
                                                            {student.titleTh}{student.firstNameTh} {student.lastNameTh}
                                                        </p>
                                                        <p className="text-sm text-gray-500">{student.studentCode}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleGenerateReport(student, 'pp5')}
                                                    >
                                                        <FileText className="w-4 h-4 mr-2" />
                                                        สร้าง ปพ.5
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Bulk Actions */}
                                        <div className="flex justify-end gap-2 pt-4 border-t">
                                            <Button variant="outline" disabled>
                                                <Download className="w-4 h-4 mr-2" />
                                                ดาวน์โหลดทั้งหมด
                                            </Button>
                                            <Button disabled>
                                                <Printer className="w-4 h-4 mr-2" />
                                                พิมพ์ทั้งหมด
                                            </Button>
                                        </div>
                                    </div>
                                )
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    <Filter className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                                    <p>เลือกห้องเรียนเพื่อแสดงรายชื่อนักเรียน</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* PP6 Tab */}
                <TabsContent value="pp6" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>ปพ.6 - ใบแสดงผลการเรียนตลอดหลักสูตร (ทรานสคริปต์)</CardTitle>
                            <CardDescription>
                                เลือกห้องเรียนเพื่อสร้างทรานสคริปต์สำหรับนักเรียน
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Filters */}
                            <div className="flex flex-wrap gap-4">
                                <Select value={selectedClassroom} onValueChange={setSelectedClassroom}>
                                    <SelectTrigger className="w-[200px]">
                                        <SelectValue placeholder="เลือกห้องเรียน" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classrooms.map((classroom) => (
                                            <SelectItem key={classroom.id} value={classroom.id}>
                                                {classroom.gradeLevel?.nameTh} / {classroom.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <div className="relative flex-1 max-w-sm">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        placeholder="ค้นหานักเรียน..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            {/* Student List */}
                            {selectedClassroom ? (
                                loading ? (
                                    <div className="space-y-2">
                                        {[1, 2, 3].map((i) => (
                                            <Skeleton key={i} className="h-16 w-full" />
                                        ))}
                                    </div>
                                ) : filteredStudents.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500">
                                        ไม่พบนักเรียนในห้องนี้
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {filteredStudents.map((student) => (
                                            <div
                                                key={student.id}
                                                className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 font-medium">
                                                        {student.studentNumber}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">
                                                            {student.titleTh}{student.firstNameTh} {student.lastNameTh}
                                                        </p>
                                                        <p className="text-sm text-gray-500">{student.studentCode}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleGenerateReport(student, 'pp6')}
                                                    >
                                                        <GraduationCap className="w-4 h-4 mr-2" />
                                                        สร้าง ปพ.6
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    <Filter className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                                    <p>เลือกห้องเรียนเพื่อแสดงรายชื่อนักเรียน</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Report Preview Dialog */}
            <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {reportType === 'pp5' ? 'ปพ.5 - ใบรายงานผลการเรียน' : 'ปพ.6 - ทรานสคริปต์'}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedStudent?.titleTh}{selectedStudent?.firstNameTh} {selectedStudent?.lastNameTh} ({selectedStudent?.studentCode})
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        {/* Report Preview Content */}
                        <Card>
                            <CardContent className="p-8">
                                <div className="text-center mb-8">
                                    <h2 className="text-xl font-bold">
                                        {reportType === 'pp5' ? 'ใบรายงานผลการเรียนประจำภาคเรียน' : 'ใบแสดงผลการเรียนตลอดหลักสูตร'}
                                    </h2>
                                    <p className="text-gray-500 mt-1">
                                        {reportType === 'pp5' ? 'Semester Report Card' : 'Academic Transcript'}
                                    </p>
                                </div>

                                <div className="space-y-4 text-sm">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-gray-500">ชื่อ-นามสกุล:</span>{' '}
                                            {selectedStudent?.titleTh}{selectedStudent?.firstNameTh} {selectedStudent?.lastNameTh}
                                        </div>
                                        <div>
                                            <span className="text-gray-500">รหัสนักเรียน:</span>{' '}
                                            {selectedStudent?.studentCode}
                                        </div>
                                    </div>

                                    <div className="py-8 text-center text-gray-400 border rounded-lg">
                                        รายละเอียดเกรดจะแสดงที่นี่เมื่อมีข้อมูล
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setReportDialogOpen(false)}>
                            ปิด
                        </Button>
                        <Button variant="outline" disabled>
                            <Download className="w-4 h-4 mr-2" />
                            ดาวน์โหลด PDF
                        </Button>
                        <Button onClick={handlePrintReport}>
                            <Printer className="w-4 h-4 mr-2" />
                            พิมพ์
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

import React, { useState, useEffect } from "react";
import { Calendar, BarChart3, Users, Download, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { cn } from "@/lib/utils";

interface AttendanceRecord {
  id: string;
  studentId: string;
  classId: string;
  subjectId: string;
  date: string;
  status: 'hadir' | 'sakit' | 'ijin' | 'alfa';
  notes?: string;
}

interface Student {
  id: string;
  name: string;
  classId: string;
}

interface Class {
  id: string;
  name: string;
}

interface Subject {
  id: string;
  name: string;
}

interface AttendanceSummary {
  studentId: string;
  studentName: string;
  hadir: number;
  sakit: number;
  ijin: number;
  alfa: number;
  total: number;
  percentage: number;
}

export const AttendanceReport = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [startDate, setStartDate] = useState<Date>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date>(endOfMonth(new Date()));
  const [attendanceSummary, setAttendanceSummary] = useState<AttendanceSummary[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    generateReport();
  }, [selectedClass, selectedSubject, startDate, endDate, attendanceRecords, students]);

  const loadData = () => {
    const savedClasses = JSON.parse(localStorage.getItem('classes') || '[]');
    const savedSubjects = JSON.parse(localStorage.getItem('subjects') || '[]');
    const savedStudents = JSON.parse(localStorage.getItem('students') || '[]');
    const savedAttendance = JSON.parse(localStorage.getItem('attendance') || '[]');
    
    setClasses(savedClasses);
    setSubjects(savedSubjects);
    setStudents(savedStudents);
    setAttendanceRecords(savedAttendance);
  };

  const generateReport = () => {
    if (!selectedClass || !selectedSubject) {
      setAttendanceSummary([]);
      return;
    }

    const classStudents = students.filter(student => student.classId === selectedClass);
    const startDateStr = format(startDate, 'yyyy-MM-dd');
    const endDateStr = format(endDate, 'yyyy-MM-dd');

    const filteredRecords = attendanceRecords.filter(record => 
      record.classId === selectedClass &&
      record.subjectId === selectedSubject &&
      record.date >= startDateStr &&
      record.date <= endDateStr
    );

    const summary: AttendanceSummary[] = classStudents.map(student => {
      const studentRecords = filteredRecords.filter(record => record.studentId === student.id);
      
      const hadir = studentRecords.filter(r => r.status === 'hadir').length;
      const sakit = studentRecords.filter(r => r.status === 'sakit').length;
      const ijin = studentRecords.filter(r => r.status === 'ijin').length;
      const alfa = studentRecords.filter(r => r.status === 'alfa').length;
      const total = studentRecords.length;
      const percentage = total > 0 ? (hadir / total) * 100 : 0;

      return {
        studentId: student.id,
        studentName: student.name,
        hadir,
        sakit,
        ijin,
        alfa,
        total,
        percentage
      };
    });

    // Sort by percentage descending
    summary.sort((a, b) => b.percentage - a.percentage);
    setAttendanceSummary(summary);
  };

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 75) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getPercentageBg = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-100';
    if (percentage >= 75) return 'bg-yellow-100';
    if (percentage >= 60) return 'bg-orange-100';
    return 'bg-red-100';
  };

  const exportToCSV = () => {
    if (attendanceSummary.length === 0) return;

    const headers = ['Nama Siswa', 'Hadir', 'Sakit', 'Ijin', 'Alfa', 'Total', 'Persentase Kehadiran'];
    const csvContent = [
      headers.join(','),
      ...attendanceSummary.map(row => [
        row.studentName,
        row.hadir,
        row.sakit,
        row.ijin,
        row.alfa,
        row.total,
        `${row.percentage.toFixed(1)}%`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `rekap-kehadiran-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalStats = attendanceSummary.reduce((acc, curr) => ({
    hadir: acc.hadir + curr.hadir,
    sakit: acc.sakit + curr.sakit,
    ijin: acc.ijin + curr.ijin,
    alfa: acc.alfa + curr.alfa,
    total: acc.total + curr.total
  }), { hadir: 0, sakit: 0, ijin: 0, alfa: 0, total: 0 });

  const overallPercentage = totalStats.total > 0 ? (totalStats.hadir / totalStats.total) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-gray-900">
            Rekap Kehadiran Siswa
          </h1>
          <p className="text-gray-600">Laporan dan analisis kehadiran siswa</p>
        </div>
        <BarChart3 size={32} className="text-blue-600" />
      </div>

      {/* Filter Section */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center">
            <Filter size={20} className="mr-2" />
            Filter Laporan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="class" className="text-gray-700">Kelas</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="bg-white border-gray-300">
                  <SelectValue placeholder="Pilih kelas" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="subject" className="text-gray-700">Mata Pelajaran</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="bg-white border-gray-300">
                  <SelectValue placeholder="Pilih mata pelajaran" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="startDate" className="text-gray-700">Tanggal Mulai</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-white border-gray-300",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "dd/MM/yyyy") : <span>Pilih tanggal</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => date && setStartDate(date)}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <Label htmlFor="endDate" className="text-gray-700">Tanggal Akhir</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-white border-gray-300",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "dd/MM/yyyy") : <span>Pilih tanggal</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => date && setEndDate(date)}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      {selectedClass && selectedSubject && attendanceSummary.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Total Hadir</p>
                  <p className="text-2xl font-bold text-green-700">{totalStats.hadir}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-600 text-sm font-medium">Total Sakit</p>
                  <p className="text-2xl font-bold text-yellow-700">{totalStats.sakit}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Total Ijin</p>
                  <p className="text-2xl font-bold text-blue-700">{totalStats.ijin}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-600 text-sm font-medium">Total Alfa</p>
                  <p className="text-2xl font-bold text-red-700">{totalStats.alfa}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Report Table */}
      {selectedClass && selectedSubject && attendanceSummary.length > 0 && (
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-gray-900">
                  Rekap Kehadiran - {classes.find(c => c.id === selectedClass)?.name} - {subjects.find(s => s.id === selectedSubject)?.name}
                </CardTitle>
                <p className="text-gray-600">
                  Periode: {format(startDate, "dd/MM/yyyy")} - {format(endDate, "dd/MM/yyyy")}
                </p>
                <p className="text-gray-600">
                  Persentase Kehadiran Keseluruhan: <span className={cn("font-semibold", getPercentageColor(overallPercentage))}>{overallPercentage.toFixed(1)}%</span>
                </p>
              </div>
              <Button onClick={exportToCSV} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Download size={16} className="mr-2" />
                Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Siswa</TableHead>
                  <TableHead className="text-center">Hadir</TableHead>
                  <TableHead className="text-center">Sakit</TableHead>
                  <TableHead className="text-center">Ijin</TableHead>
                  <TableHead className="text-center">Alfa</TableHead>
                  <TableHead className="text-center">Total</TableHead>
                  <TableHead className="text-center">Persentase</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceSummary.map((student) => (
                  <TableRow key={student.studentId}>
                    <TableCell className="font-medium">{student.studentName}</TableCell>
                    <TableCell className="text-center text-green-600 font-semibold">{student.hadir}</TableCell>
                    <TableCell className="text-center text-yellow-600 font-semibold">{student.sakit}</TableCell>
                    <TableCell className="text-center text-blue-600 font-semibold">{student.ijin}</TableCell>
                    <TableCell className="text-center text-red-600 font-semibold">{student.alfa}</TableCell>
                    <TableCell className="text-center font-semibold">{student.total}</TableCell>
                    <TableCell className="text-center">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-sm font-semibold",
                        getPercentageColor(student.percentage),
                        getPercentageBg(student.percentage)
                      )}>
                        {student.percentage.toFixed(1)}%
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {selectedClass && selectedSubject && attendanceSummary.length === 0 && (
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="text-center py-12">
            <BarChart3 size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">Tidak ada data kehadiran untuk periode yang dipilih</p>
          </CardContent>
        </Card>
      )}

      {(!selectedClass || !selectedSubject) && (
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="text-center py-12">
            <Filter size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">Pilih kelas dan mata pelajaran untuk melihat rekap kehadiran</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

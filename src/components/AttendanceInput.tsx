
import React, { useState, useEffect } from "react";
import { Calendar, Users, BookOpen, Save, UserCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
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

export const AttendanceInput = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [attendanceData, setAttendanceData] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      const classStudents = students.filter(student => student.classId === selectedClass);
      setFilteredStudents(classStudents);
      loadExistingAttendance();
    }
  }, [selectedClass, selectedSubject, selectedDate, students]);

  const loadData = () => {
    const savedClasses = JSON.parse(localStorage.getItem('classes') || '[]');
    const savedSubjects = JSON.parse(localStorage.getItem('subjects') || '[]');
    const savedStudents = JSON.parse(localStorage.getItem('students') || '[]');
    
    setClasses(savedClasses);
    setSubjects(savedSubjects);
    setStudents(savedStudents);
  };

  const loadExistingAttendance = () => {
    if (!selectedClass || !selectedSubject || !selectedDate) return;
    
    const savedAttendance = JSON.parse(localStorage.getItem('attendance') || '[]');
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    
    const existingRecords = savedAttendance.filter((record: AttendanceRecord) => 
      record.classId === selectedClass && 
      record.subjectId === selectedSubject && 
      record.date === dateStr
    );
    
    const attendanceMap: Record<string, string> = {};
    const notesMap: Record<string, string> = {};
    
    existingRecords.forEach((record: AttendanceRecord) => {
      attendanceMap[record.studentId] = record.status;
      if (record.notes) {
        notesMap[record.studentId] = record.notes;
      }
    });
    
    setAttendanceData(attendanceMap);
    setNotes(notesMap);
  };

  const handleAttendanceChange = (studentId: string, status: string) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleNotesChange = (studentId: string, note: string) => {
    setNotes(prev => ({
      ...prev,
      [studentId]: note
    }));
  };

  const handleSave = () => {
    if (!selectedClass || !selectedSubject) {
      alert('Pilih kelas dan mata pelajaran terlebih dahulu');
      return;
    }

    const savedAttendance = JSON.parse(localStorage.getItem('attendance') || '[]');
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    
    // Remove existing records for this class, subject, and date
    const filteredAttendance = savedAttendance.filter((record: AttendanceRecord) => 
      !(record.classId === selectedClass && 
        record.subjectId === selectedSubject && 
        record.date === dateStr)
    );
    
    // Add new records
    filteredStudents.forEach(student => {
      const status = attendanceData[student.id] || 'hadir';
      const note = notes[student.id] || '';
      
      const newRecord: AttendanceRecord = {
        id: `${student.id}-${selectedClass}-${selectedSubject}-${dateStr}`,
        studentId: student.id,
        classId: selectedClass,
        subjectId: selectedSubject,
        date: dateStr,
        status: status as 'hadir' | 'sakit' | 'ijin' | 'alfa',
        notes: note
      };
      
      filteredAttendance.push(newRecord);
    });
    
    localStorage.setItem('attendance', JSON.stringify(filteredAttendance));
    alert('Data kehadiran berhasil disimpan!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'hadir': return 'text-green-600';
      case 'sakit': return 'text-yellow-600';
      case 'ijin': return 'text-blue-600';
      case 'alfa': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-gray-900">
            Input Kehadiran Siswa
          </h1>
          <p className="text-gray-600">Kelola kehadiran siswa per kelas dan mata pelajaran</p>
        </div>
        <UserCheck size={32} className="text-blue-600" />
      </div>

      {/* Filter Section */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900">Filter Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <Label htmlFor="date" className="text-gray-700">Tanggal</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-white border-gray-300",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "dd/MM/yyyy") : <span>Pilih tanggal</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Input Section */}
      {selectedClass && selectedSubject && (
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900">
              Daftar Kehadiran - {classes.find(c => c.id === selectedClass)?.name} - {subjects.find(s => s.id === selectedSubject)?.name}
            </CardTitle>
            <p className="text-gray-600">Tanggal: {format(selectedDate, "dd MMMM yyyy")}</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredStudents.map((student) => (
                <div key={student.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-2">{student.name}</h3>
                      <RadioGroup
                        value={attendanceData[student.id] || 'hadir'}
                        onValueChange={(value) => handleAttendanceChange(student.id, value)}
                        className="flex space-x-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="hadir" id={`hadir-${student.id}`} />
                          <Label htmlFor={`hadir-${student.id}`} className="text-green-600">Hadir</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="sakit" id={`sakit-${student.id}`} />
                          <Label htmlFor={`sakit-${student.id}`} className="text-yellow-600">Sakit</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="ijin" id={`ijin-${student.id}`} />
                          <Label htmlFor={`ijin-${student.id}`} className="text-blue-600">Ijin</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="alfa" id={`alfa-${student.id}`} />
                          <Label htmlFor={`alfa-${student.id}`} className="text-red-600">Alfa</Label>
                        </div>
                      </RadioGroup>
                      {(attendanceData[student.id] === 'sakit' || attendanceData[student.id] === 'ijin' || attendanceData[student.id] === 'alfa') && (
                        <div className="mt-2">
                          <Input
                            placeholder="Keterangan (opsional)"
                            value={notes[student.id] || ''}
                            onChange={(e) => handleNotesChange(student.id, e.target.value)}
                            className="bg-white border-gray-300"
                          />
                        </div>
                      )}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(attendanceData[student.id] || 'hadir')}`}>
                      {attendanceData[student.id] ? attendanceData[student.id].toUpperCase() : 'HADIR'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {filteredStudents.length > 0 && (
              <div className="mt-6 flex justify-end">
                <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white">
                  <Save size={16} className="mr-2" />
                  Simpan Kehadiran
                </Button>
              </div>
            )}
            
            {filteredStudents.length === 0 && selectedClass && (
              <div className="text-center py-8">
                <Users size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Tidak ada siswa di kelas ini</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

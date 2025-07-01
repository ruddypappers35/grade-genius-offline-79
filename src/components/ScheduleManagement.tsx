
import React, { useState, useEffect } from "react";
import { Plus, Trash2, Clock, Calendar, GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Schedule {
  id: string;
  subject: string;
  day: string;
  classId: string;
  className: string;
  startTime: string;
  endTime: string;
}

export const ScheduleManagement = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    day: "",
    classId: "",
    startTime: "",
    endTime: ""
  });

  const days = [
    "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"
  ];

  useEffect(() => {
    loadSchedules();
    loadClasses();
  }, []);

  const loadSchedules = () => {
    const savedSchedules = JSON.parse(localStorage.getItem('schedules') || '[]');
    setSchedules(savedSchedules);
  };

  const loadClasses = () => {
    const savedClasses = JSON.parse(localStorage.getItem('classes') || '[]');
    setClasses(savedClasses);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject || !formData.day || !formData.classId || !formData.startTime || !formData.endTime) return;

    const selectedClass = classes.find(cls => cls.id === formData.classId);
    
    const newSchedule: Schedule = {
      id: Date.now().toString(),
      subject: formData.subject,
      day: formData.day,
      classId: formData.classId,
      className: selectedClass?.name || "",
      startTime: formData.startTime,
      endTime: formData.endTime
    };

    const updatedSchedules = [...schedules, newSchedule];
    setSchedules(updatedSchedules);
    localStorage.setItem('schedules', JSON.stringify(updatedSchedules));
    
    setFormData({
      subject: "",
      day: "",
      classId: "",
      startTime: "",
      endTime: ""
    });
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Yakin ingin menghapus jadwal ini?')) {
      const updatedSchedules = schedules.filter(schedule => schedule.id !== id);
      setSchedules(updatedSchedules);
      localStorage.setItem('schedules', JSON.stringify(updatedSchedules));
    }
  };

  const groupedSchedules = schedules.reduce((acc, schedule) => {
    if (!acc[schedule.day]) {
      acc[schedule.day] = [];
    }
    acc[schedule.day].push(schedule);
    return acc;
  }, {} as Record<string, Schedule[]>);

  // Sort schedules by start time within each day
  Object.keys(groupedSchedules).forEach(day => {
    groupedSchedules[day].sort((a, b) => a.startTime.localeCompare(b.startTime));
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-gray-900">
            Jadwal Pelajaran
          </h1>
          <p className="text-gray-600">Kelola jadwal pelajaran untuk setiap kelas</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus size={16} className="mr-2" />
          Tambah Jadwal
        </Button>
      </div>

      {showForm && (
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900">Tambah Jadwal Baru</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="subject" className="text-gray-700">Mata Pelajaran</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Nama mata pelajaran"
                  className="bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="day" className="text-gray-700">Hari</Label>
                  <Select value={formData.day} onValueChange={(value) => setFormData({ ...formData, day: value })}>
                    <SelectTrigger className="bg-white border-gray-300">
                      <SelectValue placeholder="Pilih hari" />
                    </SelectTrigger>
                    <SelectContent>
                      {days.map((day) => (
                        <SelectItem key={day} value={day}>{day}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="class" className="text-gray-700">Kelas</Label>
                  <Select value={formData.classId} onValueChange={(value) => setFormData({ ...formData, classId: value })}>
                    <SelectTrigger className="bg-white border-gray-300">
                      <SelectValue placeholder="Pilih kelas" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime" className="text-gray-700">Jam Mulai</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="bg-white border-gray-300 text-gray-900"
                  />
                </div>
                
                <div>
                  <Label htmlFor="endTime" className="text-gray-700">Jam Selesai</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="bg-white border-gray-300 text-gray-900"
                  />
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
                  Simpan
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowForm(false)}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        {days.map((day) => (
          <Card key={day} className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center">
                <Calendar size={20} className="mr-2 text-blue-600" />
                {day}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {groupedSchedules[day] && groupedSchedules[day].length > 0 ? (
                <div className="space-y-3">
                  {groupedSchedules[day].map((schedule) => (
                    <div key={schedule.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2 text-blue-600">
                          <Clock size={16} />
                          <span className="text-sm font-medium">
                            {schedule.startTime} - {schedule.endTime}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <GraduationCap size={16} className="text-gray-600" />
                          <span className="text-sm font-medium text-gray-900">
                            {schedule.subject}
                          </span>
                        </div>
                        <span className="text-sm text-gray-600">
                          {schedule.className}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(schedule.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  Belum ada jadwal untuk hari {day}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {schedules.length === 0 && (
        <div className="text-center py-12">
          <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Belum ada jadwal. Tambah jadwal pertama Anda!</p>
        </div>
      )}
    </div>
  );
};

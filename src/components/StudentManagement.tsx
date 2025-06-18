
import { useState, useEffect } from "react";
import { Plus, Upload, Download, Trash2, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Student {
  id: string;
  name: string;
  nis: string;
  classId: string;
  className: string;
}

export const StudentManagement = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [formData, setFormData] = useState({ name: "", nis: "", classId: "" });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const savedClasses = JSON.parse(localStorage.getItem('classes') || '[]');
    const savedStudents = JSON.parse(localStorage.getItem('students') || '[]');
    
    const studentsWithClassName = savedStudents.map((student: Student) => {
      const studentClass = savedClasses.find((cls: any) => cls.id === student.classId);
      return {
        ...student,
        className: studentClass ? studentClass.name : 'Kelas tidak ditemukan'
      };
    });
    
    setClasses(savedClasses);
    setStudents(studentsWithClassName);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.nis || !formData.classId) return;

    const selectedClassData = classes.find(cls => cls.id === formData.classId);
    const newStudent: Student = {
      id: Date.now().toString(),
      name: formData.name,
      nis: formData.nis,
      classId: formData.classId,
      className: selectedClassData?.name || ''
    };

    const updatedStudents = [...students, newStudent];
    setStudents(updatedStudents);
    
    // Save without className to localStorage
    const studentsToSave = updatedStudents.map(({ className, ...student }) => student);
    localStorage.setItem('students', JSON.stringify(studentsToSave));
    
    setFormData({ name: "", nis: "", classId: "" });
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Yakin ingin menghapus siswa ini?')) {
      const updatedStudents = students.filter(student => student.id !== id);
      setStudents(updatedStudents);
      
      const studentsToSave = updatedStudents.map(({ className, ...student }) => student);
      localStorage.setItem('students', JSON.stringify(studentsToSave));
    }
  };

  const downloadTemplate = () => {
    const template = [
      ['nama', 'nis', 'kelas_id'],
      ['John Doe', '123456', 'copy_class_id_here'],
      ['Jane Smith', '123457', 'copy_class_id_here']
    ];
    
    const csvContent = template.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_siswa.csv';
    a.click();
  };

  const filteredStudents = selectedClass === "all" 
    ? students 
    : students.filter(student => student.classId === selectedClass);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Kelola Siswa
          </h1>
          <p className="text-gray-400">Manage students and import from Excel</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={downloadTemplate}
            variant="outline"
            className="border-white/20 text-gray-300 hover:bg-white/10"
          >
            <Download size={16} className="mr-2" />
            Template
          </Button>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            <Plus size={16} className="mr-2" />
            Tambah Siswa
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Filter size={16} className="text-gray-400" />
        <Select value={selectedClass} onValueChange={setSelectedClass}>
          <SelectTrigger className="w-48 bg-black/20 border-white/20 text-white">
            <SelectValue placeholder="Filter by class" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-white/20">
            <SelectItem value="all">Semua Kelas</SelectItem>
            {classes.map((cls) => (
              <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {showForm && (
        <Card className="bg-black/20 backdrop-blur-lg border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Tambah Siswa Baru</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="studentName" className="text-gray-300">Nama Siswa</Label>
                  <Input
                    id="studentName"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nama lengkap siswa"
                    className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                  />
                </div>
                <div>
                  <Label htmlFor="nis" className="text-gray-300">NIS</Label>
                  <Input
                    id="nis"
                    value={formData.nis}
                    onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                    placeholder="Nomor Induk Siswa"
                    className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="class" className="text-gray-300">Kelas</Label>
                <Select value={formData.classId} onValueChange={(value) => setFormData({ ...formData, classId: value })}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Pilih kelas" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-white/20">
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex space-x-2">
                <Button type="submit" className="bg-gradient-to-r from-green-500 to-emerald-500">
                  Simpan
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowForm(false)}
                  className="border-white/20 text-gray-300 hover:bg-white/10"
                >
                  Batal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="bg-black/20 backdrop-blur-lg border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            Daftar Siswa
            <span className="text-sm text-gray-400">
              {filteredStudents.length} siswa
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left py-3 px-4 text-gray-300">Nama</th>
                  <th className="text-left py-3 px-4 text-gray-300">NIS</th>
                  <th className="text-left py-3 px-4 text-gray-300">Kelas</th>
                  <th className="text-center py-3 px-4 text-gray-300">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="border-b border-white/10 hover:bg-white/5">
                    <td className="py-3 px-4 text-white">{student.name}</td>
                    <td className="py-3 px-4 text-gray-300">{student.nis}</td>
                    <td className="py-3 px-4 text-blue-400">{student.className}</td>
                    <td className="py-3 px-4 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(student.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredStudents.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-400">Tidak ada siswa ditemukan</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

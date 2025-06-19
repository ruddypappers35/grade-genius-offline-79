
import { useState, useEffect } from "react";
import { Plus, Trash2, Users, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Student {
  id: string;
  name: string;
  nis: string;
  classId: string;
  className?: string;
}

interface Class {
  id: string;
  name: string;
}

export const StudentManagement = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", nis: "", classId: "" });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const savedStudents = JSON.parse(localStorage.getItem('students') || '[]');
    const savedClasses = JSON.parse(localStorage.getItem('classes') || '[]');
    
    const studentsWithClass = savedStudents.map((student: Student) => ({
      ...student,
      className: savedClasses.find((cls: Class) => cls.id === student.classId)?.name || 'Kelas tidak ditemukan'
    }));
    
    setStudents(studentsWithClass);
    setClasses(savedClasses);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.nis || !formData.classId) return;

    const newStudent: Student = {
      id: Date.now().toString(),
      name: formData.name,
      nis: formData.nis,
      classId: formData.classId
    };

    const updatedStudents = [...students, newStudent];
    const savedStudents = updatedStudents.map(({ className, ...student }) => student);
    
    localStorage.setItem('students', JSON.stringify(savedStudents));
    loadData();
    
    setFormData({ name: "", nis: "", classId: "" });
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Yakin ingin menghapus siswa ini?')) {
      const updatedStudents = students.filter(student => student.id !== id);
      const savedStudents = updatedStudents.map(({ className, ...student }) => student);
      localStorage.setItem('students', JSON.stringify(savedStudents));
      setStudents(updatedStudents);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-gray-900">
            Kelola Siswa
          </h1>
          <p className="text-gray-600">Manage students and their class assignments</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus size={16} className="mr-2" />
          Tambah Siswa
        </Button>
      </div>

      {showForm && (
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900">Tambah Siswa Baru</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="studentName" className="text-gray-700">Nama Siswa</Label>
                <Input
                  id="studentName"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nama lengkap siswa"
                  className="bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                />
              </div>
              <div>
                <Label htmlFor="nis" className="text-gray-700">NIS</Label>
                <Input
                  id="nis"
                  value={formData.nis}
                  onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                  placeholder="Nomor Induk Siswa"
                  className="bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                />
              </div>
              <div>
                <Label htmlFor="classId" className="text-gray-700">Kelas</Label>
                <select
                  id="classId"
                  value={formData.classId}
                  onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                >
                  <option value="">Pilih Kelas</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {students.map((student) => (
          <Card key={student.id} className="bg-white border border-gray-200 shadow-sm hover:border-gray-300 transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-gray-900 text-lg">{student.name}</CardTitle>
                  <p className="text-gray-600 text-sm mt-1">NIS: {student.nis}</p>
                  <p className="text-gray-600 text-sm">Kelas: {student.className}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(student.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {students.length === 0 && (
        <div className="text-center py-12">
          <User size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Belum ada siswa. Tambah siswa pertama Anda!</p>
        </div>
      )}
    </div>
  );
};

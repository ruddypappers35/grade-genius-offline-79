
import { useState, useEffect } from "react";
import { Plus, Trash2, Users, GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Class {
  id: string;
  name: string;
  teacher: string;
  studentCount: number;
}

export const ClassManagement = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", teacher: "" });

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = () => {
    const savedClasses = JSON.parse(localStorage.getItem('classes') || '[]');
    const students = JSON.parse(localStorage.getItem('students') || '[]');
    
    const classesWithCount = savedClasses.map((cls: Class) => ({
      ...cls,
      studentCount: students.filter((student: any) => student.classId === cls.id).length
    }));
    
    setClasses(classesWithCount);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.teacher) return;

    const newClass: Class = {
      id: Date.now().toString(),
      name: formData.name,
      teacher: formData.teacher,
      studentCount: 0
    };

    const updatedClasses = [...classes, newClass];
    setClasses(updatedClasses);
    localStorage.setItem('classes', JSON.stringify(updatedClasses));
    
    setFormData({ name: "", teacher: "" });
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Yakin ingin menghapus kelas ini? Semua siswa di kelas ini juga akan dihapus.')) {
      const updatedClasses = classes.filter(cls => cls.id !== id);
      setClasses(updatedClasses);
      localStorage.setItem('classes', JSON.stringify(updatedClasses));

      // Remove students from this class
      const students = JSON.parse(localStorage.getItem('students') || '[]');
      const updatedStudents = students.filter((student: any) => student.classId !== id);
      localStorage.setItem('students', JSON.stringify(updatedStudents));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-gray-900">
            Kelola Kelas
          </h1>
          <p className="text-gray-600">Manage your classes and class teachers</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus size={16} className="mr-2" />
          Tambah Kelas
        </Button>
      </div>

      {showForm && (
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900">Tambah Kelas Baru</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="className" className="text-gray-700">Nama Kelas</Label>
                <Input
                  id="className"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="contoh: XII IPA 1"
                  className="bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                />
              </div>
              <div>
                <Label htmlFor="teacher" className="text-gray-700">Wali Kelas</Label>
                <Input
                  id="teacher"
                  value={formData.teacher}
                  onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                  placeholder="Nama wali kelas"
                  className="bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                />
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
        {classes.map((cls) => (
          <Card key={cls.id} className="bg-white border border-gray-200 shadow-sm hover:border-gray-300 transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-gray-900 text-lg">{cls.name}</CardTitle>
                  <p className="text-gray-600 text-sm mt-1">Wali: {cls.teacher}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(cls.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 text-blue-600">
                <Users size={16} />
                <span className="text-sm">{cls.studentCount} siswa</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {classes.length === 0 && (
        <div className="text-center py-12">
          <GraduationCap size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Belum ada kelas. Tambah kelas pertama Anda!</p>
        </div>
      )}
    </div>
  );
};

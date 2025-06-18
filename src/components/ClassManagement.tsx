
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
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Kelola Kelas
          </h1>
          <p className="text-gray-400">Manage your classes and class teachers</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
        >
          <Plus size={16} className="mr-2" />
          Tambah Kelas
        </Button>
      </div>

      {showForm && (
        <Card className="bg-black/20 backdrop-blur-lg border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Tambah Kelas Baru</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="className" className="text-gray-300">Nama Kelas</Label>
                <Input
                  id="className"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="contoh: XII IPA 1"
                  className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                />
              </div>
              <div>
                <Label htmlFor="teacher" className="text-gray-300">Wali Kelas</Label>
                <Input
                  id="teacher"
                  value={formData.teacher}
                  onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                  placeholder="Nama wali kelas"
                  className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                />
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((cls) => (
          <Card key={cls.id} className="bg-black/20 backdrop-blur-lg border-white/10 hover:border-white/20 transition-all duration-300 group">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-white text-lg">{cls.name}</CardTitle>
                  <p className="text-gray-400 text-sm mt-1">Wali: {cls.teacher}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(cls.id)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 text-blue-400">
                <Users size={16} />
                <span className="text-sm">{cls.studentCount} siswa</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {classes.length === 0 && (
        <div className="text-center py-12">
          <GraduationCap size={48} className="mx-auto text-gray-500 mb-4" />
          <p className="text-gray-400">Belum ada kelas. Tambah kelas pertama Anda!</p>
        </div>
      )}
    </div>
  );
};

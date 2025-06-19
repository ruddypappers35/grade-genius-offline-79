
import { useState, useEffect } from "react";
import { Plus, Trash2, BookOpen, Book } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Subject {
  id: string;
  name: string;
  code: string;
  description: string;
}

export const SubjectManagement = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", code: "", description: "" });

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = () => {
    const savedSubjects = JSON.parse(localStorage.getItem('subjects') || '[]');
    setSubjects(savedSubjects);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code) return;

    const newSubject: Subject = {
      id: Date.now().toString(),
      name: formData.name,
      code: formData.code,
      description: formData.description
    };

    const updatedSubjects = [...subjects, newSubject];
    setSubjects(updatedSubjects);
    localStorage.setItem('subjects', JSON.stringify(updatedSubjects));
    
    setFormData({ name: "", code: "", description: "" });
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Yakin ingin menghapus mata pelajaran ini?')) {
      const updatedSubjects = subjects.filter(subject => subject.id !== id);
      setSubjects(updatedSubjects);
      localStorage.setItem('subjects', JSON.stringify(updatedSubjects));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-gray-900">
            Kelola Mata Pelajaran
          </h1>
          <p className="text-gray-600">Manage subjects and their information</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus size={16} className="mr-2" />
          Tambah Mata Pelajaran
        </Button>
      </div>

      {showForm && (
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900">Tambah Mata Pelajaran Baru</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="subjectName" className="text-gray-700">Nama Mata Pelajaran</Label>
                <Input
                  id="subjectName"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="contoh: Matematika"
                  className="bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                />
              </div>
              <div>
                <Label htmlFor="code" className="text-gray-700">Kode Mata Pelajaran</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="contoh: MTK"
                  className="bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                />
              </div>
              <div>
                <Label htmlFor="description" className="text-gray-700">Deskripsi</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Deskripsi mata pelajaran"
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
        {subjects.map((subject) => (
          <Card key={subject.id} className="bg-white border border-gray-200 shadow-sm hover:border-gray-300 transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-gray-900 text-lg">{subject.name}</CardTitle>
                  <p className="text-gray-600 text-sm mt-1">Kode: {subject.code}</p>
                  {subject.description && (
                    <p className="text-gray-600 text-sm mt-1">{subject.description}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(subject.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {subjects.length === 0 && (
        <div className="text-center py-12">
          <Book size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Belum ada mata pelajaran. Tambah mata pelajaran pertama Anda!</p>
        </div>
      )}
    </div>
  );
};

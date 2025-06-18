
import { useState, useEffect } from "react";
import { BookOpen, Plus, Pencil, Trash2, Download, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import * as XLSX from 'xlsx';
import { useToast } from "@/hooks/use-toast";

interface Subject {
  id: string;
  name: string;
  code: string;
  description: string;
}

export const SubjectManagement = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = () => {
    const savedSubjects = JSON.parse(localStorage.getItem('subjects') || '[]');
    setSubjects(savedSubjects);
  };

  const saveSubjects = (updatedSubjects: Subject[]) => {
    localStorage.setItem('subjects', JSON.stringify(updatedSubjects));
    setSubjects(updatedSubjects);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingSubject) {
      const updatedSubjects = subjects.map(subject =>
        subject.id === editingSubject.id
          ? { ...subject, ...formData }
          : subject
      );
      saveSubjects(updatedSubjects);
      toast({
        title: "Mata Pelajaran Diperbarui",
        description: "Data mata pelajaran berhasil diperbarui.",
      });
    } else {
      const newSubject: Subject = {
        id: Date.now().toString(),
        ...formData
      };
      saveSubjects([...subjects, newSubject]);
      toast({
        title: "Mata Pelajaran Ditambahkan",
        description: "Mata pelajaran baru berhasil ditambahkan.",
      });
    }

    setFormData({ name: "", code: "", description: "" });
    setEditingSubject(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      code: subject.code,
      description: subject.description
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    const updatedSubjects = subjects.filter(subject => subject.id !== id);
    saveSubjects(updatedSubjects);
    toast({
      title: "Mata Pelajaran Dihapus",
      description: "Mata pelajaran berhasil dihapus.",
    });
  };

  const exportToExcel = () => {
    const data = [
      ['Daftar Mata Pelajaran'],
      ['Kode', 'Nama', 'Deskripsi'],
      ...subjects.map(subject => [subject.code, subject.name, subject.description])
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Mata Pelajaran");
    XLSX.writeFile(wb, "mata_pelajaran.xlsx");
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

        const importedSubjects: Subject[] = [];
        for (let i = 2; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (row[0] && row[1]) {
            importedSubjects.push({
              id: Date.now().toString() + i,
              code: row[0].toString(),
              name: row[1].toString(),
              description: row[2] ? row[2].toString() : ""
            });
          }
        }

        if (importedSubjects.length > 0) {
          saveSubjects([...subjects, ...importedSubjects]);
          toast({
            title: "Import Berhasil",
            description: `${importedSubjects.length} mata pelajaran berhasil diimport.`,
          });
        }
      } catch (error) {
        toast({
          title: "Import Gagal",
          description: "Format file tidak valid.",
          variant: "destructive"
        });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const downloadTemplate = () => {
    const templateData = [
      ['Template Import Mata Pelajaran'],
      ['Kode', 'Nama', 'Deskripsi'],
      ['MTK', 'Matematika', 'Ilmu tentang bilangan dan perhitungan'],
      ['BIN', 'Bahasa Indonesia', 'Mata pelajaran bahasa nasional']
    ];

    const ws = XLSX.utils.aoa_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "template_mata_pelajaran.xlsx");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Manajemen Mata Pelajaran
          </h1>
          <p className="text-gray-400">Kelola mata pelajaran yang tersedia</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={downloadTemplate} variant="outline" className="border-white/20">
            <Download size={16} className="mr-2" />
            Template
          </Button>
          <Button
            onClick={() => document.getElementById('import-subjects')?.click()}
            variant="outline"
            className="border-white/20"
          >
            <Upload size={16} className="mr-2" />
            Import
          </Button>
          <Button onClick={exportToExcel} variant="outline" className="border-white/20">
            <Download size={16} className="mr-2" />
            Export
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-gradient-to-r from-blue-500 to-purple-500"
                onClick={() => {
                  setEditingSubject(null);
                  setFormData({ name: "", code: "", description: "" });
                }}
              >
                <Plus size={16} className="mr-2" />
                Tambah Mata Pelajaran
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-white/20 text-white">
              <DialogHeader>
                <DialogTitle>
                  {editingSubject ? "Edit Mata Pelajaran" : "Tambah Mata Pelajaran"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="code">Kode Mata Pelajaran</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="bg-white/10 border-white/20 text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="name">Nama Mata Pelajaran</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-white/10 border-white/20 text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Deskripsi</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                <Button type="submit" className="w-full">
                  {editingSubject ? "Perbarui" : "Tambah"} Mata Pelajaran
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <input
        id="import-subjects"
        type="file"
        accept=".xlsx,.xls"
        onChange={handleImport}
        className="hidden"
      />

      <Card className="bg-black/20 backdrop-blur-lg border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Daftar Mata Pelajaran</CardTitle>
        </CardHeader>
        <CardContent>
          {subjects.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen size={48} className="mx-auto text-gray-500 mb-4" />
              <p className="text-gray-400">Belum ada mata pelajaran</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left py-3 px-4 text-gray-300">Kode</th>
                    <th className="text-left py-3 px-4 text-gray-300">Nama</th>
                    <th className="text-left py-3 px-4 text-gray-300">Deskripsi</th>
                    <th className="text-center py-3 px-4 text-gray-300">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((subject) => (
                    <tr key={subject.id} className="border-b border-white/10 hover:bg-white/5">
                      <td className="py-3 px-4 text-white font-mono">{subject.code}</td>
                      <td className="py-3 px-4 text-white">{subject.name}</td>
                      <td className="py-3 px-4 text-gray-300">{subject.description}</td>
                      <td className="py-3 px-4">
                        <div className="flex justify-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(subject)}
                            className="border-white/20 hover:bg-white/10"
                          >
                            <Pencil size={14} />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(subject.id)}
                            className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

import { useState, useEffect } from "react";
import { Plus, Upload, Download, Trash2, Filter, Edit, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';

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
  const [editingId, setEditingId] = useState<string | null>(null);
  const { toast } = useToast();

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
    
    if (editingId) {
      // Update existing student
      const updatedStudents = students.map(student => 
        student.id === editingId 
          ? { ...student, name: formData.name, nis: formData.nis, classId: formData.classId, className: selectedClassData?.name || '' }
          : student
      );
      setStudents(updatedStudents);
      
      const studentsToSave = updatedStudents.map(({ className, ...student }) => student);
      localStorage.setItem('students', JSON.stringify(studentsToSave));
      
      toast({
        title: "Siswa Berhasil Diupdate",
        description: `${formData.name} berhasil diupdate`,
      });
      setEditingId(null);
    } else {
      // Add new student
      const newStudent: Student = {
        id: Date.now().toString(),
        name: formData.name,
        nis: formData.nis,
        classId: formData.classId,
        className: selectedClassData?.name || ''
      };

      const updatedStudents = [...students, newStudent];
      setStudents(updatedStudents);
      
      const studentsToSave = updatedStudents.map(({ className, ...student }) => student);
      localStorage.setItem('students', JSON.stringify(studentsToSave));
      
      toast({
        title: "Siswa Berhasil Ditambahkan",
        description: `${formData.name} berhasil ditambahkan`,
      });
    }
    
    setFormData({ name: "", nis: "", classId: "" });
    setShowForm(false);
  };

  const handleEdit = (student: Student) => {
    setFormData({ name: student.name, nis: student.nis, classId: student.classId });
    setEditingId(student.id);
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ name: "", nis: "", classId: "" });
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Yakin ingin menghapus siswa ini?')) {
      const updatedStudents = students.filter(student => student.id !== id);
      setStudents(updatedStudents);
      
      const studentsToSave = updatedStudents.map(({ className, ...student }) => student);
      localStorage.setItem('students', JSON.stringify(studentsToSave));
      
      toast({
        title: "Siswa Berhasil Dihapus",
        description: "Data siswa berhasil dihapus",
      });
    }
  };

  const downloadTemplate = () => {
    const templateData = [
      ['nama', 'nis', 'kelas_id'],
      ['Contoh Nama Siswa', '123456789', 'Salin ID kelas dari daftar kelas'],
      ['', '', '']
    ];
    
    // Add available class IDs to template
    if (classes.length > 0) {
      templateData.push(['=== ID KELAS YANG TERSEDIA ===', '', '']);
      classes.forEach(cls => {
        templateData.push([cls.name, cls.id, '']);
      });
    }
    
    const ws = XLSX.utils.aoa_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template Siswa");
    XLSX.writeFile(wb, 'template_siswa.xlsx');

    toast({
      title: "Template Berhasil Diunduh",
      description: "File template_siswa.xlsx berhasil diunduh dengan ID kelas yang tersedia",
    });
  };

  const handleImportStudents = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('Starting import process...');
    console.log('Available classes:', classes);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        console.log('Excel data parsed:', jsonData);

        // Skip header row and empty rows
        const studentsData = jsonData.slice(1).filter((row: any) => 
          row && row.length >= 3 && row[0] && row[1] && row[2]
        ) as string[][];
        
        console.log('Filtered student data:', studentsData);
        
        let importedCount = 0;
        let errorCount = 0;
        const errors: string[] = [];
        const newStudents = [...students];

        studentsData.forEach((row: string[], index: number) => {
          const [name, nis, classId] = row.map(cell => String(cell).trim());
          
          console.log(`Processing row ${index + 2}: name=${name}, nis=${nis}, classId=${classId}`);
          
          // Check if student already exists
          const existingStudent = newStudents.find(s => s.nis === nis);
          if (existingStudent) {
            console.log(`Student with NIS ${nis} already exists`);
            errors.push(`Baris ${index + 2}: Siswa dengan NIS ${nis} sudah ada`);
            errorCount++;
            return;
          }
          
          // Find matching class - try exact match first, then case-insensitive
          let selectedClassData = classes.find(cls => cls.id === classId);
          if (!selectedClassData) {
            selectedClassData = classes.find(cls => 
              cls.id.toLowerCase() === classId.toLowerCase() ||
              cls.name.toLowerCase() === classId.toLowerCase()
            );
          }
          
          if (selectedClassData) {
            const newStudent: Student = {
              id: Date.now().toString() + Math.random().toString(),
              name: name,
              nis: nis,
              classId: selectedClassData.id,
              className: selectedClassData.name
            };
            newStudents.push(newStudent);
            importedCount++;
            console.log(`Successfully added student: ${name}`);
          } else {
            console.log(`Class not found for classId: ${classId}`);
            errors.push(`Baris ${index + 2}: Kelas dengan ID "${classId}" tidak ditemukan`);
            errorCount++;
          }
        });

        setStudents(newStudents);
        const studentsToSave = newStudents.map(({ className, ...student }) => student);
        localStorage.setItem('students', JSON.stringify(studentsToSave));

        // Show detailed results
        if (importedCount > 0) {
          toast({
            title: "Import Berhasil",
            description: `${importedCount} siswa berhasil diimport${errorCount > 0 ? `, ${errorCount} gagal` : ''}`,
          });
        }
        
        if (errorCount > 0) {
          console.log('Import errors:', errors);
          toast({
            title: errorCount === studentsData.length ? "Import Gagal" : "Import Sebagian Berhasil",
            description: errors.slice(0, 3).join('. ') + (errors.length > 3 ? '...' : ''),
            variant: "destructive"
          });
        }

      } catch (error) {
        console.error('Import error:', error);
        toast({
          title: "Import Gagal",
          description: "File Excel tidak valid atau format salah",
          variant: "destructive"
        });
      }
    };
    reader.readAsArrayBuffer(file);
    
    // Reset file input
    event.target.value = '';
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
            Template Excel
          </Button>
          <div>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleImportStudents}
              className="hidden"
              id="import-students"
            />
            <Button
              onClick={() => document.getElementById('import-students')?.click()}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              <Upload size={16} className="mr-2" />
              Import Excel
            </Button>
          </div>
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
            <CardTitle className="text-white flex items-center justify-between">
              {editingId ? 'Edit Siswa' : 'Tambah Siswa Baru'}
              {editingId && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelEdit}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={16} />
                </Button>
              )}
            </CardTitle>
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
                    required
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
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="class" className="text-gray-300">Kelas</Label>
                <Select value={formData.classId} onValueChange={(value) => setFormData({ ...formData, classId: value })} required>
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
                  {editingId ? 'Update' : 'Simpan'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={editingId ? handleCancelEdit : () => setShowForm(false)}
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
                      <div className="flex justify-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(student)}
                          className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/20"
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(student.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
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

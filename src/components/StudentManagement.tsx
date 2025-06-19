import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, User, Download, Upload, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';

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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", nis: "", classId: "" });
  const [searchName, setSearchName] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const { toast } = useToast();

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

  const getFilteredStudents = () => {
    let filtered = students;
    
    if (filterClass) {
      filtered = filtered.filter(student => student.classId === filterClass);
    }
    
    if (searchName.trim()) {
      filtered = filtered.filter(student => 
        student.name.toLowerCase().includes(searchName.toLowerCase())
      );
    }
    
    return filtered;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.nis || !formData.classId) return;

    if (editingId) {
      // Update existing student
      const updatedStudents = students.map(student => 
        student.id === editingId 
          ? { ...student, name: formData.name, nis: formData.nis, classId: formData.classId }
          : student
      );
      const savedStudents = updatedStudents.map(({ className, ...student }) => student);
      localStorage.setItem('students', JSON.stringify(savedStudents));
      loadData();
      setEditingId(null);
      toast({
        title: "Berhasil",
        description: "Data siswa berhasil diperbarui",
      });
    } else {
      // Add new student
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
      toast({
        title: "Berhasil",
        description: "Siswa berhasil ditambahkan",
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

  const handleDelete = (id: string) => {
    if (confirm('Yakin ingin menghapus siswa ini?')) {
      const updatedStudents = students.filter(student => student.id !== id);
      const savedStudents = updatedStudents.map(({ className, ...student }) => student);
      localStorage.setItem('students', JSON.stringify(savedStudents));
      setStudents(updatedStudents);
      toast({
        title: "Berhasil",
        description: "Siswa berhasil dihapus",
      });
    }
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        'Nama Siswa': 'Contoh Nama 1',
        'NIS': '12345',
        'Nama Kelas': 'X IPA 1'
      },
      {
        'Nama Siswa': 'Contoh Nama 2',
        'NIS': '12346',
        'Nama Kelas': 'X IPA 2'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template Siswa');
    XLSX.writeFile(wb, 'template_siswa.xlsx');
    
    toast({
      title: "Template Berhasil Diunduh",
      description: "Template Excel telah diunduh ke perangkat Anda",
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        let importedCount = 0;
        let skippedCount = 0;

        jsonData.forEach((row: any) => {
          const name = row['Nama Siswa'] || row['nama_siswa'] || row['nama'] || '';
          const nis = row['NIS'] || row['nis'] || '';
          const className = row['Nama Kelas'] || row['nama_kelas'] || row['kelas'] || '';

          if (name && nis && className) {
            // Find class by name
            const matchingClass = classes.find(cls => 
              cls.name.toLowerCase() === className.toLowerCase()
            );

            if (matchingClass) {
              // Check if student already exists
              const existingStudent = students.find(s => s.nis === nis.toString());
              
              if (!existingStudent) {
                const newStudent: Student = {
                  id: Date.now().toString() + Math.random().toString(),
                  name: name.toString(),
                  nis: nis.toString(),
                  classId: matchingClass.id
                };

                students.push(newStudent);
                importedCount++;
              } else {
                skippedCount++;
              }
            } else {
              skippedCount++;
            }
          } else {
            skippedCount++;
          }
        });

        if (importedCount > 0) {
          const savedStudents = students.map(({ className, ...student }) => student);
          localStorage.setItem('students', JSON.stringify(savedStudents));
          loadData();
        }

        toast({
          title: "Import Selesai",
          description: `${importedCount} siswa berhasil diimpor, ${skippedCount} dilewati`,
        });

      } catch (error) {
        toast({
          title: "Error",
          description: "Gagal membaca file Excel. Pastikan format file benar.",
          variant: "destructive",
        });
      }
    };
    reader.readAsArrayBuffer(file);
    
    // Reset input
    event.target.value = '';
  };

  const filteredStudents = getFilteredStudents();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-gray-900">
            Kelola Siswa
          </h1>
          <p className="text-gray-600">Manage students and their class assignments</p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={downloadTemplate}
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <Download size={16} className="mr-2" />
            Download Template
          </Button>
          <Button
            onClick={() => document.getElementById('excel-upload')?.click()}
            variant="outline"
            className="border-blue-300 text-blue-700 hover:bg-blue-50"
          >
            <Upload size={16} className="mr-2" />
            Import Excel
          </Button>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus size={16} className="mr-2" />
            Tambah Siswa
          </Button>
        </div>
      </div>

      <input
        id="excel-upload"
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileUpload}
        className="hidden"
      />

      {showForm && (
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900">
              {editingId ? 'Edit Siswa' : 'Tambah Siswa Baru'}
            </CardTitle>
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
                  {editingId ? 'Update' : 'Simpan'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({ name: "", nis: "", classId: "" });
                  }}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-gray-900">Daftar Siswa</CardTitle>
            <div className="text-sm text-gray-600">
              Total: {filteredStudents.length} siswa
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="flex-1">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Cari nama siswa..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="pl-10 bg-white border-gray-300 text-gray-900"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select value={filterClass} onValueChange={setFilterClass}>
                <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                  <SelectValue placeholder="Filter kelas" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  <SelectItem value="" className="text-gray-900">Semua Kelas</SelectItem>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id} className="text-gray-900">{cls.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredStudents.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-gray-900 w-16">No</TableHead>
                  <TableHead className="text-gray-900">Nama</TableHead>
                  <TableHead className="text-gray-900">NIS</TableHead>
                  <TableHead className="text-gray-900">Kelas</TableHead>
                  <TableHead className="text-gray-900 w-32">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student, index) => (
                  <TableRow key={student.id}>
                    <TableCell className="text-gray-600">{index + 1}</TableCell>
                    <TableCell className="text-gray-900 font-medium">{student.name}</TableCell>
                    <TableCell className="text-gray-600">{student.nis}</TableCell>
                    <TableCell className="text-gray-600">{student.className}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(student)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(student.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <User size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">
                {searchName || filterClass ? 'Tidak ada siswa yang sesuai dengan filter' : 'Belum ada siswa. Tambah siswa pertama Anda!'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

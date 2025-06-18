import { useState } from "react";
import { Download, Upload, Trash2, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';

export const DataManagement = () => {
  const [isResetting, setIsResetting] = useState(false);
  const { toast } = useToast();

  const exportAllData = () => {
    const data = {
      classes: JSON.parse(localStorage.getItem('classes') || '[]'),
      students: JSON.parse(localStorage.getItem('students') || '[]'),
      categories: JSON.parse(localStorage.getItem('categories') || '[]'),
      weights: JSON.parse(localStorage.getItem('weights') || '[]'),
      scores: JSON.parse(localStorage.getItem('scores') || '[]'),
      exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `backup_sistem_nilai_${new Date().toISOString().split('T')[0]}.json`;
    link.click();

    toast({
      title: "Export Berhasil",
      description: "Data berhasil diexport ke file JSON",
    });
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        // Validate data structure
        if (data.classes && data.students && data.categories && data.weights && data.scores) {
          localStorage.setItem('classes', JSON.stringify(data.classes));
          localStorage.setItem('students', JSON.stringify(data.students));
          localStorage.setItem('categories', JSON.stringify(data.categories));
          localStorage.setItem('weights', JSON.stringify(data.weights));
          localStorage.setItem('scores', JSON.stringify(data.scores));

          toast({
            title: "Import Berhasil",
            description: "Data berhasil diimport dari backup",
          });

          // Refresh page to update all components
          window.location.reload();
        } else {
          throw new Error('Invalid data format');
        }
      } catch (error) {
        toast({
          title: "Import Gagal",
          description: "File backup tidak valid atau rusak",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
  };

  const resetAllData = async () => {
    if (!confirm('PERINGATAN: Ini akan menghapus SEMUA data termasuk kelas, siswa, kategori, bobot, dan nilai. Apakah Anda yakin?')) {
      return;
    }

    if (!confirm('Konfirmasi sekali lagi: Semua data akan hilang permanen. Lanjutkan?')) {
      return;
    }

    setIsResetting(true);
    
    // Simulate reset process
    setTimeout(() => {
      localStorage.removeItem('classes');
      localStorage.removeItem('students');
      localStorage.removeItem('categories');
      localStorage.removeItem('weights');
      localStorage.removeItem('scores');

      toast({
        title: "Reset Berhasil",
        description: "Semua data telah dihapus",
      });

      setIsResetting(false);
      
      // Refresh page
      window.location.reload();
    }, 2000);
  };

  const exportStudents = () => {
    const students = JSON.parse(localStorage.getItem('students') || '[]');
    const classes = JSON.parse(localStorage.getItem('classes') || '[]');
    
    const data = [
      ['Nama', 'NIS', 'Kelas']
    ];
    
    students.forEach((student: any) => {
      const className = classes.find((cls: any) => cls.id === student.classId)?.name || 'Unknown';
      data.push([student.name, student.nis, className]);
    });

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Siswa");
    XLSX.writeFile(wb, 'daftar_siswa.xlsx');

    toast({
      title: "Export Berhasil",
      description: "Data siswa berhasil diexport ke Excel",
    });
  };

  const exportScores = () => {
    const scores = JSON.parse(localStorage.getItem('scores') || '[]');
    const students = JSON.parse(localStorage.getItem('students') || '[]');
    const categories = JSON.parse(localStorage.getItem('categories') || '[]');
    
    const data = [
      ['Nama Siswa', 'NIS', 'Kategori', 'Penilaian', 'Nilai']
    ];
    
    scores.forEach((score: any) => {
      const student = students.find((s: any) => s.id === score.studentId);
      const category = categories.find((c: any) => c.id === score.categoryId);
      if (student && category) {
        data.push([student.name, student.nis, category.name, score.assessmentName || 'Default', score.value]);
      }
    });

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Nilai");
    XLSX.writeFile(wb, 'data_nilai.xlsx');

    toast({
      title: "Export Berhasil",
      description: "Data nilai berhasil diexport ke Excel",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Manajemen Data
        </h1>
        <p className="text-gray-400">Export, import, and manage your application data</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-black/20 backdrop-blur-lg border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Download size={20} />
              <span>Export Data</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={exportAllData}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              <Download size={16} className="mr-2" />
              Export Semua Data (JSON)
            </Button>
            <Button
              onClick={exportStudents}
              variant="outline"
              className="w-full border-white/20 text-gray-300 hover:bg-white/10"
            >
              <Download size={16} className="mr-2" />
              Export Data Siswa (Excel)
            </Button>
            <Button
              onClick={exportScores}
              variant="outline"
              className="w-full border-white/20 text-gray-300 hover:bg-white/10"
            >
              <Download size={16} className="mr-2" />
              Export Data Nilai (Excel)
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-black/20 backdrop-blur-lg border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Upload size={20} />
              <span>Import Data</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <input
                type="file"
                accept=".json"
                onChange={importData}
                className="hidden"
                id="import-file"
              />
              <Button
                onClick={() => document.getElementById('import-file')?.click()}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                <Upload size={16} className="mr-2" />
                Import dari Backup (JSON)
              </Button>
            </div>
            <p className="text-gray-400 text-sm">
              Import file backup yang telah diexport sebelumnya untuk mengembalikan data
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-black/20 backdrop-blur-lg border-red-500/20 border">
        <CardHeader>
          <CardTitle className="text-red-400 flex items-center space-x-2">
            <Trash2 size={20} />
            <span>Danger Zone</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-300">
              Reset semua data aplikasi. Tindakan ini tidak dapat dibatalkan!
            </p>
            <Button
              onClick={resetAllData}
              disabled={isResetting}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:opacity-50"
            >
              {isResetting ? (
                <RefreshCw size={16} className="mr-2 animate-spin" />
              ) : (
                <Trash2 size={16} className="mr-2" />
              )}
              {isResetting ? 'Menghapus Data...' : 'Reset Semua Data'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-black/20 backdrop-blur-lg border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Informasi Storage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-400">
                {JSON.parse(localStorage.getItem('classes') || '[]').length}
              </div>
              <div className="text-gray-400 text-sm">Kelas</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">
                {JSON.parse(localStorage.getItem('students') || '[]').length}
              </div>
              <div className="text-gray-400 text-sm">Siswa</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">
                {JSON.parse(localStorage.getItem('categories') || '[]').length}
              </div>
              <div className="text-gray-400 text-sm">Kategori</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-400">
                {JSON.parse(localStorage.getItem('weights') || '[]').length}
              </div>
              <div className="text-gray-400 text-sm">Bobot</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-400">
                {JSON.parse(localStorage.getItem('scores') || '[]').length}
              </div>
              <div className="text-gray-400 text-sm">Nilai</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

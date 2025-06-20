
import React, { useState } from "react";
import { Download, Upload, Trash2, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';

export const DataManagement = () => {
  const [isResetting, setIsResetting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();

  const exportAllData = () => {
    try {
      const data = {
        classes: JSON.parse(localStorage.getItem('classes') || '[]'),
        students: JSON.parse(localStorage.getItem('students') || '[]'),
        subjects: JSON.parse(localStorage.getItem('subjects') || '[]'),
        categories: JSON.parse(localStorage.getItem('categories') || '[]'),
        weights: JSON.parse(localStorage.getItem('weights') || '[]'),
        scores: JSON.parse(localStorage.getItem('scores') || '[]'),
        exportDate: new Date().toISOString(),
        version: '1.0.0'
      };

      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(dataBlob);
      link.download = `backup_sistem_nilai_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

      toast({
        title: "Export Berhasil",
        description: "Data berhasil diexport ke file JSON",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Gagal",
        description: "Terjadi kesalahan saat export data",
        variant: "destructive"
      });
    }
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        // Validate data structure
        const requiredKeys = ['classes', 'students', 'categories', 'weights', 'scores'];
        const isValidData = requiredKeys.every(key => Array.isArray(data[key]));
        
        if (!isValidData) {
          throw new Error('Invalid data format - missing required arrays');
        }

        // Backup current data before importing
        const currentData = {
          classes: localStorage.getItem('classes'),
          students: localStorage.getItem('students'),
          subjects: localStorage.getItem('subjects'),
          categories: localStorage.getItem('categories'),
          weights: localStorage.getItem('weights'),
          scores: localStorage.getItem('scores')
        };

        try {
          // Import new data
          localStorage.setItem('classes', JSON.stringify(data.classes || []));
          localStorage.setItem('students', JSON.stringify(data.students || []));
          localStorage.setItem('subjects', JSON.stringify(data.subjects || []));
          localStorage.setItem('categories', JSON.stringify(data.categories || []));
          localStorage.setItem('weights', JSON.stringify(data.weights || []));
          localStorage.setItem('scores', JSON.stringify(data.scores || []));

          toast({
            title: "Import Berhasil",
            description: "Data berhasil diimport dari backup",
          });

          // Refresh page to update all components
          setTimeout(() => {
            window.location.reload();
          }, 1500);

        } catch (importError) {
          // Restore original data if import fails
          Object.entries(currentData).forEach(([key, value]) => {
            if (value) localStorage.setItem(key, value);
          });
          throw importError;
        }

      } catch (error) {
        console.error('Import error:', error);
        toast({
          title: "Import Gagal",
          description: "File backup tidak valid atau rusak",
          variant: "destructive"
        });
      } finally {
        setIsImporting(false);
        // Reset file input
        event.target.value = '';
      }
    };

    reader.onerror = () => {
      setIsImporting(false);
      toast({
        title: "Import Gagal",
        description: "Gagal membaca file",
        variant: "destructive"
      });
    };

    reader.readAsText(file);
  };

  const resetAllData = async () => {
    const confirmFirst = confirm('PERINGATAN: Ini akan menghapus SEMUA data termasuk kelas, siswa, mata pelajaran, kategori, bobot, dan nilai. Apakah Anda yakin?');
    if (!confirmFirst) return;

    const confirmSecond = confirm('Konfirmasi sekali lagi: Semua data akan hilang permanen. Lanjutkan?');
    if (!confirmSecond) return;

    setIsResetting(true);
    
    try {
      // Create a backup before reset (optional safety measure)
      const backupData = {
        classes: localStorage.getItem('classes'),
        students: localStorage.getItem('students'),
        subjects: localStorage.getItem('subjects'),
        categories: localStorage.getItem('categories'),
        weights: localStorage.getItem('weights'),
        scores: localStorage.getItem('scores'),
        resetDate: new Date().toISOString()
      };
      
      // Store backup temporarily (will be cleared anyway)
      sessionStorage.setItem('lastBackupBeforeReset', JSON.stringify(backupData));

      // Simulate reset process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Clear all data
      localStorage.removeItem('classes');
      localStorage.removeItem('students');
      localStorage.removeItem('subjects');
      localStorage.removeItem('categories');
      localStorage.removeItem('weights');
      localStorage.removeItem('scores');

      toast({
        title: "Reset Berhasil",
        description: "Semua data telah dihapus",
      });

      // Refresh page
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error) {
      console.error('Reset error:', error);
      toast({
        title: "Reset Gagal",
        description: "Terjadi kesalahan saat reset data",
        variant: "destructive"
      });
    } finally {
      setIsResetting(false);
    }
  };

  const exportStudents = () => {
    try {
      const students = JSON.parse(localStorage.getItem('students') || '[]');
      const classes = JSON.parse(localStorage.getItem('classes') || '[]');
      
      if (students.length === 0) {
        toast({
          title: "Tidak Ada Data",
          description: "Tidak ada data siswa untuk diexport",
          variant: "destructive"
        });
        return;
      }
      
      const data = [
        ['Nama', 'NIS', 'Kelas']
      ];
      
      students.forEach((student: any) => {
        const className = classes.find((cls: any) => cls.id === student.classId)?.name || 'Kelas Tidak Ditemukan';
        data.push([student.name || '', student.nis || '', className]);
      });

      const ws = XLSX.utils.aoa_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Data Siswa");
      XLSX.writeFile(wb, `daftar_siswa_${new Date().toISOString().split('T')[0]}.xlsx`);

      toast({
        title: "Export Berhasil",
        description: "Data siswa berhasil diexport ke Excel",
      });
    } catch (error) {
      console.error('Export students error:', error);
      toast({
        title: "Export Gagal",
        description: "Terjadi kesalahan saat export data siswa",
        variant: "destructive"
      });
    }
  };

  const exportScores = () => {
    try {
      const scores = JSON.parse(localStorage.getItem('scores') || '[]');
      const students = JSON.parse(localStorage.getItem('students') || '[]');
      const categories = JSON.parse(localStorage.getItem('categories') || '[]');
      
      if (scores.length === 0) {
        toast({
          title: "Tidak Ada Data",
          description: "Tidak ada data nilai untuk diexport",
          variant: "destructive"
        });
        return;
      }
      
      const data = [
        ['Nama Siswa', 'NIS', 'Kategori', 'Penilaian', 'Nilai']
      ];
      
      scores.forEach((score: any) => {
        const student = students.find((s: any) => s.id === score.studentId);
        const category = categories.find((c: any) => c.id === score.categoryId);
        if (student && category) {
          data.push([
            student.name || '', 
            student.nis || '', 
            category.name || '', 
            score.assessmentName || 'Default', 
            score.value || 0
          ]);
        }
      });

      const ws = XLSX.utils.aoa_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Data Nilai");
      XLSX.writeFile(wb, `data_nilai_${new Date().toISOString().split('T')[0]}.xlsx`);

      toast({
        title: "Export Berhasil",
        description: "Data nilai berhasil diexport ke Excel",
      });
    } catch (error) {
      console.error('Export scores error:', error);
      toast({
        title: "Export Gagal",
        description: "Terjadi kesalahan saat export data nilai",
        variant: "destructive"
      });
    }
  };

  const getStorageStats = () => {
    try {
      return {
        classes: JSON.parse(localStorage.getItem('classes') || '[]').length,
        students: JSON.parse(localStorage.getItem('students') || '[]').length,
        subjects: JSON.parse(localStorage.getItem('subjects') || '[]').length,
        categories: JSON.parse(localStorage.getItem('categories') || '[]').length,
        weights: JSON.parse(localStorage.getItem('weights') || '[]').length,
        scores: JSON.parse(localStorage.getItem('scores') || '[]').length
      };
    } catch (error) {
      console.error('Error getting storage stats:', error);
      return {
        classes: 0,
        students: 0,
        subjects: 0,
        categories: 0,
        weights: 0,
        scores: 0
      };
    }
  };

  const stats = getStorageStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-900">
          Manajemen Data
        </h1>
        <p className="text-gray-600">Export, import, dan kelola data aplikasi Anda</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center space-x-2">
              <Download size={20} />
              <span>Export Data</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={exportAllData}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Download size={16} className="mr-2" />
              Export Semua Data (JSON)
            </Button>
            <Button
              onClick={exportStudents}
              variant="outline"
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
              disabled={stats.students === 0}
            >
              <Download size={16} className="mr-2" />
              Export Data Siswa (Excel)
            </Button>
            <Button
              onClick={exportScores}
              variant="outline"
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
              disabled={stats.scores === 0}
            >
              <Download size={16} className="mr-2" />
              Export Data Nilai (Excel)
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center space-x-2">
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
                disabled={isImporting}
              />
              <Button
                onClick={() => document.getElementById('import-file')?.click()}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                disabled={isImporting}
              >
                {isImporting ? (
                  <RefreshCw size={16} className="mr-2 animate-spin" />
                ) : (
                  <Upload size={16} className="mr-2" />
                )}
                {isImporting ? 'Mengimport...' : 'Import dari Backup (JSON)'}
              </Button>
            </div>
            <p className="text-gray-600 text-sm">
              Import file backup yang telah diexport sebelumnya untuk mengembalikan data
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-yellow-800 text-sm">
                ⚠️ Import akan mengganti semua data yang ada saat ini
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white border border-red-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-red-600 flex items-center space-x-2">
            <Trash2 size={20} />
            <span>Danger Zone</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-700">
              Reset semua data aplikasi. Tindakan ini tidak dapat dibatalkan!
            </p>
            <Button
              onClick={resetAllData}
              disabled={isResetting}
              className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
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

      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900">Informasi Storage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {stats.classes}
              </div>
              <div className="text-gray-600 text-sm">Kelas</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {stats.students}
              </div>
              <div className="text-gray-600 text-sm">Siswa</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-teal-600">
                {stats.subjects}
              </div>
              <div className="text-gray-600 text-sm">Mata Pelajaran</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {stats.categories}
              </div>
              <div className="text-gray-600 text-sm">Kategori</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {stats.weights}
              </div>
              <div className="text-gray-600 text-sm">Bobot</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {stats.scores}
              </div>
              <div className="text-gray-600 text-sm">Nilai</div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-gray-600 text-sm text-center">
              Total data tersimpan di localStorage browser Anda
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

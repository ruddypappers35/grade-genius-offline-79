
import { useState, useEffect } from "react";
import { Download, BarChart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface StudentReport {
  id: string;
  name: string;
  nis: string;
  scores: { [categoryId: string]: number };
  weightedAverage: number;
}

export const ScoreReport = () => {
  const [reports, setReports] = useState<StudentReport[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [weights, setWeights] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      generateReport();
    }
  }, [selectedClass]);

  const loadData = () => {
    const savedClasses = JSON.parse(localStorage.getItem('classes') || '[]');
    const savedCategories = JSON.parse(localStorage.getItem('categories') || '[]');
    const savedWeights = JSON.parse(localStorage.getItem('weights') || '[]');
    
    setClasses(savedClasses);
    setCategories(savedCategories);
    setWeights(savedWeights);
  };

  const generateReport = () => {
    const students = JSON.parse(localStorage.getItem('students') || '[]');
    const scores = JSON.parse(localStorage.getItem('scores') || '[]');
    
    const classStudents = students.filter((student: any) => student.classId === selectedClass);
    
    const studentReports: StudentReport[] = classStudents.map((student: any) => {
      const studentScores: { [categoryId: string]: number } = {};
      let weightedSum = 0;
      let totalWeight = 0;

      categories.forEach(category => {
        const score = scores.find((s: any) => s.studentId === student.id && s.categoryId === category.id);
        if (score) {
          studentScores[category.id] = score.value;
          
          const weight = weights.find((w: any) => w.categoryId === category.id);
          if (weight) {
            weightedSum += score.value * (weight.weight / 100);
            totalWeight += weight.weight;
          }
        }
      });

      const weightedAverage = totalWeight > 0 ? Math.round(weightedSum / (totalWeight / 100)) : 0;

      return {
        id: student.id,
        name: student.name,
        nis: student.nis,
        scores: studentScores,
        weightedAverage
      };
    });

    setReports(studentReports);
  };

  const exportToCSV = () => {
    if (reports.length === 0) return;

    const selectedClassName = classes.find(c => c.id === selectedClass)?.name || 'Unknown';
    
    // Header
    let csvContent = `Laporan Nilai Kelas ${selectedClassName}\n\n`;
    csvContent += 'Nama,NIS,';
    
    // Add category headers
    categories.forEach(category => {
      csvContent += `${category.name},`;
    });
    csvContent += 'Rata-rata Berbobot\n';

    // Data rows
    reports.forEach(report => {
      csvContent += `${report.name},${report.nis},`;
      categories.forEach(category => {
        csvContent += `${report.scores[category.id] || '-'},`;
      });
      csvContent += `${report.weightedAverage}\n`;
    });

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `laporan_nilai_${selectedClassName.replace(/\s+/g, '_')}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Rekap Nilai
          </h1>
          <p className="text-gray-400">View and export score reports by class</p>
        </div>
        {reports.length > 0 && (
          <Button
            onClick={exportToCSV}
            className="bg-gradient-to-r from-green-500 to-emerald-500"
          >
            <Download size={16} className="mr-2" />
            Export Excel
          </Button>
        )}
      </div>

      <Card className="bg-black/20 backdrop-blur-lg border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Filter Kelas</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Pilih kelas untuk melihat laporan" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-white/20">
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedClass && reports.length > 0 && (
        <Card className="bg-black/20 backdrop-blur-lg border-white/10">
          <CardHeader>
            <CardTitle className="text-white">
              Laporan Nilai - {classes.find(c => c.id === selectedClass)?.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left py-3 px-4 text-gray-300">Nama</th>
                    <th className="text-left py-3 px-4 text-gray-300">NIS</th>
                    {categories.map(category => (
                      <th key={category.id} className="text-center py-3 px-4 text-gray-300">
                        {category.name}
                      </th>
                    ))}
                    <th className="text-center py-3 px-4 text-gray-300 font-bold">Rata-rata</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr key={report.id} className="border-b border-white/10 hover:bg-white/5">
                      <td className="py-3 px-4 text-white">{report.name}</td>
                      <td className="py-3 px-4 text-gray-300">{report.nis}</td>
                      {categories.map(category => (
                        <td key={category.id} className="py-3 px-4 text-center text-gray-300">
                          {report.scores[category.id] || '-'}
                        </td>
                      ))}
                      <td className="py-3 px-4 text-center font-bold">
                        <span className={`px-2 py-1 rounded ${
                          report.weightedAverage >= 80 ? 'bg-green-500/20 text-green-400' :
                          report.weightedAverage >= 70 ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {report.weightedAverage}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedClass && reports.length === 0 && (
        <div className="text-center py-12">
          <BarChart size={48} className="mx-auto text-gray-500 mb-4" />
          <p className="text-gray-400">Tidak ada data nilai untuk kelas ini</p>
        </div>
      )}

      {!selectedClass && (
        <div className="text-center py-12">
          <BarChart size={48} className="mx-auto text-gray-500 mb-4" />
          <p className="text-gray-400">Pilih kelas untuk melihat laporan nilai</p>
        </div>
      )}
    </div>
  );
};

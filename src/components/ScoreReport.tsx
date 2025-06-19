
import { useState, useEffect } from "react";
import { Download, BarChart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import * as XLSX from 'xlsx';

interface StudentReport {
  id: string;
  name: string;
  nis: string;
  scores: { [categoryId: string]: { [subjectId: string]: { [assessmentName: string]: number } } };
  categoryAverages: { [categoryId: string]: { [subjectId: string]: number } };
  weightedAverage: number;
}

export const ScoreReport = () => {
  const [reports, setReports] = useState<StudentReport[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [weights, setWeights] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<{ [categoryId: string]: { [subjectId: string]: string[] } }>({});
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
    const savedSubjects = JSON.parse(localStorage.getItem('subjects') || '[]');
    const savedWeights = JSON.parse(localStorage.getItem('weights') || '[]');
    const savedAssessments = JSON.parse(localStorage.getItem('assessments') || '{}');
    
    setClasses(savedClasses);
    setCategories(savedCategories);
    setSubjects(savedSubjects);
    setWeights(savedWeights);
    setAssessments(savedAssessments);
  };

  const generateReport = () => {
    const students = JSON.parse(localStorage.getItem('students') || '[]');
    const scores = JSON.parse(localStorage.getItem('scores') || '[]');
    
    const classStudents = students.filter((student: any) => student.classId === selectedClass);
    
    const studentReports: StudentReport[] = classStudents.map((student: any) => {
      const studentScores: { [categoryId: string]: { [subjectId: string]: { [assessmentName: string]: number } } } = {};
      const categoryAverages: { [categoryId: string]: { [subjectId: string]: number } } = {};
      let weightedSum = 0;
      let totalWeight = 0;

      categories.forEach(category => {
        studentScores[category.id] = {};
        categoryAverages[category.id] = {};
        
        subjects.forEach(subject => {
          const categorySubjectScores = scores.filter((s: any) => 
            s.studentId === student.id && s.categoryId === category.id && s.subjectId === subject.id
          );
          
          if (categorySubjectScores.length > 0) {
            studentScores[category.id][subject.id] = {};
            let categorySubjectSum = 0;
            let categorySubjectCount = 0;

            categorySubjectScores.forEach((score: any) => {
              studentScores[category.id][subject.id][score.assessmentName] = score.value;
              categorySubjectSum += score.value;
              categorySubjectCount++;
            });

            const categorySubjectAverage = categorySubjectCount > 0 ? Math.round(categorySubjectSum / categorySubjectCount) : 0;
            categoryAverages[category.id][subject.id] = categorySubjectAverage;

            const weight = weights.find((w: any) => w.categoryId === category.id);
            if (weight) {
              weightedSum += categorySubjectAverage * (weight.weight / 100);
              totalWeight += weight.weight;
            }
          }
        });
      });

      const weightedAverage = totalWeight > 0 ? Math.round(weightedSum / (totalWeight / 100)) : 0;

      return {
        id: student.id,
        name: student.name,
        nis: student.nis,
        scores: studentScores,
        categoryAverages,
        weightedAverage
      };
    });

    setReports(studentReports);
  };

  const exportToExcel = () => {
    if (reports.length === 0) return;

    const selectedClassName = classes.find(c => c.id === selectedClass)?.name || 'Unknown';
    
    const data = [
      ['Laporan Nilai Kelas ' + selectedClassName]
    ];
    
    // Header row
    const headerRow = ['Nama', 'NIS'];
    categories.forEach(category => {
      subjects.forEach(subject => {
        const categorySubjectAssessments = assessments[category.id]?.[subject.id] || [];
        categorySubjectAssessments.forEach(assessment => {
          headerRow.push(`${category.name} - ${subject.name} - ${assessment}`);
        });
        headerRow.push(`Rata-rata ${category.name} - ${subject.name}`);
      });
    });
    headerRow.push('Rata-rata Berbobot');
    data.push(headerRow);

    // Data rows
    reports.forEach(report => {
      const row = [report.name, report.nis];
      categories.forEach(category => {
        subjects.forEach(subject => {
          const categorySubjectAssessments = assessments[category.id]?.[subject.id] || [];
          categorySubjectAssessments.forEach(assessment => {
            const scoreValue = report.scores[category.id]?.[subject.id]?.[assessment];
            row.push(scoreValue !== undefined ? scoreValue.toString() : '-');
          });
          const avgValue = report.categoryAverages[category.id]?.[subject.id];
          row.push(avgValue !== undefined ? avgValue.toString() : '-');
        });
      });
      row.push(report.weightedAverage.toString());
      data.push(row);
    });

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan Nilai");
    XLSX.writeFile(wb, `laporan_nilai_${selectedClassName.replace(/\s+/g, '_')}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Rekap Nilai
          </h1>
          <p className="text-gray-400">View and export detailed score reports by class</p>
        </div>
        {reports.length > 0 && (
          <Button
            onClick={exportToExcel}
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
                    {categories.map(category => 
                      subjects.map(subject => {
                        const categorySubjectAssessments = assessments[category.id]?.[subject.id] || [];
                        return categorySubjectAssessments.map(assessment => (
                          <th key={`${category.id}-${subject.id}-${assessment}`} className="text-center py-3 px-4 text-gray-300 text-xs">
                            {category.name} - {subject.name}<br/>{assessment}
                          </th>
                        ));
                      })
                    )}
                    {categories.map(category => 
                      subjects.map(subject => (
                        <th key={`avg-${category.id}-${subject.id}`} className="text-center py-3 px-4 text-gray-300 text-xs">
                          Rata-rata<br/>{category.name} - {subject.name}
                        </th>
                      ))
                    )}
                    <th className="text-center py-3 px-4 text-gray-300 font-bold">Rata-rata</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr key={report.id} className="border-b border-white/10 hover:bg-white/5">
                      <td className="py-3 px-4 text-white">{report.name}</td>
                      <td className="py-3 px-4 text-gray-300">{report.nis}</td>
                      {categories.map(category => 
                        subjects.map(subject => {
                          const categorySubjectAssessments = assessments[category.id]?.[subject.id] || [];
                          return categorySubjectAssessments.map(assessment => (
                            <td key={`${category.id}-${subject.id}-${assessment}`} className="py-3 px-4 text-center text-gray-300">
                              {report.scores[category.id]?.[subject.id]?.[assessment] || '-'}
                            </td>
                          ));
                        })
                      )}
                      {categories.map(category => 
                        subjects.map(subject => (
                          <td key={`avg-${category.id}-${subject.id}`} className="py-3 px-4 text-center text-gray-300">
                            {report.categoryAverages[category.id]?.[subject.id] || '-'}
                          </td>
                        ))
                      )}
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

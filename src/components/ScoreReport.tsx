
import { useState, useEffect } from "react";
import { Download, BarChart, Filter } from "lucide-react";
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
  subjectFinalAverages: { [subjectId: string]: number };
}

export const ScoreReport = () => {
  const [reports, setReports] = useState<StudentReport[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [weights, setWeights] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<{ [categoryId: string]: { [subjectId: string]: string[] } }>({});
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      generateReport();
    }
  }, [selectedClass, selectedSubject]);

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
      const subjectFinalAverages: { [subjectId: string]: number } = {};

      categories.forEach(category => {
        studentScores[category.id] = {};
        categoryAverages[category.id] = {};
        
        const filteredSubjects = selectedSubject === "all" ? subjects : subjects.filter(s => s.id === selectedSubject);
        
        filteredSubjects.forEach(subject => {
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
          }
        });
      });

      // Calculate final average per subject (weighted by category)
      const filteredSubjects = selectedSubject === "all" ? subjects : subjects.filter(s => s.id === selectedSubject);
      
      filteredSubjects.forEach(subject => {
        let weightedSum = 0;
        let totalWeight = 0;

        categories.forEach(category => {
          const categoryAverage = categoryAverages[category.id]?.[subject.id];
          if (categoryAverage !== undefined) {
            const weight = weights.find((w: any) => w.categoryId === category.id);
            if (weight) {
              weightedSum += categoryAverage * (weight.weight / 100);
              totalWeight += weight.weight;
            }
          }
        });

        subjectFinalAverages[subject.id] = totalWeight > 0 ? Math.round(weightedSum / (totalWeight / 100)) : 0;
      });

      return {
        id: student.id,
        name: student.name,
        nis: student.nis,
        scores: studentScores,
        categoryAverages,
        subjectFinalAverages
      };
    });

    setReports(studentReports);
  };

  const exportToExcel = () => {
    if (reports.length === 0) return;

    const selectedClassName = classes.find(c => c.id === selectedClass)?.name || 'Unknown';
    const selectedSubjectName = selectedSubject === "all" ? "Semua Mata Pelajaran" : subjects.find(s => s.id === selectedSubject)?.name || 'Unknown';
    
    const data: string[][] = [
      [`Laporan Nilai Kelas ${selectedClassName} - ${selectedSubjectName}`]
    ];
    
    // Header row
    const headerRow: string[] = ['No', 'Nama', 'NIS'];
    const filteredSubjects = selectedSubject === "all" ? subjects : subjects.filter(s => s.id === selectedSubject);
    
    categories.forEach(category => {
      filteredSubjects.forEach(subject => {
        const categorySubjectAssessments = assessments[category.id]?.[subject.id] || [];
        categorySubjectAssessments.forEach(assessment => {
          headerRow.push(`${category.name} - ${subject.name} - ${assessment}`);
        });
        headerRow.push(`Rata-rata ${category.name} - ${subject.name}`);
      });
    });
    
    // Add final average columns for each subject
    filteredSubjects.forEach(subject => {
      headerRow.push(`Nilai Akhir ${subject.name}`);
    });
    
    data.push(headerRow);

    // Data rows
    reports.forEach((report, index) => {
      const row: string[] = [(index + 1).toString(), report.name, report.nis];
      categories.forEach(category => {
        filteredSubjects.forEach(subject => {
          const categorySubjectAssessments = assessments[category.id]?.[subject.id] || [];
          categorySubjectAssessments.forEach(assessment => {
            const scoreValue = report.scores[category.id]?.[subject.id]?.[assessment];
            row.push(scoreValue !== undefined ? scoreValue.toString() : '-');
          });
          const avgValue = report.categoryAverages[category.id]?.[subject.id];
          row.push(avgValue !== undefined ? avgValue.toString() : '-');
        });
      });
      
      // Add final averages for each subject
      filteredSubjects.forEach(subject => {
        const finalAvg = report.subjectFinalAverages[subject.id];
        row.push(finalAvg !== undefined ? finalAvg.toString() : '-');
      });
      
      data.push(row);
    });

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan Nilai");
    const fileName = `laporan_nilai_${selectedClassName.replace(/\s+/g, '_')}_${selectedSubjectName.replace(/\s+/g, '_')}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const filteredSubjects = selectedSubject === "all" ? subjects : subjects.filter(s => s.id === selectedSubject);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-gray-900">
            Rekap Nilai
          </h1>
          <p className="text-gray-600">View and export detailed score reports by class and subject</p>
        </div>
        {reports.length > 0 && (
          <Button
            onClick={exportToExcel}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Download size={16} className="mr-2" />
            Export Excel
          </Button>
        )}
      </div>

      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center">
            <Filter size={20} className="mr-2" />
            Filter Laporan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Kelas</label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                  <SelectValue placeholder="Pilih kelas untuk melihat laporan" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-300">
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id} className="text-gray-900">{cls.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Mata Pelajaran</label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                  <SelectValue placeholder="Pilih mata pelajaran" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-300">
                  <SelectItem value="all" className="text-gray-900">Semua Mata Pelajaran</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id} className="text-gray-900">{subject.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedClass && reports.length > 0 && (
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900">
              Laporan Nilai - {classes.find(c => c.id === selectedClass)?.name} 
              {selectedSubject !== "all" && ` - ${subjects.find(s => s.id === selectedSubject)?.name}`} 
              ({reports.length} siswa)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-gray-900 font-semibold">No</th>
                    <th className="text-left py-3 px-4 text-gray-900 font-semibold">Nama</th>
                    <th className="text-left py-3 px-4 text-gray-900 font-semibold">NIS</th>
                    {categories.map(category => 
                      filteredSubjects.map(subject => {
                        const categorySubjectAssessments = assessments[category.id]?.[subject.id] || [];
                        return categorySubjectAssessments.map(assessment => (
                          <th key={`${category.id}-${subject.id}-${assessment}`} className="text-center py-3 px-4 text-gray-900 font-semibold text-xs">
                            {category.name} - {subject.name}<br/>{assessment}
                          </th>
                        ));
                      })
                    )}
                    {categories.map(category => 
                      filteredSubjects.map(subject => (
                        <th key={`avg-${category.id}-${subject.id}`} className="text-center py-3 px-4 text-gray-900 font-semibold text-xs">
                          Rata-rata<br/>{category.name} - {subject.name}
                        </th>
                      ))
                    )}
                    {filteredSubjects.map(subject => (
                      <th key={`final-${subject.id}`} className="text-center py-3 px-4 text-gray-900 font-bold">
                        Nilai Akhir<br/>{subject.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report, index) => (
                    <tr key={report.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-600 font-medium">{index + 1}</td>
                      <td className="py-3 px-4 text-gray-900 font-medium">{report.name}</td>
                      <td className="py-3 px-4 text-gray-600">{report.nis}</td>
                      {categories.map(category => 
                        filteredSubjects.map(subject => {
                          const categorySubjectAssessments = assessments[category.id]?.[subject.id] || [];
                          return categorySubjectAssessments.map(assessment => (
                            <td key={`${category.id}-${subject.id}-${assessment}`} className="py-3 px-4 text-center text-gray-600">
                              {report.scores[category.id]?.[subject.id]?.[assessment] || '-'}
                            </td>
                          ));
                        })
                      )}
                      {categories.map(category => 
                        filteredSubjects.map(subject => (
                          <td key={`avg-${category.id}-${subject.id}`} className="py-3 px-4 text-center text-gray-600">
                            {report.categoryAverages[category.id]?.[subject.id] || '-'}
                          </td>
                        ))
                      )}
                      {filteredSubjects.map(subject => (
                        <td key={`final-${subject.id}`} className="py-3 px-4 text-center font-bold">
                          <span className={`px-2 py-1 rounded ${
                            report.subjectFinalAverages[subject.id] >= 80 ? 'bg-green-100 text-green-800' :
                            report.subjectFinalAverages[subject.id] >= 70 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {report.subjectFinalAverages[subject.id] || '-'}
                          </span>
                        </td>
                      ))}
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
          <BarChart size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Tidak ada data nilai untuk filter yang dipilih</p>
        </div>
      )}

      {!selectedClass && (
        <div className="text-center py-12">
          <BarChart size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Pilih kelas dan mata pelajaran untuk melihat laporan nilai</p>
        </div>
      )}
    </div>
  );
};

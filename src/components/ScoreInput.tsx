
import { useState, useEffect } from "react";
import { Save, Edit, Plus, Trash2, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Score {
  id: string;
  studentId: string;
  categoryId: string;
  subjectId: string;
  assessmentName: string;
  value: number;
}

export const ScoreInput = () => {
  const [scores, setScores] = useState<Score[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedAssessment, setSelectedAssessment] = useState<string>("");
  const [scoreInputs, setScoreInputs] = useState<{ [key: string]: number }>({});
  const [showAssessmentDialog, setShowAssessmentDialog] = useState(false);
  const [newAssessmentName, setNewAssessmentName] = useState("");
  const [assessments, setAssessments] = useState<{ [categoryId: string]: { [subjectId: string]: string[] } }>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const savedScores = JSON.parse(localStorage.getItem('scores') || '[]');
    const savedStudents = JSON.parse(localStorage.getItem('students') || '[]');
    const savedCategories = JSON.parse(localStorage.getItem('categories') || '[]');
    const savedSubjects = JSON.parse(localStorage.getItem('subjects') || '[]');
    const savedClasses = JSON.parse(localStorage.getItem('classes') || '[]');
    const savedAssessments = JSON.parse(localStorage.getItem('assessments') || '{}');
    
    setScores(savedScores);
    setStudents(savedStudents);
    setCategories(savedCategories);
    setSubjects(savedSubjects);
    setClasses(savedClasses);
    setAssessments(savedAssessments);
  };

  const getFilteredStudents = () => {
    if (!selectedClass) return [];
    return students.filter(student => student.classId === selectedClass);
  };

  const getExistingScore = (studentId: string, categoryId: string, subjectId: string, assessmentName: string) => {
    const existingScore = scores.find(score => 
      score.studentId === studentId && 
      score.categoryId === categoryId && 
      score.subjectId === subjectId &&
      score.assessmentName === assessmentName
    );
    return existingScore ? existingScore.value : '';
  };

  const handleScoreChange = (studentId: string, value: string) => {
    const numValue = Number(value);
    if (numValue >= 0 && numValue <= 100) {
      setScoreInputs(prev => ({
        ...prev,
        [`${studentId}-${selectedCategory}-${selectedSubject}-${selectedAssessment}`]: numValue
      }));
    }
  };

  const handleSave = (studentId: string) => {
    if (!selectedCategory || !selectedSubject || !selectedAssessment) return;
    
    const key = `${studentId}-${selectedCategory}-${selectedSubject}-${selectedAssessment}`;
    const value = scoreInputs[key];
    
    if (value === undefined) return;

    const existingScoreIndex = scores.findIndex(score => 
      score.studentId === studentId && 
      score.categoryId === selectedCategory &&
      score.subjectId === selectedSubject &&
      score.assessmentName === selectedAssessment
    );

    let updatedScores = [...scores];

    if (existingScoreIndex >= 0) {
      updatedScores[existingScoreIndex].value = value;
    } else {
      const newScore: Score = {
        id: Date.now().toString(),
        studentId,
        categoryId: selectedCategory,
        subjectId: selectedSubject,
        assessmentName: selectedAssessment,
        value
      };
      updatedScores.push(newScore);
    }

    setScores(updatedScores);
    localStorage.setItem('scores', JSON.stringify(updatedScores));
    
    // Remove from temporary inputs
    setScoreInputs(prev => {
      const newInputs = { ...prev };
      delete newInputs[key];
      return newInputs;
    });
  };

  const handleSaveAll = () => {
    if (!selectedCategory || !selectedSubject || !selectedAssessment || Object.keys(scoreInputs).length === 0) return;
    
    let updatedScores = [...scores];
    let savedCount = 0;
    
    Object.entries(scoreInputs).forEach(([key, value]) => {
      if (key.includes(`${selectedCategory}-${selectedSubject}-${selectedAssessment}`)) {
        const studentId = key.split('-')[0];
        
        const existingScoreIndex = updatedScores.findIndex(score => 
          score.studentId === studentId && 
          score.categoryId === selectedCategory &&
          score.subjectId === selectedSubject &&
          score.assessmentName === selectedAssessment
        );

        if (existingScoreIndex >= 0) {
          updatedScores[existingScoreIndex].value = value;
        } else {
          const newScore: Score = {
            id: Date.now().toString() + Math.random().toString(),
            studentId,
            categoryId: selectedCategory,
            subjectId: selectedSubject,
            assessmentName: selectedAssessment,
            value
          };
          updatedScores.push(newScore);
        }
        savedCount++;
      }
    });

    setScores(updatedScores);
    localStorage.setItem('scores', JSON.stringify(updatedScores));
    
    // Clear all temporary inputs for current selection
    setScoreInputs(prev => {
      const newInputs = { ...prev };
      Object.keys(newInputs).forEach(key => {
        if (key.includes(`${selectedCategory}-${selectedSubject}-${selectedAssessment}`)) {
          delete newInputs[key];
        }
      });
      return newInputs;
    });
    
    alert(`${savedCount} nilai berhasil disimpan!`);
  };

  const addAssessment = () => {
    if (!selectedCategory || !selectedSubject || !newAssessmentName) return;

    const updatedAssessments = {
      ...assessments,
      [selectedCategory]: {
        ...assessments[selectedCategory],
        [selectedSubject]: [...(assessments[selectedCategory]?.[selectedSubject] || []), newAssessmentName]
      }
    };

    setAssessments(updatedAssessments);
    localStorage.setItem('assessments', JSON.stringify(updatedAssessments));
    setNewAssessmentName("");
    setShowAssessmentDialog(false);
  };

  const deleteAssessment = (assessmentName: string) => {
    if (!selectedCategory || !selectedSubject) return;
    
    if (confirm(`Yakin ingin menghapus penilaian "${assessmentName}"?`)) {
      const updatedAssessments = {
        ...assessments,
        [selectedCategory]: {
          ...assessments[selectedCategory],
          [selectedSubject]: assessments[selectedCategory]?.[selectedSubject]?.filter(name => name !== assessmentName) || []
        }
      };

      setAssessments(updatedAssessments);
      localStorage.setItem('assessments', JSON.stringify(updatedAssessments));
      
      if (selectedAssessment === assessmentName) {
        setSelectedAssessment("");
      }

      // Also remove related scores
      const updatedScores = scores.filter(score => 
        !(score.categoryId === selectedCategory && 
          score.subjectId === selectedSubject && 
          score.assessmentName === assessmentName)
      );
      setScores(updatedScores);
      localStorage.setItem('scores', JSON.stringify(updatedScores));
    }
  };

  const filteredStudents = getFilteredStudents();
  const categorySubjectAssessments = selectedCategory && selectedSubject ? 
    (assessments[selectedCategory]?.[selectedSubject] || []) : [];

  const hasUnsavedChanges = Object.keys(scoreInputs).some(key => 
    key.includes(`${selectedCategory}-${selectedSubject}-${selectedAssessment}`)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-900">
          Input Nilai
        </h1>
        <p className="text-gray-600">Input nilai siswa berdasarkan kelas, mata pelajaran, kategori dan penilaian</p>
      </div>

      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900">Filter Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-gray-700 text-sm mb-2 block font-medium">Pilih Kelas</label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                  <SelectValue placeholder="Pilih kelas" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 z-50">
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id} className="text-gray-900 hover:bg-gray-50">{cls.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-gray-700 text-sm mb-2 block font-medium">Pilih Mata Pelajaran</label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                  <SelectValue placeholder="Pilih mata pelajaran" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 z-50">
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id} className="text-gray-900 hover:bg-gray-50">{subject.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-gray-700 text-sm mb-2 block font-medium">Pilih Kategori</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 z-50">
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id} className="text-gray-900 hover:bg-gray-50">{category.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-gray-700 text-sm font-medium">Pilih Penilaian</label>
                {selectedCategory && selectedSubject && (
                  <Dialog open={showAssessmentDialog} onOpenChange={setShowAssessmentDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                        <Plus size={14} />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-white border-gray-200">
                      <DialogHeader>
                        <DialogTitle className="text-gray-900">Tambah Penilaian Baru</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-gray-700">Nama Penilaian</Label>
                          <Input
                            value={newAssessmentName}
                            onChange={(e) => setNewAssessmentName(e.target.value)}
                            placeholder="Contoh: UH 1, Tugas 1, Kuis 1"
                            className="bg-white border-gray-300 text-gray-900"
                          />
                        </div>
                        <Button onClick={addAssessment} className="bg-blue-500 hover:bg-blue-600 text-white">
                          Tambah Penilaian
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
              <Select value={selectedAssessment} onValueChange={setSelectedAssessment}>
                <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                  <SelectValue placeholder="Pilih penilaian" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 z-50">
                  {categorySubjectAssessments.map((assessment) => (
                    <SelectItem key={assessment} value={assessment} className="text-gray-900 hover:bg-gray-50">
                      <div className="flex items-center justify-between w-full">
                        <span>{assessment}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Display assessments with delete buttons */}
              {selectedCategory && selectedSubject && categorySubjectAssessments.length > 0 && (
                <div className="mt-2 space-y-1">
                  <label className="text-gray-700 text-xs font-medium">Penilaian yang tersedia:</label>
                  <div className="space-y-1">
                    {categorySubjectAssessments.map((assessment) => (
                      <div key={assessment} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                        <span className="text-gray-700">{assessment}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteAssessment(assessment)}
                          className="p-1 h-auto text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedClass && selectedSubject && selectedCategory && selectedAssessment && (
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-gray-900">
                Input Nilai - {classes.find(c => c.id === selectedClass)?.name} - {subjects.find(s => s.id === selectedSubject)?.name} - {categories.find(c => c.id === selectedCategory)?.name} - {selectedAssessment} ({filteredStudents.length} siswa)
              </CardTitle>
              {hasUnsavedChanges && (
                <Button
                  onClick={handleSaveAll}
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  <CheckCircle size={16} className="mr-2" />
                  Simpan Semua
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredStudents.map((student, index) => {
                const key = `${student.id}-${selectedCategory}-${selectedSubject}-${selectedAssessment}`;
                const currentValue = scoreInputs[key] ?? getExistingScore(student.id, selectedCategory, selectedSubject, selectedAssessment);
                const hasUnsavedChanges = scoreInputs[key] !== undefined;
                
                return (
                  <div key={student.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 border border-gray-200">
                    <div className="flex items-center space-x-4">
                      <span className="text-gray-500 font-medium text-sm w-8">{index + 1}.</span>
                      <div>
                        <h3 className="text-gray-900 font-medium">{student.name}</h3>
                        <p className="text-gray-600 text-sm">NIS: {student.nis}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={currentValue}
                        onChange={(e) => handleScoreChange(student.id, e.target.value)}
                        placeholder="0-100"
                        className="w-24 bg-white border-gray-300 text-gray-900 text-center"
                      />
                      {hasUnsavedChanges && (
                        <Button
                          onClick={() => handleSave(student.id)}
                          size="sm"
                          className="bg-green-500 hover:bg-green-600 text-white"
                        >
                          <Save size={16} />
                        </Button>
                      )}
                      {!hasUnsavedChanges && getExistingScore(student.id, selectedCategory, selectedSubject, selectedAssessment) && (
                        <Edit size={16} className="text-blue-500" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {filteredStudents.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">Tidak ada siswa di kelas ini</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {(!selectedClass || !selectedSubject || !selectedCategory || !selectedAssessment) && (
        <div className="text-center py-12">
          <Edit size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">Pilih kelas, mata pelajaran, kategori, dan penilaian untuk mulai input nilai</p>
        </div>
      )}
    </div>
  );
};

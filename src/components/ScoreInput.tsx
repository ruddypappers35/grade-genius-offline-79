
import { useState, useEffect } from "react";
import { Save, Edit, Plus, Trash2 } from "lucide-react";
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
      // Update existing score
      updatedScores[existingScoreIndex].value = value;
    } else {
      // Add new score
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

    const updatedAssessments = {
      ...assessments,
      [selectedCategory]: {
        ...assessments[selectedCategory],
        [selectedSubject]: assessments[selectedCategory]?.[selectedSubject]?.filter(name => name !== assessmentName) || []
      }
    };

    setAssessments(updatedAssessments);
    localStorage.setItem('assessments', JSON.stringify(updatedAssessments));
    
    // Reset selected assessment if it was deleted
    if (selectedAssessment === assessmentName) {
      setSelectedAssessment("");
    }
  };

  const filteredStudents = getFilteredStudents();
  const categorySubjectAssessments = selectedCategory && selectedSubject ? 
    (assessments[selectedCategory]?.[selectedSubject] || []) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Input Nilai
        </h1>
        <p className="text-gray-400">Input scores for students by class, subject, category and assessment</p>
      </div>

      <Card className="bg-black/20 backdrop-blur-lg border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-gray-300 text-sm mb-2 block">Pilih Kelas</label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
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
            <div>
              <label className="text-gray-300 text-sm mb-2 block">Pilih Mata Pelajaran</label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Pilih mata pelajaran" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/20">
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-gray-300 text-sm mb-2 block">Pilih Kategori</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/20">
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-gray-300 text-sm">Pilih Penilaian</label>
                {selectedCategory && selectedSubject && (
                  <Dialog open={showAssessmentDialog} onOpenChange={setShowAssessmentDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="border-white/20 text-gray-300 hover:bg-white/10">
                        <Plus size={14} />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-800 border-white/20">
                      <DialogHeader>
                        <DialogTitle className="text-white">Tambah Penilaian Baru</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-gray-300">Nama Penilaian</Label>
                          <Input
                            value={newAssessmentName}
                            onChange={(e) => setNewAssessmentName(e.target.value)}
                            placeholder="Contoh: UH 1, Tugas 1, Kuis 1"
                            className="bg-white/10 border-white/20 text-white"
                          />
                        </div>
                        <Button onClick={addAssessment} className="bg-gradient-to-r from-green-500 to-emerald-500">
                          Tambah Penilaian
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
              <Select value={selectedAssessment} onValueChange={setSelectedAssessment}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Pilih penilaian" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/20">
                  {categorySubjectAssessments.map((assessment) => (
                    <SelectItem key={assessment} value={assessment}>
                      <div className="flex items-center justify-between w-full">
                        <span>{assessment}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteAssessment(assessment);
                          }}
                          className="ml-2 p-1 h-auto text-red-400 hover:text-red-300"
                        >
                          <Trash2 size={12} />
                        </Button>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedClass && selectedSubject && selectedCategory && selectedAssessment && (
        <Card className="bg-black/20 backdrop-blur-lg border-white/10">
          <CardHeader>
            <CardTitle className="text-white">
              Input Nilai - {classes.find(c => c.id === selectedClass)?.name} - {subjects.find(s => s.id === selectedSubject)?.name} - {categories.find(c => c.id === selectedCategory)?.name} - {selectedAssessment}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredStudents.map((student) => {
                const key = `${student.id}-${selectedCategory}-${selectedSubject}-${selectedAssessment}`;
                const currentValue = scoreInputs[key] ?? getExistingScore(student.id, selectedCategory, selectedSubject, selectedAssessment);
                const hasUnsavedChanges = scoreInputs[key] !== undefined;
                
                return (
                  <div key={student.id} className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                    <div>
                      <h3 className="text-white font-medium">{student.name}</h3>
                      <p className="text-gray-400 text-sm">NIS: {student.nis}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={currentValue}
                        onChange={(e) => handleScoreChange(student.id, e.target.value)}
                        placeholder="0-100"
                        className="w-24 bg-white/10 border-white/20 text-white text-center"
                      />
                      {hasUnsavedChanges && (
                        <Button
                          onClick={() => handleSave(student.id)}
                          size="sm"
                          className="bg-gradient-to-r from-green-500 to-emerald-500"
                        >
                          <Save size={16} />
                        </Button>
                      )}
                      {!hasUnsavedChanges && getExistingScore(student.id, selectedCategory, selectedSubject, selectedAssessment) && (
                        <Edit size={16} className="text-blue-400" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {filteredStudents.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-400">Tidak ada siswa di kelas ini</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {(!selectedClass || !selectedSubject || !selectedCategory || !selectedAssessment) && (
        <div className="text-center py-12">
          <Edit size={48} className="mx-auto text-gray-500 mb-4" />
          <p className="text-gray-400">Pilih kelas, mata pelajaran, kategori, dan penilaian untuk mulai input nilai</p>
        </div>
      )}
    </div>
  );
};

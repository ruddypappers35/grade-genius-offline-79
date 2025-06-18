
import { useState, useEffect } from "react";
import { Save, Edit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Score {
  id: string;
  studentId: string;
  categoryId: string;
  value: number;
}

export const ScoreInput = () => {
  const [scores, setScores] = useState<Score[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [scoreInputs, setScoreInputs] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const savedScores = JSON.parse(localStorage.getItem('scores') || '[]');
    const savedStudents = JSON.parse(localStorage.getItem('students') || '[]');
    const savedCategories = JSON.parse(localStorage.getItem('categories') || '[]');
    const savedClasses = JSON.parse(localStorage.getItem('classes') || '[]');
    
    setScores(savedScores);
    setStudents(savedStudents);
    setCategories(savedCategories);
    setClasses(savedClasses);
  };

  const getFilteredStudents = () => {
    if (!selectedClass) return [];
    return students.filter(student => student.classId === selectedClass);
  };

  const getExistingScore = (studentId: string, categoryId: string) => {
    const existingScore = scores.find(score => 
      score.studentId === studentId && score.categoryId === categoryId
    );
    return existingScore ? existingScore.value : '';
  };

  const handleScoreChange = (studentId: string, value: string) => {
    const numValue = Number(value);
    if (numValue >= 0 && numValue <= 100) {
      setScoreInputs(prev => ({
        ...prev,
        [`${studentId}-${selectedCategory}`]: numValue
      }));
    }
  };

  const handleSave = (studentId: string) => {
    if (!selectedCategory) return;
    
    const key = `${studentId}-${selectedCategory}`;
    const value = scoreInputs[key];
    
    if (value === undefined) return;

    const existingScoreIndex = scores.findIndex(score => 
      score.studentId === studentId && score.categoryId === selectedCategory
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

  const filteredStudents = getFilteredStudents();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Input Nilai
        </h1>
        <p className="text-gray-400">Input scores for students by category</p>
      </div>

      <Card className="bg-black/20 backdrop-blur-lg border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>
        </CardContent>
      </Card>

      {selectedClass && selectedCategory && (
        <Card className="bg-black/20 backdrop-blur-lg border-white/10">
          <CardHeader>
            <CardTitle className="text-white">
              Input Nilai - {classes.find(c => c.id === selectedClass)?.name} - {categories.find(c => c.id === selectedCategory)?.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredStudents.map((student) => {
                const key = `${student.id}-${selectedCategory}`;
                const currentValue = scoreInputs[key] ?? getExistingScore(student.id, selectedCategory);
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
                      {!hasUnsavedChanges && getExistingScore(student.id, selectedCategory) && (
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

      {(!selectedClass || !selectedCategory) && (
        <div className="text-center py-12">
          <Edit size={48} className="mx-auto text-gray-500 mb-4" />
          <p className="text-gray-400">Pilih kelas dan kategori untuk mulai input nilai</p>
        </div>
      )}
    </div>
  );
};

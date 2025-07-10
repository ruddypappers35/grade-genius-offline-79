import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { CalendarIcon, Plus, Pencil, Trash2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface JournalEntry {
  id: string;
  date: string;
  class: string;
  subject: string;
  material: string;
  method: string;
  notes: string;
}

export const JournalHarian = () => {
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [formData, setFormData] = useState({
    date: "",
    class: "",
    subject: "",
    material: "",
    method: "",
    notes: ""
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadJournals();
    loadClasses();
    loadSubjects();
  }, []);

  const loadJournals = () => {
    const savedJournals = JSON.parse(localStorage.getItem('journals') || '[]');
    setJournals(savedJournals);
  };

  const loadClasses = () => {
    const savedClasses = JSON.parse(localStorage.getItem('classes') || '[]');
    setClasses(savedClasses);
  };

  const loadSubjects = () => {
    const savedSubjects = JSON.parse(localStorage.getItem('subjects') || '[]');
    setSubjects(savedSubjects);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.date || !formData.class || !formData.subject || !formData.material) {
      toast({
        title: "Error",
        description: "Harap isi semua field yang wajib",
        variant: "destructive"
      });
      return;
    }

    const journalEntry: JournalEntry = {
      id: editingId || Date.now().toString(),
      ...formData
    };

    let updatedJournals;
    if (editingId) {
      updatedJournals = journals.map(j => j.id === editingId ? journalEntry : j);
      toast({
        title: "Berhasil",
        description: "Jurnal harian berhasil diperbarui"
      });
    } else {
      updatedJournals = [...journals, journalEntry];
      toast({
        title: "Berhasil",
        description: "Jurnal harian berhasil ditambahkan"
      });
    }

    localStorage.setItem('journals', JSON.stringify(updatedJournals));
    setJournals(updatedJournals);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      date: "",
      class: "",
      subject: "",
      material: "",
      method: "",
      notes: ""
    });
    setSelectedDate(undefined);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (journal: JournalEntry) => {
    setFormData(journal);
    setSelectedDate(new Date(journal.date));
    setEditingId(journal.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    const updatedJournals = journals.filter(j => j.id !== id);
    localStorage.setItem('journals', JSON.stringify(updatedJournals));
    setJournals(updatedJournals);
    toast({
      title: "Berhasil",
      description: "Jurnal harian berhasil dihapus"
    });
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setFormData({ ...formData, date: format(date, 'yyyy-MM-dd') });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Jurnal Harian Guru</h1>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Jurnal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Jurnal Harian' : 'Tambah Jurnal Harian'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="date" className="text-gray-700">Tanggal *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-white border-gray-300",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP", { locale: id }) : <span>Pilih tanggal</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="class" className="text-gray-700">Kelas *</Label>
                  <Select value={formData.class} onValueChange={(value) => setFormData({ ...formData, class: value })}>
                    <SelectTrigger className="bg-white border-gray-300">
                      <SelectValue placeholder="Pilih kelas" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.name}>{cls.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="subject" className="text-gray-700">Mata Pelajaran *</Label>
                  <Select value={formData.subject} onValueChange={(value) => setFormData({ ...formData, subject: value })}>
                    <SelectTrigger className="bg-white border-gray-300">
                      <SelectValue placeholder="Pilih mata pelajaran" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.name}>{subject.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="material" className="text-gray-700">Materi *</Label>
                <Input
                  id="material"
                  value={formData.material}
                  onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                  placeholder="Materi yang diajarkan"
                  className="bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                />
              </div>

              <div>
                <Label htmlFor="method" className="text-gray-700">Metode</Label>
                <Input
                  id="method"
                  value={formData.method}
                  onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                  placeholder="Metode pembelajaran yang digunakan"
                  className="bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                />
              </div>

              <div>
                <Label htmlFor="notes" className="text-gray-700">Catatan</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Catatan tambahan"
                  className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 min-h-[100px]"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Batal
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                  {editingId ? 'Perbarui' : 'Simpan'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {journals.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">Belum ada jurnal harian. Klik "Tambah Jurnal" untuk memulai.</p>
            </CardContent>
          </Card>
        ) : (
          journals.map((journal) => (
            <Card key={journal.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {format(new Date(journal.date), "dd MMMM yyyy", { locale: id })}
                  </CardTitle>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEdit(journal)}
                      className="text-blue-600 border-blue-600 hover:bg-blue-50"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDelete(journal.id)}
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Kelas:</p>
                    <p className="text-gray-900">{journal.class}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Mata Pelajaran:</p>
                    <p className="text-gray-900">{journal.subject}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Materi:</p>
                  <p className="text-gray-900">{journal.material}</p>
                </div>
                {journal.method && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Metode:</p>
                    <p className="text-gray-900">{journal.method}</p>
                  </div>
                )}
                {journal.notes && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Catatan:</p>
                    <p className="text-gray-900">{journal.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
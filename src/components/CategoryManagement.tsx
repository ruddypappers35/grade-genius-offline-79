
import { useState, useEffect } from "react";
import { Plus, Trash2, Tag, Edit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Category {
  id: string;
  name: string;
  description: string;
}

export const CategoryManagement = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = () => {
    const savedCategories = JSON.parse(localStorage.getItem('categories') || '[]');
    setCategories(savedCategories);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (editingCategory) {
      // Update existing category
      const updatedCategories = categories.map(category =>
        category.id === editingCategory.id
          ? { ...category, name: formData.name, description: formData.description }
          : category
      );
      setCategories(updatedCategories);
      localStorage.setItem('categories', JSON.stringify(updatedCategories));
      setEditingCategory(null);
    } else {
      // Add new category
      const newCategory: Category = {
        id: Date.now().toString(),
        name: formData.name,
        description: formData.description
      };

      const updatedCategories = [...categories, newCategory];
      setCategories(updatedCategories);
      localStorage.setItem('categories', JSON.stringify(updatedCategories));
    }
    
    setFormData({ name: "", description: "" });
    setShowForm(false);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, description: category.description });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Yakin ingin menghapus kategori ini?')) {
      const updatedCategories = categories.filter(category => category.id !== id);
      setCategories(updatedCategories);
      localStorage.setItem('categories', JSON.stringify(updatedCategories));
    }
  };

  const resetForm = () => {
    setFormData({ name: "", description: "" });
    setEditingCategory(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-900">
            Kategori Penilaian
          </h1>
          <p className="text-gray-600">Kelola kategori penilaian (UH, UTS, UAS, dll.)</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus size={16} className="mr-2" />
          Tambah Kategori
        </Button>
      </div>

      {showForm && (
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900">
              {editingCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="categoryName" className="text-gray-700">Nama Kategori</Label>
                <Input
                  id="categoryName"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="contoh: UH (Ulangan Harian)"
                  className="bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                />
              </div>
              <div>
                <Label htmlFor="description" className="text-gray-700">Deskripsi</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Deskripsi kategori penilaian"
                  className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 resize-none"
                  rows={3}
                />
              </div>
              <div className="flex space-x-2">
                <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
                  {editingCategory ? 'Update' : 'Simpan'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetForm}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Card key={category.id} className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 group">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-lg bg-blue-500">
                    <Tag size={16} className="text-white" />
                  </div>
                  <CardTitle className="text-gray-900 text-lg">{category.name}</CardTitle>
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(category)}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Edit size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(category.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">{category.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12">
          <Tag size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Belum ada kategori penilaian. Tambah kategori pertama Anda!</p>
        </div>
      )}
    </div>
  );
};

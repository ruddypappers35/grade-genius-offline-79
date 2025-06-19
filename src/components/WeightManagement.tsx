
import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Scale } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Weight {
  id: string;
  categoryId: string;
  categoryName: string;
  weight: number;
}

export const WeightManagement = () => {
  const [weights, setWeights] = useState<Weight[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ categoryId: "", weight: 0 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const savedCategories = JSON.parse(localStorage.getItem('categories') || '[]');
    const savedWeights = JSON.parse(localStorage.getItem('weights') || '[]');
    
    const weightsWithCategoryName = savedWeights.map((weight: Weight) => {
      const category = savedCategories.find((cat: any) => cat.id === weight.categoryId);
      return {
        ...weight,
        categoryName: category ? category.name : 'Kategori tidak ditemukan'
      };
    });
    
    setCategories(savedCategories);
    setWeights(weightsWithCategoryName);
  };

  const getTotalWeight = () => {
    return weights.reduce((sum, weight) => sum + weight.weight, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoryId || formData.weight <= 0) return;

    const category = categories.find(cat => cat.id === formData.categoryId);
    if (!category) return;

    if (editingId) {
      // Update existing weight
      const updatedWeights = weights.map(weight => 
        weight.id === editingId 
          ? { ...weight, categoryId: formData.categoryId, categoryName: category.name, weight: formData.weight }
          : weight
      );
      setWeights(updatedWeights);
      
      const weightsToSave = updatedWeights.map(({ categoryName, ...weight }) => weight);
      localStorage.setItem('weights', JSON.stringify(weightsToSave));
      setEditingId(null);
    } else {
      // Add new weight
      const newWeight: Weight = {
        id: Date.now().toString(),
        categoryId: formData.categoryId,
        categoryName: category.name,
        weight: formData.weight
      };

      const updatedWeights = [...weights, newWeight];
      setWeights(updatedWeights);
      
      const weightsToSave = updatedWeights.map(({ categoryName, ...weight }) => weight);
      localStorage.setItem('weights', JSON.stringify(weightsToSave));
    }
    
    setFormData({ categoryId: "", weight: 0 });
    setShowForm(false);
  };

  const handleEdit = (weight: Weight) => {
    setFormData({ categoryId: weight.categoryId, weight: weight.weight });
    setEditingId(weight.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Yakin ingin menghapus bobot ini?')) {
      const updatedWeights = weights.filter(weight => weight.id !== id);
      setWeights(updatedWeights);
      
      const weightsToSave = updatedWeights.map(({ categoryName, ...weight }) => weight);
      localStorage.setItem('weights', JSON.stringify(weightsToSave));
    }
  };

  const totalWeight = getTotalWeight();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-gray-900">
            Bobot Nilai
          </h1>
          <p className="text-gray-600">Set weights for each assessment category</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus size={16} className="mr-2" />
          Tambah Bobot
        </Button>
      </div>

      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Scale size={20} className="text-gray-700" />
              <span className="text-gray-900 font-medium">Total Bobot:</span>
            </div>
            <div className={`text-2xl font-bold ${totalWeight === 100 ? 'text-green-600' : 'text-orange-600'}`}>
              {totalWeight}%
            </div>
          </div>
          {totalWeight !== 100 && (
            <p className="text-orange-600 text-sm mt-2">
              ⚠️ Total bobot harus 100% untuk perhitungan yang akurat
            </p>
          )}
        </CardContent>
      </Card>

      {showForm && (
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900">
              {editingId ? 'Edit Bobot' : 'Tambah Bobot Baru'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="category" className="text-gray-700">Kategori</Label>
                <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
                  <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-300">
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id} className="text-gray-900">{category.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="weight" className="text-gray-700">Bobot (%)</Label>
                <Input
                  id="weight"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.weight || ''}
                  onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                  placeholder="contoh: 30"
                  className="bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                />
              </div>
              <div className="flex space-x-2">
                <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
                  {editingId ? 'Update' : 'Simpan'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({ categoryId: "", weight: 0 });
                  }}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900">Daftar Bobot</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {weights.map((weight) => (
              <div key={weight.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200">
                <div>
                  <h3 className="text-gray-900 font-medium">{weight.categoryName}</h3>
                  <p className="text-gray-600 text-sm">Bobot: {weight.weight}%</p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(weight)}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <Edit size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(weight.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          {weights.length === 0 && (
            <div className="text-center py-8">
              <Scale size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">Belum ada bobot nilai. Tambah bobot pertama Anda!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

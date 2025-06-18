
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
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Bobot Nilai
          </h1>
          <p className="text-gray-400">Set weights for each assessment category</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
        >
          <Plus size={16} className="mr-2" />
          Tambah Bobot
        </Button>
      </div>

      <Card className="bg-black/20 backdrop-blur-lg border-white/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Scale size={20} className="text-blue-400" />
              <span className="text-white font-medium">Total Bobot:</span>
            </div>
            <div className={`text-2xl font-bold ${totalWeight === 100 ? 'text-green-400' : 'text-orange-400'}`}>
              {totalWeight}%
            </div>
          </div>
          {totalWeight !== 100 && (
            <p className="text-orange-400 text-sm mt-2">
              ⚠️ Total bobot harus 100% untuk perhitungan yang akurat
            </p>
          )}
        </CardContent>
      </Card>

      {showForm && (
        <Card className="bg-black/20 backdrop-blur-lg border-white/10">
          <CardHeader>
            <CardTitle className="text-white">
              {editingId ? 'Edit Bobot' : 'Tambah Bobot Baru'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="category" className="text-gray-300">Kategori</Label>
                <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
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
                <Label htmlFor="weight" className="text-gray-300">Bobot (%)</Label>
                <Input
                  id="weight"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.weight || ''}
                  onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                  placeholder="contoh: 30"
                  className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                />
              </div>
              <div className="flex space-x-2">
                <Button type="submit" className="bg-gradient-to-r from-green-500 to-emerald-500">
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
                  className="border-white/20 text-gray-300 hover:bg-white/10"
                >
                  Batal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="bg-black/20 backdrop-blur-lg border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Daftar Bobot</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {weights.map((weight) => (
              <div key={weight.id} className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <div>
                  <h3 className="text-white font-medium">{weight.categoryName}</h3>
                  <p className="text-gray-400 text-sm">Bobot: {weight.weight}%</p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(weight)}
                    className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/20"
                  >
                    <Edit size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(weight.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          {weights.length === 0 && (
            <div className="text-center py-8">
              <Scale size={48} className="mx-auto text-gray-500 mb-4" />
              <p className="text-gray-400">Belum ada bobot nilai. Tambah bobot pertama Anda!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

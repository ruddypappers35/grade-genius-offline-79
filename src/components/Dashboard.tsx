
import { useState, useEffect } from "react";
import { GraduationCap, Users, Tag, BarChart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Dashboard = () => {
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    totalCategories: 0,
    averageScore: 0
  });

  useEffect(() => {
    // Load stats from localStorage
    const classes = JSON.parse(localStorage.getItem('classes') || '[]');
    const students = JSON.parse(localStorage.getItem('students') || '[]');
    const categories = JSON.parse(localStorage.getItem('categories') || '[]');
    const scores = JSON.parse(localStorage.getItem('scores') || '[]');

    // Calculate average score
    const totalScores = scores.reduce((sum: number, score: any) => sum + score.value, 0);
    const averageScore = scores.length > 0 ? Math.round(totalScores / scores.length) : 0;

    setStats({
      totalClasses: classes.length,
      totalStudents: students.length,
      totalCategories: categories.length,
      averageScore
    });
  }, []);

  const statCards = [
    {
      title: "Total Kelas",
      value: stats.totalClasses,
      icon: GraduationCap,
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Total Siswa",
      value: stats.totalStudents,
      icon: Users,
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Kategori Nilai",
      value: stats.totalCategories,
      icon: Tag,
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "Rata-rata Nilai",
      value: stats.averageScore,
      icon: BarChart,
      color: "from-orange-500 to-red-500"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-gray-400">Selamat datang di sistem manajemen nilai siswa</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <Card key={index} className="bg-black/20 backdrop-blur-lg border-white/10 hover:border-white/20 transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg bg-gradient-to-r ${card.color} group-hover:scale-110 transition-transform`}>
                <card.icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-black/20 backdrop-blur-lg border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Aktivitas Terbaru</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/5">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-300 text-sm">Kelas XII IPA 1 ditambahkan</span>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/5">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-300 text-sm">25 siswa baru diimport</span>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/5">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-gray-300 text-sm">Nilai UTS diupdate</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/20 backdrop-blur-lg border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <button className="w-full p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-white font-medium hover:shadow-lg transform hover:scale-105 transition-all">
              Tambah Siswa Baru
            </button>
            <button className="w-full p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg text-white font-medium hover:shadow-lg transform hover:scale-105 transition-all">
              Input Nilai
            </button>
            <button className="w-full p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg text-white font-medium hover:shadow-lg transform hover:scale-105 transition-all">
              Export Data
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

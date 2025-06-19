
import { useState, useEffect } from "react";
import { GraduationCap, Users, Tag, BarChart, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Dashboard = () => {
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    totalSubjects: 0,
    totalCategories: 0,
    averageScore: 0
  });

  useEffect(() => {
    // Load stats from localStorage
    const classes = JSON.parse(localStorage.getItem('classes') || '[]');
    const students = JSON.parse(localStorage.getItem('students') || '[]');
    const subjects = JSON.parse(localStorage.getItem('subjects') || '[]');
    const categories = JSON.parse(localStorage.getItem('categories') || '[]');
    const scores = JSON.parse(localStorage.getItem('scores') || '[]');

    // Calculate average score
    const totalScores = scores.reduce((sum: number, score: any) => sum + score.value, 0);
    const averageScore = scores.length > 0 ? Math.round(totalScores / scores.length) : 0;

    setStats({
      totalClasses: classes.length,
      totalStudents: students.length,
      totalSubjects: subjects.length,
      totalCategories: categories.length,
      averageScore
    });
  }, []);

  const statCards = [
    {
      title: "Total Kelas",
      value: stats.totalClasses,
      icon: GraduationCap,
      color: "bg-gray-600",
      description: "Kelas aktif"
    },
    {
      title: "Total Siswa",
      value: stats.totalStudents,
      icon: Users,
      color: "bg-blue-600",
      description: "Siswa terdaftar"
    },
    {
      title: "Mata Pelajaran",
      value: stats.totalSubjects,
      icon: BookOpen,
      color: "bg-green-600",
      description: "Mata pelajaran"
    },
    {
      title: "Kategori Nilai",
      value: stats.totalCategories,
      icon: Tag,
      color: "bg-orange-600",
      description: "Kategori penilaian"
    },
    {
      title: "Rata-rata Nilai",
      value: stats.averageScore,
      icon: BarChart,
      color: "bg-gray-600",
      description: "Rata-rata keseluruhan"
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 text-gray-900 dark:text-gray-100">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
          Selamat datang di sistem manajemen nilai siswa
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
        {statCards.map((card, index) => (
          <Card key={index} className="glass-card hover:shadow-lg transition-all duration-300 group border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                  {card.title}
                </CardTitle>
                <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{card.value}</div>
              </div>
              <div className={`p-2.5 sm:p-3 rounded-lg ${card.color} group-hover:scale-105 transition-transform duration-300 shadow-sm`}>
                <card.icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-gray-500 dark:text-gray-500">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center">
                <BarChart size={14} className="text-white" />
              </div>
              <span>Statistik Sistem</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Sistem telah mencatat {stats.totalClasses} kelas dengan {stats.totalStudents} siswa aktif.
              Terdapat {stats.totalSubjects} mata pelajaran dan {stats.totalCategories} kategori penilaian.
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-400">Rata-rata nilai keseluruhan</span>
              <span className={`font-bold px-3 py-1 rounded-full text-sm ${
                stats.averageScore >= 80 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                stats.averageScore >= 70 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {stats.averageScore}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
              <div className="w-6 h-6 bg-green-600 rounded-lg flex items-center justify-center">
                <Users size={14} className="text-white" />
              </div>
              <span>Informasi Sistem</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Sistem manajemen nilai yang membantu pengelolaan data akademik siswa dengan mudah dan efisien.
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Status Sistem</span>
                <span className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-600 dark:text-green-400 font-medium">Aktif</span>
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Versi</span>
                <span className="text-gray-900 dark:text-gray-100 font-medium">v1.0.0</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

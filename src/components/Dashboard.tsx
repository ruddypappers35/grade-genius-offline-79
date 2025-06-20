import React, { useState, useEffect } from "react";
import { GraduationCap, Users, Tag, BarChart, BookOpen, Download, Wifi, WifiOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Dashboard = () => {
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    totalSubjects: 0,
    totalCategories: 0,
    averageScore: 0
  });

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

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

    // PWA install prompt handler
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    // Online/offline status handlers
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;
    
    if (!isStandalone && !isInWebAppiOS) {
      setShowInstallButton(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setShowInstallButton(false);
      }
      
      setDeferredPrompt(null);
    } else {
      // Fallback for browsers that don't support the install prompt
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS) {
        alert('Untuk menginstal aplikasi di iOS: Tekan tombol Share, lalu pilih "Add to Home Screen"');
      } else {
        alert('Untuk menginstal aplikasi: Buka menu browser Anda dan pilih "Install App" atau "Add to Home Screen"');
      }
    }
  };

  const statCards = [
    {
      title: "Total Kelas",
      value: stats.totalClasses,
      icon: GraduationCap,
      color: "bg-blue-500",
      description: "Kelas aktif"
    },
    {
      title: "Total Siswa",
      value: stats.totalStudents,
      icon: Users,
      color: "bg-green-500",
      description: "Siswa terdaftar"
    },
    {
      title: "Mata Pelajaran",
      value: stats.totalSubjects,
      icon: BookOpen,
      color: "bg-orange-500",
      description: "Mata pelajaran"
    },
    {
      title: "Kategori Nilai",
      value: stats.totalCategories,
      icon: Tag,
      color: "bg-purple-500",
      description: "Kategori penilaian"
    },
    {
      title: "Rata-rata Nilai",
      value: stats.averageScore,
      icon: BarChart,
      color: "bg-indigo-500",
      description: "Rata-rata keseluruhan"
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="text-center sm:text-left mb-4 sm:mb-0">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 text-gray-900">
            Dashboard
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Selamat datang di sistem manajemen nilai siswa
          </p>
          {/* Offline indicator */}
          <div className="flex items-center space-x-2 mt-2">
            {isOnline ? (
              <div className="flex items-center space-x-1 text-green-600">
                <Wifi size={14} />
                <span className="text-xs">Online</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 text-orange-600">
                <WifiOff size={14} />
                <span className="text-xs">Mode Offline</span>
              </div>
            )}
          </div>
        </div>
        
        {showInstallButton && (
          <Button
            onClick={handleInstallClick}
            className="bg-blue-500 hover:bg-blue-600 text-white flex items-center space-x-2"
          >
            <Download size={16} />
            <span>Instal Aplikasi</span>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
        {statCards.map((card, index) => (
          <Card key={index} className="bg-white border border-gray-200 hover:shadow-lg transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
                  {card.title}
                </CardTitle>
                <div className="text-xl sm:text-2xl font-bold text-gray-900">{card.value}</div>
              </div>
              <div className={`p-2.5 sm:p-3 rounded-lg ${card.color} group-hover:scale-105 transition-transform duration-300 shadow-sm`}>
                <card.icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-gray-500">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center">
                <BarChart size={14} className="text-white" />
              </div>
              <span>Statistik Sistem</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-600">
              Sistem telah mencatat {stats.totalClasses} kelas dengan {stats.totalStudents} siswa aktif.
              Terdapat {stats.totalSubjects} mata pelajaran dan {stats.totalCategories} kategori penilaian.
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
              <span className="text-sm text-gray-600">Rata-rata nilai keseluruhan</span>
              <span className={`font-bold px-3 py-1 rounded-full text-sm ${
                stats.averageScore >= 80 ? 'bg-green-100 text-green-700 border border-green-200' :
                stats.averageScore >= 70 ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                'bg-red-100 text-red-700 border border-red-200'
              }`}>
                {stats.averageScore}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <div className="w-6 h-6 bg-green-500 rounded-lg flex items-center justify-center">
                <Users size={14} className="text-white" />
              </div>
              <span>Informasi Sistem</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-600">
              Sistem manajemen nilai yang membantu pengelolaan data akademik siswa dengan mudah dan efisien.
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Status Sistem</span>
                <span className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-600 font-medium">Aktif</span>
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Mode</span>
                <span className={`font-medium ${isOnline ? 'text-green-600' : 'text-orange-600'}`}>
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Versi</span>
                <span className="text-gray-900 font-medium">v1.0.0</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

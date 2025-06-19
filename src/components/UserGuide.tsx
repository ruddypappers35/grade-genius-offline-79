
import { Book, Users, GraduationCap, Tag, Scale, FileText, BarChart3, Database } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const UserGuide = () => {
  const guideSteps = [
    {
      icon: GraduationCap,
      title: "1. Kelola Kelas",
      description: "Mulai dengan membuat kelas-kelas yang akan digunakan dalam sistem.",
      steps: [
        "Buka menu 'Kelas'",
        "Klik 'Tambah Kelas'",
        "Isi nama kelas (contoh: VII-A, VIII-B, IX-C)",
        "Simpan data kelas"
      ]
    },
    {
      icon: Users,
      title: "2. Kelola Siswa",
      description: "Tambahkan data siswa dan assign ke kelas yang sudah dibuat.",
      steps: [
        "Buka menu 'Siswa'",
        "Klik 'Tambah Siswa'",
        "Isi nama siswa dan NIS",
        "Pilih kelas untuk siswa tersebut",
        "Simpan data siswa"
      ]
    },
    {
      icon: Book,
      title: "3. Kelola Mata Pelajaran",
      description: "Buat daftar mata pelajaran yang akan dinilai.",
      steps: [
        "Buka menu 'Mata Pelajaran'",
        "Klik 'Tambah Mata Pelajaran'",
        "Isi nama mata pelajaran (contoh: Matematika, IPA, Bahasa Indonesia)",
        "Isi deskripsi jika diperlukan",
        "Simpan data mata pelajaran"
      ]
    },
    {
      icon: Tag,
      title: "4. Kelola Kategori Penilaian",
      description: "Tentukan kategori penilaian yang akan digunakan.",
      steps: [
        "Buka menu 'Kategori'",
        "Klik 'Tambah Kategori'",
        "Isi nama kategori (contoh: UH - Ulangan Harian, UTS, UAS)",
        "Isi deskripsi kategori",
        "Simpan data kategori"
      ]
    },
    {
      icon: Scale,
      title: "5. Atur Bobot Penilaian",
      description: "Tentukan bobot untuk setiap kategori penilaian.",
      steps: [
        "Buka menu 'Bobot'",
        "Pilih mata pelajaran",
        "Atur bobot untuk setiap kategori (pastikan total = 100%)",
        "Contoh: UH 40%, UTS 30%, UAS 30%",
        "Simpan pengaturan bobot"
      ]
    },
    {
      icon: FileText,
      title: "6. Input Nilai Siswa",
      description: "Masukkan nilai siswa berdasarkan penilaian yang telah dibuat.",
      steps: [
        "Buka menu 'Input Nilai'",
        "Pilih kelas, mata pelajaran, dan kategori",
        "Buat penilaian baru (contoh: UH 1, UH 2) atau pilih yang sudah ada",
        "Input nilai untuk setiap siswa (0-100)",
        "Klik '✓' untuk menyimpan atau 'Simpan Semua'"
      ]
    },
    {
      icon: BarChart3,
      title: "7. Lihat Rekap Nilai",
      description: "Analisis dan cetak laporan nilai siswa.",
      steps: [
        "Buka menu 'Rekap Nilai'",
        "Pilih kelas dan mata pelajaran",
        "Lihat nilai rata-rata dan detail per siswa",
        "Export data ke Excel jika diperlukan",
        "Cetak laporan untuk dokumentasi"
      ]
    },
    {
      icon: Database,
      title: "8. Kelola Data",
      description: "Backup dan restore data sistem untuk keamanan.",
      steps: [
        "Buka menu 'Data'",
        "Gunakan 'Export Data' untuk backup",
        "Gunakan 'Import Data' untuk restore",
        "Gunakan 'Reset Data' untuk membersihkan sistem (hati-hati!)",
        "Lakukan backup secara berkala"
      ]
    }
  ];

  const tips = [
    "Pastikan semua master data (kelas, siswa, mata pelajaran, kategori) sudah lengkap sebelum input nilai",
    "Atur bobot penilaian dengan hati-hati karena akan mempengaruhi perhitungan nilai akhir",
    "Lakukan backup data secara berkala untuk menghindari kehilangan data",
    "Gunakan nama yang konsisten untuk memudahkan pengelolaan data",
    "Periksa kembali nilai yang diinput sebelum menyimpan"
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-900">
          Cara Penggunaan Aplikasi
        </h1>
        <p className="text-gray-600">Panduan lengkap penggunaan Sistem Manajemen Nilai</p>
      </div>

      <Card className="bg-blue-50 border border-blue-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-blue-900 flex items-center">
            <Book size={20} className="mr-2" />
            Gambaran Umum
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-blue-800">
            Sistem Manajemen Nilai ini dirancang untuk membantu guru dan sekolah dalam mengelola nilai siswa 
            secara digital. Sistem ini mendukung berbagai kategori penilaian dengan bobot yang dapat disesuaikan, 
            serta menyediakan fitur rekap dan analisis nilai yang komprehensif.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        <h2 className="text-xl font-semibold text-gray-900">Langkah-langkah Penggunaan</h2>
        
        {guideSteps.map((step, index) => (
          <Card key={index} className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center">
                <div className="p-2 rounded-lg bg-blue-500 mr-3">
                  <step.icon size={20} className="text-white" />
                </div>
                {step.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{step.description}</p>
              <div className="space-y-2">
                {step.steps.map((stepItem, stepIndex) => (
                  <div key={stepIndex} className="flex items-start">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center mr-3 mt-0.5 font-medium">
                      {stepIndex + 1}
                    </div>
                    <span className="text-gray-700 text-sm">{stepItem}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-yellow-50 border border-yellow-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-yellow-900">💡 Tips & Saran</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {tips.map((tip, index) => (
              <li key={index} className="flex items-start">
                <div className="w-2 h-2 rounded-full bg-yellow-500 mr-3 mt-2"></div>
                <span className="text-yellow-800 text-sm">{tip}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="bg-green-50 border border-green-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-green-900">🎯 Alur Kerja yang Disarankan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {['Kelas', 'Siswa', 'Mata Pelajaran', 'Kategori', 'Bobot', 'Input Nilai', 'Rekap Nilai'].map((item, index) => (
              <div key={index} className="flex items-center">
                <div className="px-3 py-1 bg-green-500 text-white text-sm rounded-full">
                  {item}
                </div>
                {index < 6 && <div className="mx-2 text-green-500">→</div>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

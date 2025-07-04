
import { Routes, Route } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Dashboard } from "@/components/Dashboard";
import { ClassManagement } from "@/components/ClassManagement";
import { StudentManagement } from "@/components/StudentManagement";
import { SubjectManagement } from "@/components/SubjectManagement";
import { ScheduleManagement } from "@/components/ScheduleManagement";
import { CategoryManagement } from "@/components/CategoryManagement";
import { WeightManagement } from "@/components/WeightManagement";
import { ScoreInput } from "@/components/ScoreInput";
import { ScoreReport } from "@/components/ScoreReport";
import { AttendanceInput } from "@/components/AttendanceInput";
import { AttendanceReport } from "@/components/AttendanceReport";
import { DataManagement } from "@/components/DataManagement";
import { UserGuide } from "@/components/UserGuide";
import NotFound from "./NotFound";
import { useState } from "react";

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <div className="flex-1 min-h-screen flex flex-col">
          <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          
          <main className="p-3 sm:p-6 flex-1">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/classes" element={<ClassManagement />} />
              <Route path="/students" element={<StudentManagement />} />
              <Route path="/subjects" element={<SubjectManagement />} />
              <Route path="/schedule" element={<ScheduleManagement />} />
              <Route path="/categories" element={<CategoryManagement />} />
              <Route path="/weights" element={<WeightManagement />} />
              <Route path="/scores" element={<ScoreInput />} />
              <Route path="/reports" element={<ScoreReport />} />
              <Route path="/attendance" element={<AttendanceInput />} />
              <Route path="/attendance-report" element={<AttendanceReport />} />
              <Route path="/data" element={<DataManagement />} />
              <Route path="/guide" element={<UserGuide />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          
          <footer className="mt-auto p-4 border-t border-gray-200 text-center bg-white">
            <p className="text-gray-600 text-sm">
              Developed with <span className="text-lg">☕</span> by <span className="text-gray-900 font-medium">Rudy Susanto</span>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Index;

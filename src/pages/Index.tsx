
import { Routes, Route } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Dashboard } from "@/components/Dashboard";
import { ClassManagement } from "@/components/ClassManagement";
import { StudentManagement } from "@/components/StudentManagement";
import { SubjectManagement } from "@/components/SubjectManagement";
import { CategoryManagement } from "@/components/CategoryManagement";
import { WeightManagement } from "@/components/WeightManagement";
import { ScoreInput } from "@/components/ScoreInput";
import { ScoreReport } from "@/components/ScoreReport";
import { DataManagement } from "@/components/DataManagement";
import { useState } from "react";

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-foreground flex flex-col">
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
              <Route path="/categories" element={<CategoryManagement />} />
              <Route path="/weights" element={<WeightManagement />} />
              <Route path="/scores" element={<ScoreInput />} />
              <Route path="/reports" element={<ScoreReport />} />
              <Route path="/data" element={<DataManagement />} />
            </Routes>
          </main>
          
          <footer className="mt-auto p-4 border-t border-border/50 text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Developed by <span className="text-gray-900 dark:text-gray-100 font-medium">Rudy Susanto</span>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Index;

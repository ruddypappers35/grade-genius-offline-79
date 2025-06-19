
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { 
  Home, 
  GraduationCap, 
  Users, 
  Tag, 
  Scale, 
  FileText, 
  BarChart3, 
  Database,
  BookOpen,
  Menu,
  X 
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar = ({ isOpen, onToggle }: SidebarProps) => {
  const menuItems = [
    { icon: Home, label: "Dashboard", path: "/", color: "bg-gray-600" },
    { icon: GraduationCap, label: "Kelas", path: "/classes", color: "bg-blue-600" },
    { icon: Users, label: "Siswa", path: "/students", color: "bg-green-600" },
    { icon: BookOpen, label: "Mata Pelajaran", path: "/subjects", color: "bg-orange-600" },
    { icon: Tag, label: "Kategori", path: "/categories", color: "bg-gray-600" },
    { icon: Scale, label: "Bobot", path: "/weights", color: "bg-blue-600" },
    { icon: FileText, label: "Input Nilai", path: "/scores", color: "bg-green-600" },
    { icon: BarChart3, label: "Rekap Nilai", path: "/reports", color: "bg-orange-600" },
    { icon: Database, label: "Data", path: "/data", color: "bg-gray-600" },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full glass-card border-0 border-r border-border/50
        transition-transform duration-300 ease-out z-50
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
        w-64 sm:w-72
      `}>
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border/50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-700 dark:bg-gray-300 rounded-lg flex items-center justify-center shadow-sm">
              <GraduationCap size={18} className="text-white dark:text-gray-700" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
              Sistem Nilai
            </h2>
          </div>
          <button
            onClick={onToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
          >
            <X size={20} className="text-foreground" />
          </button>
        </div>
        
        <nav className="mt-4 sm:mt-6 px-3 sm:px-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 sm:px-4 py-3 sm:py-3.5 rounded-lg transition-all duration-200 group ${
                      isActive
                        ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium shadow-sm"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    }`
                  }
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      onToggle();
                    }
                  }}
                >
                  <div className={`p-2 rounded-lg ${item.color} shadow-sm`}>
                    <item.icon size={16} className="text-white" />
                  </div>
                  <span className="font-medium text-sm sm:text-base">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
};

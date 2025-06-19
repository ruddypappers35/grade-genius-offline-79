
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
  X,
  HelpCircle
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar = ({ isOpen, onToggle }: SidebarProps) => {
  const menuItems = [
    { icon: Home, label: "Dashboard", path: "/", color: "bg-gray-600" },
    { icon: GraduationCap, label: "Kelas", path: "/classes", color: "bg-blue-500" },
    { icon: Users, label: "Siswa", path: "/students", color: "bg-green-500" },
    { icon: BookOpen, label: "Mata Pelajaran", path: "/subjects", color: "bg-orange-500" },
    { icon: Tag, label: "Kategori", path: "/categories", color: "bg-purple-500" },
    { icon: Scale, label: "Bobot", path: "/weights", color: "bg-indigo-500" },
    { icon: FileText, label: "Input Nilai", path: "/scores", color: "bg-teal-500" },
    { icon: BarChart3, label: "Rekap Nilai", path: "/reports", color: "bg-red-500" },
    { icon: Database, label: "Data", path: "/data", color: "bg-gray-500" },
    { icon: HelpCircle, label: "Cara Penggunaan", path: "/guide", color: "bg-yellow-500" },
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
        fixed top-0 left-0 h-full bg-white border-r border-gray-200 shadow-lg
        transition-transform duration-300 ease-out z-50
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
        w-64 sm:w-72
      `}>
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shadow-sm">
              <GraduationCap size={18} className="text-white" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              Sistem Nilai
            </h2>
          </div>
          <button
            onClick={onToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            <X size={20} className="text-gray-700" />
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
                        ? "bg-blue-50 text-blue-700 font-medium shadow-sm border border-blue-200"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
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

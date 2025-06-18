
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
    { icon: Home, label: "Dashboard", path: "/" },
    { icon: GraduationCap, label: "Kelas", path: "/classes" },
    { icon: Users, label: "Siswa", path: "/students" },
    { icon: BookOpen, label: "Mata Pelajaran", path: "/subjects" },
    { icon: Tag, label: "Kategori", path: "/categories" },
    { icon: Scale, label: "Bobot", path: "/weights" },
    { icon: FileText, label: "Input Nilai", path: "/scores" },
    { icon: BarChart3, label: "Rekap Nilai", path: "/reports" },
    { icon: Database, label: "Data", path: "/data" },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-black/30 backdrop-blur-lg border-r border-white/10 
        transition-transform duration-300 ease-in-out z-50
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
        w-64
      `}>
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Sistem Nilai
          </h2>
          <button
            onClick={onToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={20} className="text-white" />
          </button>
        </div>
        
        <nav className="mt-6 px-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-blue-500/30"
                        : "text-gray-300 hover:text-white hover:bg-white/5"
                    }`
                  }
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      onToggle();
                    }
                  }}
                >
                  <item.icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
};

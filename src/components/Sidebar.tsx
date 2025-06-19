
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
    { icon: Home, label: "Dashboard", path: "/", gradient: "fresh-gradient-blue" },
    { icon: GraduationCap, label: "Kelas", path: "/classes", gradient: "fresh-gradient-purple" },
    { icon: Users, label: "Siswa", path: "/students", gradient: "fresh-gradient-green" },
    { icon: BookOpen, label: "Mata Pelajaran", path: "/subjects", gradient: "fresh-gradient-orange" },
    { icon: Tag, label: "Kategori", path: "/categories", gradient: "fresh-gradient-blue" },
    { icon: Scale, label: "Bobot", path: "/weights", gradient: "fresh-gradient-purple" },
    { icon: FileText, label: "Input Nilai", path: "/scores", gradient: "fresh-gradient-green" },
    { icon: BarChart3, label: "Rekap Nilai", path: "/reports", gradient: "fresh-gradient-orange" },
    { icon: Database, label: "Data", path: "/data", gradient: "fresh-gradient-blue" },
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
            <div className="w-8 h-8 fresh-gradient-purple rounded-xl flex items-center justify-center shadow-lg">
              <GraduationCap size={18} className="text-white" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-gradient">
              Sistem Nilai
            </h2>
          </div>
          <button
            onClick={onToggle}
            className="lg:hidden p-2 rounded-xl hover:bg-primary/10 transition-colors duration-200"
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
                    `flex items-center space-x-3 px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl transition-all duration-200 group ${
                      isActive
                        ? "bg-primary/10 text-primary font-medium shadow-sm border border-primary/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`
                  }
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      onToggle();
                    }
                  }}
                >
                  <div className={`p-2 rounded-lg ${item.gradient} shadow-sm group-hover:shadow-md transition-shadow duration-200`}>
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

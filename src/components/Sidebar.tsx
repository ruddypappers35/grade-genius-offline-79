
import { NavLink } from "react-router-dom";
import { Home, Users, GraduationCap, Tag, Scale, Edit, BarChart, Database, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar = ({ isOpen, onToggle }: SidebarProps) => {
  const menuItems = [
    { icon: Home, label: "Dashboard", path: "/" },
    { icon: GraduationCap, label: "Kelola Kelas", path: "/classes" },
    { icon: Users, label: "Kelola Siswa", path: "/students" },
    { icon: Tag, label: "Kategori Nilai", path: "/categories" },
    { icon: Scale, label: "Bobot Nilai", path: "/weights" },
    { icon: Edit, label: "Input Nilai", path: "/scores" },
    { icon: BarChart, label: "Rekap Nilai", path: "/reports" },
    { icon: Database, label: "Data Management", path: "/data" },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed lg:relative inset-y-0 left-0 z-50 w-64 bg-black/20 backdrop-blur-lg border-r border-white/10 transform transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Sistem Nilai
          </h1>
          <button
            onClick={onToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <Menu size={20} />
          </button>
        </div>
        
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group",
                isActive 
                  ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border border-blue-500/30" 
                  : "hover:bg-white/10 text-gray-300 hover:text-white"
              )}
              onClick={() => window.innerWidth < 1024 && onToggle()}
            >
              <item.icon size={20} className="group-hover:scale-110 transition-transform" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
};

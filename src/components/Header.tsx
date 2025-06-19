
import { Menu, Bell, User } from "lucide-react";

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  return (
    <header className="glass-card border-0 border-b border-border/50 px-4 sm:px-6 py-3 sm:py-4 sticky top-0 z-40">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl hover:bg-primary/10 transition-colors duration-200"
          >
            <Menu size={20} className="text-foreground" />
          </button>
          
          <div className="hidden sm:block">
            <h2 className="text-lg sm:text-xl font-semibold text-gradient">
              Sistem Manajemen Nilai
            </h2>
            <p className="text-xs text-muted-foreground hidden md:block">
              Dashboard untuk pengelolaan nilai siswa
            </p>
          </div>
          
          <div className="block sm:hidden">
            <h2 className="text-base font-semibold text-gradient">
              Sistem Nilai
            </h2>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-4">
          <button className="p-2 rounded-xl hover:bg-primary/10 transition-colors duration-200 relative">
            <Bell size={18} className="text-foreground sm:w-5 sm:h-5" />
            <span className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[10px] sm:text-xs font-medium">
              3
            </span>
          </button>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 fresh-gradient-purple rounded-full flex items-center justify-center shadow-lg">
              <User size={16} className="text-white" />
            </div>
            <span className="hidden md:block text-sm font-medium text-foreground">Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
};

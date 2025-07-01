
import React from "react";
import { Menu, Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UpdateButton } from "@/components/UpdateButton";

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  return (
    <header className="bg-white border-b border-gray-200 p-3 sm:p-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <div className="hidden sm:block">
          <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
            Grade Genius
          </h1>
          <p className="text-xs sm:text-sm text-gray-600">
            Sistem Manajemen Nilai & Kehadiran
          </p>
        </div>
        
        <div className="sm:hidden">
          <h1 className="text-base font-semibold text-gray-900">Grade Genius</h1>
        </div>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-4">
        <UpdateButton />
        
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
        </Button>
        
        <Button variant="ghost" size="icon">
          <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </div>
    </header>
  );
};

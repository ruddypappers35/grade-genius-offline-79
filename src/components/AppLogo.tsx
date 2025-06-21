
import React from "react";
import { NotebookPen } from "lucide-react";

interface AppLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export const AppLogo = ({ size = 192, className = "", showText = true }: AppLogoProps) => {
  const iconSize = Math.floor(size * 0.4);
  const fontSize = Math.floor(size * 0.12);
  
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div 
        className="relative flex items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg"
        style={{
          width: size,
          height: size,
          filter: 'drop-shadow(0 4px 12px rgba(37, 99, 235, 0.3))',
        }}
      >
        {/* Soft background circle */}
        <div 
          className="absolute inset-2 rounded-full bg-white/10 backdrop-blur-sm"
          style={{
            background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 70%)'
          }}
        />
        
        {/* Main icon */}
        <NotebookPen 
          size={iconSize}
          className="text-white relative z-10"
          strokeWidth={1.5}
        />
        
        {/* Green accent dot */}
        <div 
          className="absolute bottom-3 right-3 rounded-full bg-green-500 shadow-sm z-20"
          style={{
            width: Math.floor(size * 0.15),
            height: Math.floor(size * 0.15),
            background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)'
          }}
        />
      </div>
      
      {showText && size >= 192 && (
        <div className="mt-3 text-center">
          <h3 
            className="font-bold text-gray-800"
            style={{ fontSize: `${fontSize}px` }}
          >
            Sumatif App
          </h3>
          <p 
            className="text-gray-600 font-medium"
            style={{ fontSize: `${Math.floor(fontSize * 0.7)}px` }}
          >
            Sistem Nilai
          </p>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  size = 'md', 
  showText = true 
}) => {
  const { theme } = useTheme();
  
  // Determine which logo to use based on theme
  const logoSrc = theme === 'dark' 
    ? '/logo_2_transparent.png'  // Dark theme logo
    : '/logo_1.png';             // Light theme logo

  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl'
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img 
        src={logoSrc} 
        alt="Studia Logo" 
        className={`${sizeClasses[size]} object-contain`}
      />
      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold ${textSizeClasses[size]} text-primary`}>
            Studia
          </span>
          <span className={`text-xs ${textSizeClasses[size] === 'text-sm' ? 'text-xs' : 'text-xs'} text-muted-foreground`}>
            Your AI Study Companion
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo; 
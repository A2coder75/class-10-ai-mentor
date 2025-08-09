import React from 'react';
import Logo from './Logo';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ 
  title, 
  subtitle, 
  showLogo = true,
  className = '' 
}) => {
  return (
    <div className={`mb-6 ${className}`}>
      {showLogo && (
        <div className="flex justify-center mb-4">
          <Logo size="md" />
        </div>
      )}
      {title && (
        <h1 className="text-2xl font-bold mb-2 text-primary">
          {title}
        </h1>
      )}
      {subtitle && (
        <p className="text-muted-foreground">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default Header; 
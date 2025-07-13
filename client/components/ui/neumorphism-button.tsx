import React from 'react';

interface NeumorphButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

export const NeumorphButton: React.FC<NeumorphButtonProps> = ({ 
  children, 
  onClick, 
  className = "",
  variant = 'primary',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  return (
    <button
      onClick={onClick}
      className={`
        relative font-bold text-white rounded-full cursor-pointer transition-all duration-200
        ${sizeClasses[size]}
        ${className}
      `}
      style={{
        background: 'linear-gradient(to bottom, #171717, #242424)',
        border: '1px solid #292929',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 1), 0 10px 20px rgba(0, 0, 0, 0.4)'
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.transform = 'translateY(2px)';
        e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 1), 0 5px 10px rgba(0, 0, 0, 0.4)';
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 1), 0 10px 20px rgba(0, 0, 0, 0.4)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 1), 0 10px 20px rgba(0, 0, 0, 0.4)';
      }}
    >
      {/* Gradient border effect */}
      <div 
        className="absolute inset-0 rounded-full -z-10"
        style={{
          background: 'linear-gradient(to bottom, #292929, #000000)',
          top: '-2px',
          right: '-1px',
          bottom: '-1px',
          left: '-1px'
        }}
      />
      {children}
    </button>
  );
};

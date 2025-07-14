import React from 'react';

interface VoiceCardProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'default' | 'button' | 'input';
  disabled?: boolean;
}

export const VoiceCard: React.FC<VoiceCardProps> = ({ 
  children, 
  onClick, 
  className = '', 
  variant = 'default',
  disabled = false 
}) => {
  const baseStyle = {
    borderRadius: '26px',
    background: '#73ff00',
    boxShadow: '23px 23px 46px #429100, -23px -23px 46px #a4ff00'
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'button':
        return `cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`;
      case 'input':
        return 'focus-within:ring-2 focus-within:ring-black/20';
      default:
        return '';
    }
  };

  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      style={baseStyle}
      className={`p-4 ${getVariantClasses()} ${className}`}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      {children}
    </Component>
  );
};

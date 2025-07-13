import React from 'react';

interface NeumorphCardProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  isActive?: boolean;
  variant?: 'default' | 'green-button';
}

export const NeumorphCard: React.FC<NeumorphCardProps> = ({ 
  children, 
  onClick, 
  className = "",
  isActive = false,
  variant = 'default'
}) => {
  if (variant === 'green-button') {
    return (
      <div 
        onClick={onClick}
        className={`
          relative w-32 h-32 cursor-pointer transition-all duration-200 flex items-center justify-center
          ${className}
        `}
        style={{
          borderRadius: '26px',
          background: 'linear-gradient(145deg, #68e600, #7bff00)',
          boxShadow: '12px 12px 23px #429100, -12px -12px 23px #a4ff00'
        }}
      >
        <div className="text-black font-bold text-center" style={{ fontFamily: 'Orbitron, monospace' }}>
          {children}
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={onClick}
      className={`
        relative w-full h-32 rounded-xl p-1 cursor-pointer transition-all duration-200
        ${className}
      `}
      style={{
        background: '#73ff00',
        borderRadius: '38px',
        boxShadow: isActive 
          ? 'inset 13px 13px 44px #429100, inset -13px -13px 44px #a4ff00'
          : '13px 13px 44px #429100, -13px -13px 44px #a4ff00'
      }}
    >
      <div 
        className="w-full h-full rounded-xl border border-gray-700/50 bg-gradient-to-br from-gray-600/20 to-black/40 flex items-center justify-center relative overflow-hidden"
        style={{ borderRadius: '34px' }}
      >
        {/* Content */}
        <div className="relative z-10 text-black font-bold text-center" style={{ fontFamily: 'Orbitron, monospace' }}>
          {children}
        </div>

        {/* Border lines */}
        <div className="absolute top-[10%] left-0 right-0 h-px bg-gradient-to-r from-gray-500/30 via-gray-400/50 to-gray-600/30" />
        <div className="absolute bottom-[10%] left-0 right-0 h-px bg-gray-600/30" />
        <div className="absolute left-[10%] top-0 bottom-0 w-px bg-gradient-to-b from-gray-400/30 via-gray-500/50 to-gray-600/30" />
        <div className="absolute right-[10%] top-0 bottom-0 w-px bg-gray-600/30" />
      </div>
    </div>
  );
};

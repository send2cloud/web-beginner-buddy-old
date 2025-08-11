import React from 'react';

interface ToolbarButtonProps {
  onClick?: () => void;
  title?: string;
  icon: React.ReactNode;
  theme: 'light' | 'dark';
  disabled?: boolean;
  danger?: boolean;
  variant?: 'default' | 'color' | 'border';
  color?: string;
  className?: string;
}

export const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  onClick,
  title,
  icon,
  theme,
  disabled = false,
  danger = false,
  variant = 'default',
  color,
  className = '',
}) => {
  const getButtonStyles = () => {
    const baseStyles = 'p-1.5 rounded transition-colors';
    
    if (disabled) {
      return `${baseStyles} opacity-50 cursor-not-allowed`;
    }

    if (variant === 'color') {
      return `${baseStyles} w-5 h-5 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform`;
    }

    if (variant === 'border') {
      return `${baseStyles} w-5 h-5 rounded-full border-2 hover:scale-110 transition-transform`;
    }

    // Default variant
    const hoverColor = danger 
      ? (theme === 'dark' ? 'hover:bg-red-900' : 'hover:bg-red-100')
      : (theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100');
    
    const textColor = danger
      ? (theme === 'dark' ? 'text-red-400' : 'text-red-600')
      : (theme === 'dark' ? 'text-gray-300' : 'text-gray-600');

    return `${baseStyles} ${hoverColor} ${textColor}`;
  };

  const buttonStyle = variant === 'color' 
    ? { backgroundColor: color }
    : variant === 'border'
    ? { backgroundColor: 'transparent', borderColor: color }
    : {};

  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`${getButtonStyles()} ${className}`}
      style={buttonStyle}
    >
      {icon}
    </button>
  );
};
import React from 'react';
import { Palette, Square, Ungroup } from 'lucide-react';
import { SIMPLE_COLORS } from '../utils/constants';
import { useDynamicToolbarPosition } from '../hooks/useDynamicToolbarPosition';

interface GroupToolbarProps {
  position: { x: number; y: number };
  theme: 'light' | 'dark';
  onColorChange: (color: string) => void;
  onBorderChange: (color: string) => void;
  onUngroup: () => void;
}

export const GroupToolbar: React.FC<GroupToolbarProps> = ({
  position,
  theme,
  onColorChange,
  onBorderChange,
  onUngroup
}) => {
  const toolbarPos = useDynamicToolbarPosition({
    position,
    toolbarWidth: 300,
    toolbarHeight: 60,
    offsetY: -80
  });

  return (
    <div
      className={`absolute z-20 flex items-center gap-2 p-2 rounded-lg shadow-xl border backdrop-blur-sm ${
        theme === 'dark'
          ? 'bg-gray-800/90 border-gray-600'
          : 'bg-white/90 border-gray-200'
      }`}
      style={{
        left: toolbarPos.x,
        top: toolbarPos.y,
        transform: 'translateX(-50%)'
      }}
    >
      {/* Background Colors */}
      <div className="flex items-center gap-1">
        <Palette size={14} className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
        {SIMPLE_COLORS.map((color) => (
          <button
            key={color.name}
            onClick={() => onColorChange(color.color)}
            className="w-5 h-5 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform"
            style={{ backgroundColor: color.color }}
            title={`${color.name} background`}
          />
        ))}
      </div>

      <div className={`w-px h-6 ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`} />

      {/* Border Colors */}
      <div className="flex items-center gap-1">
        <Square size={14} className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
        {SIMPLE_COLORS.map((color) => (
          <button
            key={color.name}
            onClick={() => onBorderChange(color.color)}
            className="w-5 h-5 rounded-full border-2 hover:scale-110 transition-transform"
            style={{ 
              backgroundColor: 'transparent',
              borderColor: color.color
            }}
            title={`${color.name} border`}
          />
        ))}
      </div>

      <div className={`w-px h-6 ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`} />

      {/* Ungroup */}
      <button
        onClick={onUngroup}
        className={`p-2 rounded hover:bg-red-100 dark:hover:bg-red-900 transition-colors ${
          theme === 'dark' ? 'text-red-400' : 'text-red-600'
        }`}
        title="Ungroup (Ctrl+Shift+G)"
      >
        <Ungroup size={16} />
      </button>
    </div>
  );
};
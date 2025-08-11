import React, { useState } from 'react';
import { Sun, Moon, Download, Upload, RotateCcw, ZoomIn, ZoomOut, Save, ChevronDown, ChevronUp, Bold, Italic, Underline, Strikethrough, Minus, Plus, Square, Circle } from 'lucide-react';
import { COLORS } from '../utils/constants';

interface UnifiedToolbarProps {
  theme: 'light' | 'dark';
  scale: number;
  onThemeToggle: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onReset: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onSave: () => void;
  onGlobalColorChange: (type: 'background' | 'border', color: string) => void;
  onGlobalTextFormat: (format: 'bold' | 'italic' | 'underline' | 'strikethrough') => void;
  onGlobalFontSizeChange: (increase: boolean) => void;
  onGlobalShapeChange: (shape: 'rectangle' | 'rounded' | 'pill') => void;
}

export const UnifiedToolbar: React.FC<UnifiedToolbarProps> = ({
  theme,
  scale,
  onThemeToggle,
  onExport,
  onImport,
  onReset,
  onZoomIn,
  onZoomOut,
  onSave,
  onGlobalColorChange,
  onGlobalTextFormat,
  onGlobalFontSizeChange,
  onGlobalShapeChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleImportClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        onImport(file);
      }
    };
    input.click();
  };

  return (
    <div className={`absolute top-4 right-4 z-10 rounded-lg shadow-lg border transition-all duration-300 ${
      theme === 'dark' 
        ? 'bg-gray-800 border-gray-600' 
        : 'bg-white border-gray-200'
    }`}>
      {/* Minimized View - Always Visible */}
      <div className="flex items-center gap-2 p-2">
        {/* Essential Controls */}
        <button
          onClick={onZoomOut}
          className={`p-2 rounded-md transition-colors hover:bg-opacity-80 ${
            theme === 'dark'
              ? 'text-gray-300 hover:bg-gray-700'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          title="Zoom Out"
        >
          <ZoomOut size={18} />
        </button>

        <span className={`text-sm font-mono px-2 ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
        }`}>
          {Math.round(scale * 100)}%
        </span>

        <button
          onClick={onZoomIn}
          className={`p-2 rounded-md transition-colors hover:bg-opacity-80 ${
            theme === 'dark'
              ? 'text-gray-300 hover:bg-gray-700'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          title="Zoom In"
        >
          <ZoomIn size={18} />
        </button>

        <div className={`w-px h-6 ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`} />

        <button
          onClick={onThemeToggle}
          className={`p-2 rounded-md transition-colors hover:bg-opacity-80 ${
            theme === 'dark'
              ? 'text-yellow-400 hover:bg-yellow-900'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button
          onClick={onSave}
          className={`p-2 rounded-md transition-colors hover:bg-opacity-80 ${
            theme === 'dark'
              ? 'text-green-400 hover:bg-green-900'
              : 'text-green-600 hover:bg-green-100'
          }`}
          title="Save"
        >
          <Save size={18} />
        </button>

        <div className={`w-px h-6 ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`} />

        {/* Expand/Collapse Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`p-2 rounded-md transition-colors hover:bg-opacity-80 ${
            theme === 'dark'
              ? 'text-gray-300 hover:bg-gray-700'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          title={isExpanded ? 'Collapse toolbar' : 'Expand toolbar'}
        >
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {/* Expanded View - Conditional */}
      {isExpanded && (
        <div className={`border-t p-3 space-y-3 ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
          {/* File Operations */}
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              File:
            </span>
            <button
              onClick={onExport}
              className={`p-2 rounded-md transition-colors hover:bg-opacity-80 ${
                theme === 'dark'
                  ? 'text-blue-400 hover:bg-blue-900'
                  : 'text-blue-600 hover:bg-blue-100'
              }`}
              title="Export JSON"
            >
              <Download size={16} />
            </button>
            <button
              onClick={handleImportClick}
              className={`p-2 rounded-md transition-colors hover:bg-opacity-80 ${
                theme === 'dark'
                  ? 'text-purple-400 hover:bg-purple-900'
                  : 'text-purple-600 hover:bg-purple-100'
              }`}
              title="Import JSON"
            >
              <Upload size={16} />
            </button>
            <button
              onClick={onReset}
              className={`p-2 rounded-md transition-colors hover:bg-opacity-80 ${
                theme === 'dark'
                  ? 'text-red-400 hover:bg-red-900'
                  : 'text-red-600 hover:bg-red-100'
              }`}
              title="Reset All"
            >
              <RotateCcw size={16} />
            </button>
          </div>

          {/* Global Formatting */}
          <div className="space-y-2">
            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Global Format:
            </span>
            
            {/* Background Colors */}
            <div className="flex items-center gap-2">
              <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>BG:</span>
              <div className="flex gap-1">
                {COLORS.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => onGlobalColorChange('background', theme === 'dark' ? color.dark.bg : color.light.bg)}
                    className="w-5 h-5 rounded-full border border-white shadow-sm hover:scale-110 transition-transform"
                    style={{ backgroundColor: theme === 'dark' ? color.dark.bg : color.light.bg }}
                    title={`Apply ${color.name} background to all nodes`}
                  />
                ))}
              </div>
            </div>

            {/* Border Colors */}
            <div className="flex items-center gap-2">
              <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Border:</span>
              <div className="flex gap-1">
                {COLORS.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => onGlobalColorChange('border', theme === 'dark' ? color.dark.border : color.light.border)}
                    className="w-5 h-5 rounded-full border-2 hover:scale-110 transition-transform"
                    style={{ 
                      backgroundColor: 'transparent',
                      borderColor: theme === 'dark' ? color.dark.border : color.light.border
                    }}
                    title={`Apply ${color.name} border to all nodes`}
                  />
                ))}
              </div>
            </div>

            {/* Text Formatting */}
            <div className="flex items-center gap-2">
              <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Text:</span>
              <div className="flex gap-1">
                <button
                  onClick={() => onGlobalTextFormat('bold')}
                  className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}
                  title="Apply bold to all nodes"
                >
                  <Bold size={14} />
                </button>
                <button
                  onClick={() => onGlobalTextFormat('italic')}
                  className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}
                  title="Apply italic to all nodes"
                >
                  <Italic size={14} />
                </button>
                <button
                  onClick={() => onGlobalTextFormat('underline')}
                  className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}
                  title="Apply underline to all nodes"
                >
                  <Underline size={14} />
                </button>
                <button
                  onClick={() => onGlobalTextFormat('strikethrough')}
                  className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}
                  title="Apply strikethrough to all nodes"
                >
                  <Strikethrough size={14} />
                </button>
                
                <div className={`w-px h-4 mx-1 ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`} />
                
                <button
                  onClick={() => onGlobalFontSizeChange(false)}
                  className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}
                  title="Decrease font size for all nodes"
                >
                  <Minus size={12} />
                </button>
                <button
                  onClick={() => onGlobalFontSizeChange(true)}
                  className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}
                  title="Increase font size for all nodes"
                >
                  <Plus size={12} />
                </button>
              </div>
            </div>


            {/* Shape Controls */}
            <div className="flex items-center gap-2">
              <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Shape:</span>
              <div className="flex gap-1">
                <button
                  onClick={() => onGlobalShapeChange('rectangle')}
                  className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-all hover:shadow-md ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}
                  title="Rectangle shape"
                >
                  <Square size={14} />
                </button>
                <button
                  onClick={() => onGlobalShapeChange('rounded')}
                  className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-all hover:shadow-md ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}
                  title="Curved shape"
                >
                  <Circle size={14} />
                </button>
                <button
                  onClick={() => onGlobalShapeChange('pill')}
                  className={`px-2 py-1 rounded-full border-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all hover:shadow-md ${
                    theme === 'dark' ? 'border-gray-300 text-gray-300' : 'border-gray-600 text-gray-600'
                  }`}
                  style={{ borderRadius: '12px', minWidth: '24px', height: '24px' }}
                  title="Pill shape"
                >
                  <div className="w-2 h-2 rounded-full bg-current" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
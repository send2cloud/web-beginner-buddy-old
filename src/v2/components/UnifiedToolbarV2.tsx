import React, { useState } from 'react';
import { 
  Sun, Moon, Download, Upload, RotateCcw, ZoomIn, ZoomOut, Save,
  Bold, Italic, Minus, Plus,
  Maximize2, Minimize2, Square, Circle, Diamond
} from 'lucide-react';

interface UnifiedToolbarV2Props {
  theme: 'light' | 'dark';
  scale: number;
  onThemeToggle: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onReset: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onSave: () => void;
  onGlobalColorChange: (color: string) => void;
  onGlobalTextFormat: (format: any) => void;
  onGlobalFontSizeChange: (size: number) => void;
  onGlobalShapeChange: (shape: string) => void;
}

export const UnifiedToolbarV2: React.FC<UnifiedToolbarV2Props> = ({
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
  onGlobalShapeChange
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

  const colors = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#6B7280'];

  return (
    <div className={`fixed top-4 left-4 z-50 ${
      theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
    } border border-gray-300 rounded-lg shadow-lg p-2`}>
      
      {/* Always visible controls */}
      <div className="flex items-center gap-2 mb-2">
        <button onClick={onZoomOut} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
          <ZoomOut size={16} />
        </button>
        <span className="text-xs min-w-12 text-center">{Math.round(scale * 100)}%</span>
        <button onClick={onZoomIn} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
          <ZoomIn size={16} />
        </button>
        
        <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1" />
        
        <button onClick={onThemeToggle} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        
        <button onClick={onSave} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
          <Save size={16} />
        </button>
        
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
      </div>

      {/* Expandable section */}
      {isExpanded && (
        <div className="space-y-3 pt-2 border-t border-gray-300 dark:border-gray-600">
          {/* File operations */}
          <div>
            <div className="text-xs font-medium mb-1">File</div>
            <div className="flex gap-1">
              <button onClick={onExport} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <Download size={16} />
              </button>
              <button onClick={handleImportClick} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <Upload size={16} />
              </button>
              <button onClick={onReset} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-red-500">
                <RotateCcw size={16} />
              </button>
            </div>
          </div>

          {/* Colors */}
          <div>
            <div className="text-xs font-medium mb-1">Colors</div>
            <div className="flex gap-1">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => onGlobalColorChange(color)}
                  className="w-5 h-5 rounded border-2 border-white shadow-sm hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Text formatting */}
          <div>
            <div className="text-xs font-medium mb-1">Text</div>
            <div className="flex gap-1">
              <button onClick={() => onGlobalTextFormat('bold')} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <Bold size={16} />
              </button>
              <button onClick={() => onGlobalTextFormat('italic')} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <Italic size={16} />
              </button>
              <button onClick={() => onGlobalFontSizeChange(-2)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <Minus size={16} />
              </button>
              <button onClick={() => onGlobalFontSizeChange(2)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Shapes */}
          <div>
            <div className="text-xs font-medium mb-1">Shape</div>
            <div className="flex gap-1">
              <button onClick={() => onGlobalShapeChange('rectangle')} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <Square size={16} />
              </button>
              <button onClick={() => onGlobalShapeChange('circle')} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <Circle size={16} />
              </button>
              <button onClick={() => onGlobalShapeChange('diamond')} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <Diamond size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
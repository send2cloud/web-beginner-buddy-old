import React from 'react';
import { Bold, Italic, Underline, Strikethrough, Trash2, Users, Minus, Plus, Square, Circle, MoreHorizontal } from 'lucide-react';
import { COLORS } from '../utils/constants';
import { useDynamicToolbarPosition } from '../hooks/useDynamicToolbarPosition';
import { ToolbarButton } from './shared/ToolbarButton';

interface MiniToolbarProps {
  selectedCount: number;
  position: { x: number; y: number };
  theme: 'light' | 'dark';
  selectedNodes: string[]; // IDs of selected nodes
  onColorChange: (type: 'background' | 'border', color: string) => void;
  onTextFormat: (format: 'bold' | 'italic' | 'underline' | 'strikethrough') => void;
  onFontSizeChange: (increase: boolean) => void;
  onShapeChange: (shape: 'rectangle' | 'rounded' | 'pill') => void;
  onConnectionStyleChange: (nodeId1: string, nodeId2: string, style: { type: 'solid' | 'dashed' }) => void;
  getConnectionStyle: (nodeId1: string, nodeId2: string) => { type: 'solid' | 'dashed' };
  onDelete: () => void;
  onConnect?: () => void;
  onGroup?: () => void;
  nodes: Record<string, any>; // Add nodes prop to check current shapes
}

export const MiniToolbar: React.FC<MiniToolbarProps> = ({
  selectedCount,
  position,
  theme,
  selectedNodes,
  onColorChange,
  onTextFormat,
  onFontSizeChange,
  onShapeChange,
  onConnectionStyleChange,
  onDelete,
  onConnect,
  onGroup,
  nodes
}) => {
  const toolbarPos = useDynamicToolbarPosition({
    position,
    toolbarWidth: 400,
    toolbarHeight: 60,
    offsetY: -100
  });

  // Get current connection style between the two selected nodes
  // Note: currentConnectionStyle is available but not used in current implementation

  // Get the most common shape among selected nodes
  const getSelectedShape = (): 'rectangle' | 'rounded' | 'pill' | null => {
    if (selectedNodes.length === 0) return null;
    const shapes = selectedNodes.map(id => nodes[id]?.style?.shape).filter(Boolean);
    if (shapes.length === 0) return null;
    
    // Return the first shape if all are the same, otherwise null (mixed)
    const firstShape = shapes[0];
    return shapes.every(shape => shape === firstShape) ? firstShape : null;
  };

  const selectedShape = getSelectedShape();
  return (
    <div
      className={`absolute z-20 flex items-center gap-1 p-1.5 rounded-lg shadow-xl border backdrop-blur-sm transform scale-75 ${
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
      <div className="flex items-center gap-0.5 pr-1.5 border-r border-gray-300 dark:border-gray-600">
        {COLORS.map((color) => (
          <ToolbarButton
            key={color.name}
            onClick={() => onColorChange('background', theme === 'dark' ? color.dark.bg : color.light.bg)}
            icon={<div />}
            theme={theme}
            variant="color"
            color={theme === 'dark' ? color.dark.bg : color.light.bg}
            title={`${color.name} background`}
          />
        ))}
      </div>

      {/* Border Colors */}
      <div className="flex items-center gap-0.5 pr-1.5 border-r border-gray-300 dark:border-gray-600">
        {COLORS.map((color) => (
          <ToolbarButton
            key={color.name}
            onClick={() => onColorChange('border', theme === 'dark' ? color.dark.border : color.light.border)}
            icon={<div />}
            theme={theme}
            variant="border"
            color={theme === 'dark' ? color.dark.border : color.light.border}
            title={`${color.name} border`}
          />
        ))}
      </div>

      {/* Text Formatting */}
      <div className="flex items-center gap-0.5 pr-1.5 border-r border-gray-300 dark:border-gray-600">
        <ToolbarButton
          onClick={() => onTextFormat('bold')}
          icon={<Bold size={14} />}
          theme={theme}
          title="Bold (Ctrl+B)"
        />
        <ToolbarButton
          onClick={() => onTextFormat('italic')}
          icon={<Italic size={14} />}
          theme={theme}
          title="Italic (Ctrl+I)"
        />
        <ToolbarButton
          onClick={() => onTextFormat('underline')}
          icon={<Underline size={14} />}
          theme={theme}
          title="Underline (Ctrl+U)"
        />
        <ToolbarButton
          onClick={() => onTextFormat('strikethrough')}
          icon={<Strikethrough size={14} />}
          theme={theme}
          title="Strikethrough"
        />
        
        <div className={`w-px h-4 mx-1 ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`} />
        
        <ToolbarButton
          onClick={() => onFontSizeChange(false)}
          icon={<Minus size={12} />}
          theme={theme}
          title="Decrease font size"
        />
        <ToolbarButton
          onClick={() => onFontSizeChange(true)}
          icon={<Plus size={12} />}
          theme={theme}
          title="Increase font size"
        />
      </div>

      {/* Shape Controls */}
      <div className="flex items-center gap-0.5 pr-1.5 border-r border-gray-300 dark:border-gray-600">
        <button
          onClick={() => onShapeChange('rectangle')}
          className={`p-1.5 rounded transition-all ${
            selectedShape === 'rectangle' 
              ? `${theme === 'dark' ? 'bg-blue-600 text-white shadow-lg' : 'bg-blue-500 text-white shadow-lg'} transform scale-105`
              : `${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`
          }`}
          title="Rectangle shape"
        >
          <Square size={14} />
        </button>
        <button
          onClick={() => onShapeChange('rounded')}
          className={`p-1.5 rounded transition-all ${
            selectedShape === 'rounded' 
              ? `${theme === 'dark' ? 'bg-blue-600 text-white shadow-lg' : 'bg-blue-500 text-white shadow-lg'} transform scale-105`
              : `${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`
          }`}
          title="Curved shape"
        >
          <Circle size={14} />
        </button>
        <button
          onClick={() => onShapeChange('pill')}
          className={`px-1.5 py-1 rounded-full border transition-all ${
            selectedShape === 'pill'
              ? `${theme === 'dark' ? 'bg-blue-600 border-blue-400 text-white shadow-lg' : 'bg-blue-500 border-blue-300 text-white shadow-lg'} transform scale-105`
              : `${theme === 'dark' ? 'border-gray-300 text-gray-300 hover:bg-gray-700' : 'border-gray-600 text-gray-600 hover:bg-gray-100'}`
          }`}
          style={{ borderRadius: '10px', minWidth: '20px', height: '20px' }}
          title="Pill shape"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-current mx-auto" />
        </button>
      </div>

      {/* Context Actions */}
      <div className="flex items-center gap-0.5 pr-1.5 border-r border-gray-300 dark:border-gray-600">
        {/* Connection Controls - Only show when 2 nodes selected */}
        {selectedCount === 2 && (
          <>
            <ToolbarButton
              onClick={() => {
                if (selectedNodes.length === 2) {
                  // Connect with solid line
                  onConnect?.();
                  setTimeout(() => {
                    onConnectionStyleChange(
                      selectedNodes[0], 
                      selectedNodes[1], 
                      { type: 'solid' }
                    );
                  }, 0);
                }
              }}
              icon={<Minus size={14} />}
              theme={theme}
              title="Connect with solid line"
            />
            <ToolbarButton
              onClick={() => {
                if (selectedNodes.length === 2) {
                  // Connect with dashed line
                  onConnect?.();
                  setTimeout(() => {
                    onConnectionStyleChange(
                      selectedNodes[0], 
                      selectedNodes[1], 
                      { type: 'dashed' }
                    );
                  }, 0);
                }
              }}
              icon={<MoreHorizontal size={14} />}
              theme={theme}
              title="Connect with dashed line"
            />
          </>
        )}
        
        {selectedCount >= 2 && onGroup && (
          <ToolbarButton
            onClick={onGroup}
            icon={<Users size={14} />}
            theme={theme}
            title="Group nodes (G)"
          />
        )}
      </div>

      {/* Group and Delete Actions */}
      <div className="flex items-center gap-0.5">
        <ToolbarButton
          onClick={onDelete}
          icon={<Trash2 size={14} />}
          theme={theme}
          danger
          title="Delete (Del)"
        />
      </div>
    </div>
  );
};
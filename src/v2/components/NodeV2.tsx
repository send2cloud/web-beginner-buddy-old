import React, { useState, useRef, useCallback } from 'react';
import { NodeData } from '../types';

interface NodeV2Props {
  node: NodeData;
  isSelected: boolean;
  isActive: boolean;
  isConnecting: boolean;
  connectingFromId?: string;
  theme: 'light' | 'dark';
  scale: number;
  onUpdate: (updates: Partial<NodeData>) => void;
  onSelect: (multiSelect?: boolean) => void;
  onDelete: () => void;
  onConnect: (fromId: string, toId: string) => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onStartConnection: (fromId: string) => void;
  onEndConnection: () => void;
}

export const NodeV2: React.FC<NodeV2Props> = ({
  node,
  isSelected,
  isActive: _isActive,
  isConnecting,
  connectingFromId,
  theme: _theme,
  scale,
  onUpdate,
  onSelect,
  onDelete: _onDelete,
  onConnect,
  onContextMenu,
  onStartConnection,
  onEndConnection
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const nodeRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) { // Left click
      e.stopPropagation();
      onSelect(e.ctrlKey || e.metaKey);
      
      setIsDragging(true);
      setDragStart({
        x: e.clientX - node.x * scale,
        y: e.clientY - node.y * scale
      });
    }
  }, [node.x, node.y, scale, onSelect]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      const newX = (e.clientX - dragStart.x) / scale;
      const newY = (e.clientY - dragStart.y) / scale;
      
      onUpdate({
        x: newX,
        y: newY
      });
    }
  }, [isDragging, dragStart, scale, onUpdate]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handle mouse events globally when dragging
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  }, []);

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({ text: e.target.value });
  }, [onUpdate]);

  const handleTextKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      setIsEditing(false);
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isConnecting && connectingFromId && connectingFromId !== node.id) {
      onConnect(connectingFromId, node.id);
      onEndConnection();
    }
  }, [isConnecting, connectingFromId, node.id, onConnect, onEndConnection]);

  const handleConnectionStart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onStartConnection(node.id);
  }, [node.id, onStartConnection]);

  const getShapeStyles = () => {
    const baseStyle = {
      backgroundColor: node.style.backgroundColor,
      borderColor: node.style.borderColor,
      borderWidth: `${node.style.borderWidth}px`,
      color: node.style.textColor
    };

    switch (node.style.shape) {
      case 'circle':
        return { ...baseStyle, borderRadius: '50%' };
      case 'diamond':
        return { ...baseStyle, transform: 'rotate(45deg)' };
      default:
        return { ...baseStyle, borderRadius: '8px' };
    }
  };

  return (
    <div
      ref={nodeRef}
      className={`absolute border-2 border-solid cursor-pointer select-none ${
        isSelected ? 'shadow-lg ring-2 ring-blue-400' : ''
      } ${isDragging ? 'z-50' : 'z-10'}`}
      style={{
        left: node.x,
        top: node.y,
        width: node.width,
        height: node.height,
        ...getShapeStyles()
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onClick={handleClick}
      onContextMenu={onContextMenu}
    >
      {/* Content */}
      <div className="w-full h-full flex items-center justify-center p-2">
        {isEditing ? (
          <textarea
            value={node.text}
            onChange={handleTextChange}
            onKeyDown={handleTextKeyDown}
            onBlur={() => setIsEditing(false)}
            className="w-full h-full resize-none border-none outline-none bg-transparent text-center flex items-center justify-center"
            style={{
              fontSize: `${node.style.fontSize}px`,
              color: node.style.textColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            autoFocus
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-center overflow-hidden"
            style={{
              fontSize: `${node.style.fontSize}px`,
              color: node.style.textColor
            }}
          >
            {node.text}
          </div>
        )}
      </div>

      {/* Connection handle */}
      {isSelected && (
        <div
          className="absolute -right-2 -bottom-2 w-4 h-4 bg-blue-500 rounded-full cursor-pointer hover:bg-blue-600"
          onMouseDown={handleConnectionStart}
        />
      )}

      {/* File preview if applicable */}
      {node.fileUrl && node.fileType?.startsWith('image/') && (
        <div className="absolute inset-0 rounded overflow-hidden">
          <img
            src={node.fileUrl}
            alt={node.fileName || 'File'}
            className="w-full h-full object-cover opacity-50"
          />
        </div>
      )}
    </div>
  );
};
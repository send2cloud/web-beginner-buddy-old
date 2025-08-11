import React, { useState, useEffect, useRef } from 'react';
import { NodeData, Point } from '../types';

const getNodeStyles = (
  node: NodeData,
  selected: boolean,
  isActive: boolean,
  theme: 'light' | 'dark'
) => {
  const borderRadius = node.style.shape === 'rectangle' ? '4px' : 
                     node.style.shape === 'rounded' ? '12px' : 
                     `${Math.min(node.size.width, node.size.height) / 2}px`;
  
  const boxShadow = selected 
    ? `0 0 0 2px ${theme === 'dark' ? '#60A5FA' : '#3B82F6'}`
    : isActive 
      ? `0 0 0 2px ${theme === 'dark' ? '#FB923C' : '#F97316'}`
      : 'none';

  return {
    backgroundColor: node.style.backgroundColor,
    borderRadius,
    borderColor: node.style.borderColor,
    boxShadow,
  };
};

interface NodeProps {
  node: NodeData;
  theme: 'light' | 'dark';
  isActive: boolean;
  onUpdate: (id: string, updates: Partial<NodeData>) => void;
  onSelect: (id: string, multi: boolean) => void;
  onDragStart: (nodeId: string, startPos: Point) => void;
  onDragMove: (delta: Point) => void;
  onDragEnd: () => void;
  onContextMenu: (e: React.MouseEvent, context: { type: 'canvas' | 'node' | 'selection'; nodeId?: string }) => void;
  onCreateChild: (parentId: string) => void;
}

const Node: React.FC<NodeProps> = ({
  node,
  theme,
  isActive,
  onUpdate,
  onSelect,
  onDragStart,
  onDragMove,
  onDragEnd,
  onContextMenu,
  onCreateChild
}) => {
  const [isEditing, setIsEditing] = useState(node.editing);
  const [editValue, setEditValue] = useState(node.content);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const nodeRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Point>({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string>('');
  const [resizeStart, setResizeStart] = useState<{ pos: Point; size: { width: number; height: number } }>({
    pos: { x: 0, y: 0 },
    size: { width: 0, height: 0 }
  });

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setIsEditing(node.editing);
    if (node.editing) {
      setEditValue(node.content);
    }
  }, [node.editing, node.content]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    onUpdate(node.id, { editing: true });
  };

  const handleEditComplete = () => {
    setIsEditing(false);
    onUpdate(node.id, { 
      content: editValue || 'New Node',
      editing: false 
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEditComplete();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(node.content);
      onUpdate(node.id, { editing: false });
    } else if (e.key === 'Tab') {
      e.preventDefault();
      e.stopPropagation();
      // Complete current edit and create child
      const finalContent = editValue || 'New Node';
      onUpdate(node.id, { 
        content: finalContent,
        editing: false 
      });
      setIsEditing(false);
      // Create child node
      onCreateChild(node.id);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent canvas from handling this event
    e.preventDefault(); // Prevent text selection
    
    if (e.button === 0 && !isEditing) {
      onSelect(node.id, e.shiftKey);
      
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      onDragStart(node.id, { x: e.clientX, y: e.clientY });
      
      // Dispatch custom event to notify canvas
      window.dispatchEvent(new CustomEvent('nodeDragStart'));
    }
  };

  const handleResizeMouseDown = (e: React.MouseEvent, handle: string) => {
    e.stopPropagation();
    e.preventDefault();
    
    setIsResizing(true);
    setResizeHandle(handle);
    setResizeStart({
      pos: { x: e.clientX, y: e.clientY },
      size: { width: node.size.width, height: node.size.height }
    });
  };
  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      e.preventDefault(); // Prevent text selection during drag
      const delta = {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      };
      onDragMove(delta);
    } else if (isResizing) {
      e.preventDefault();
      const deltaX = e.clientX - resizeStart.pos.x;
      const deltaY = e.clientY - resizeStart.pos.y;
      
      let newWidth = resizeStart.size.width;
      let newHeight = resizeStart.size.height;
      
      // Handle different resize directions
      if (resizeHandle.includes('right')) {
        newWidth = Math.max(100, resizeStart.size.width + deltaX);
      }
      if (resizeHandle.includes('left')) {
        newWidth = Math.max(100, resizeStart.size.width - deltaX);
      }
      if (resizeHandle.includes('bottom')) {
        newHeight = Math.max(60, resizeStart.size.height + deltaY);
      }
      if (resizeHandle.includes('top')) {
        newHeight = Math.max(60, resizeStart.size.height - deltaY);
      }
      
      onUpdate(node.id, {
        size: { width: newWidth, height: newHeight }
      });
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      onDragEnd();
      
      // Dispatch custom event to notify canvas
      window.dispatchEvent(new CustomEvent('nodeDragEnd'));
    }
    if (isResizing) {
      setIsResizing(false);
      setResizeHandle('');
    }
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      // Prevent text selection during drag
      document.body.style.userSelect = 'none';
      document.body.style.webkitUserSelect = 'none';
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        
        // Restore text selection
        document.body.style.userSelect = '';
        document.body.style.webkitUserSelect = '';
      };
    }
  }, [isDragging, isResizing, dragStart, resizeStart, resizeHandle]);

  const getNodeContent = () => {
    if (node.type === 'image') {
      // Handle both blob URLs and regular image URLs
      if (node.content.startsWith('blob:') || node.content.startsWith('http')) {
        return (
          <div className="flex flex-col items-center gap-2 h-full">
            <img 
              src={node.content} 
              alt="Node image" 
              className="object-contain rounded flex-1"
              style={{ 
                maxWidth: '100%', 
                maxHeight: `${Math.max(node.size.height - 40, 40)}px`,
                minHeight: '40px'
              }}
            />
            <div className="text-xs opacity-75 text-center px-2" style={{ 
              fontSize: `${Math.max(node.style.textStyle.fontSize - 2, 10)}px`,
              lineHeight: '1.2'
            }}>
              {node.content.startsWith('blob:') ? 'Image' : node.content}
            </div>
          </div>
        );
      }
    }
    
    if (node.type === 'link') {
      return (
        <div className="flex flex-col items-center gap-1 h-full justify-center px-2">
          <a
            href={node.content}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-700 underline font-medium text-center"
            style={{ 
              fontSize: `${Math.max(node.style.textStyle.fontSize, 12)}px`,
              lineHeight: '1.3'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            Link
          </a>
          <div 
            className="text-xs opacity-75 text-center break-all"
            style={{ 
              fontSize: `${Math.max(node.style.textStyle.fontSize - 4, 8)}px`,
              lineHeight: '1.2',
              wordBreak: 'break-all',
              overflowWrap: 'break-word'
            }}
          >
            {node.content}
          </div>
        </div>
      );
    }
    
    return node.content;
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    onContextMenu(e, { type: 'node', nodeId: node.id });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const rect = nodeRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Screen position calculation for potential future use
    // const screenPos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    
    // Handle files dropped on node
    if (e.dataTransfer.files.length > 0) {
      // Create child nodes for files dropped on this node
      Array.from(e.dataTransfer.files).forEach((file) => {
        // Child position calculation for potential future use
        // const childPosition = {
        //   x: node.position.x + 250,
        //   y: node.position.y + (node.children.length + index) * 100 + 100
        // };
        
        if (file.type.startsWith('image/')) {
          // URL creation for potential future use
          // const url = URL.createObjectURL(file);
          // This would need to be passed as a prop or handled differently
          // For now, we'll trigger the child creation through the existing mechanism
          onCreateChild(node.id);
        } else {
          onCreateChild(node.id);
        }
      });
    } else {
      // Handle text/URL drops on node
      const urlData = e.dataTransfer.getData('text/uri-list');
      const textData = e.dataTransfer.getData('text/plain');
      
      if (urlData || textData) {
        onCreateChild(node.id);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
  };

  // Resize handles component
  const ResizeHandles = () => {
    if (!node.selected) return null;
    
    const handleStyle = `absolute w-2 h-2 bg-blue-500 border border-white rounded-sm cursor-pointer hover:bg-blue-600 transition-colors`;
    
    return (
      <>
        {/* Corner handles */}
        <div
          className={`${handleStyle} cursor-nw-resize`}
          style={{ top: -4, left: -4 }}
          onMouseDown={(e) => handleResizeMouseDown(e, 'top-left')}
        />
        <div
          className={`${handleStyle} cursor-ne-resize`}
          style={{ top: -4, right: -4 }}
          onMouseDown={(e) => handleResizeMouseDown(e, 'top-right')}
        />
        <div
          className={`${handleStyle} cursor-sw-resize`}
          style={{ bottom: -4, left: -4 }}
          onMouseDown={(e) => handleResizeMouseDown(e, 'bottom-left')}
        />
        <div
          className={`${handleStyle} cursor-se-resize`}
          style={{ bottom: -4, right: -4 }}
          onMouseDown={(e) => handleResizeMouseDown(e, 'bottom-right')}
        />
        
        {/* Edge handles */}
        <div
          className={`${handleStyle} cursor-n-resize`}
          style={{ top: -4, left: '50%', transform: 'translateX(-50%)' }}
          onMouseDown={(e) => handleResizeMouseDown(e, 'top')}
        />
        <div
          className={`${handleStyle} cursor-s-resize`}
          style={{ bottom: -4, left: '50%', transform: 'translateX(-50%)' }}
          onMouseDown={(e) => handleResizeMouseDown(e, 'bottom')}
        />
        <div
          className={`${handleStyle} cursor-w-resize`}
          style={{ left: -4, top: '50%', transform: 'translateY(-50%)' }}
          onMouseDown={(e) => handleResizeMouseDown(e, 'left')}
        />
        <div
          className={`${handleStyle} cursor-e-resize`}
          style={{ right: -4, top: '50%', transform: 'translateY(-50%)' }}
          onMouseDown={(e) => handleResizeMouseDown(e, 'right')}
        />
      </>
    );
  };
  return (
    <div
      ref={nodeRef}
      className="absolute pointer-events-auto cursor-pointer transition-all duration-200 select-none"
      style={{
        left: node.position.x - node.size.width / 2,
        top: node.position.y - node.size.height / 2,
        width: node.type === 'image' || node.type === 'link' ? Math.max(node.size.width, 200) : node.size.width,
        height: node.type === 'image' || node.type === 'link' ? Math.max(node.size.height, 120) : node.size.height,
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div
        className={`w-full h-full rounded-full shadow-md border-2 transition-all duration-200 hover:shadow-lg ${
          node.selected 
            ? theme === 'dark' ? 'border-blue-400 shadow-blue-400/30' : 'border-blue-500 shadow-blue-500/30'
            : ''
        } ${
          isActive 
            ? theme === 'dark' ? 'border-orange-400 shadow-orange-400/30' : 'border-orange-500 shadow-orange-500/30'
            : ''
        }`}
        style={getNodeStyles(node, node.selected, isActive, theme)}
      >
        <div className={`px-4 py-2 h-full flex items-center justify-center ${
          node.type === 'image' || node.type === 'link' ? 'flex-col' : ''
        }`}>
          {isEditing ? (
            <textarea
              ref={inputRef}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleEditComplete}
              onKeyDown={handleKeyDown}
              className="w-full h-full bg-transparent border-none outline-none text-center resize-none p-2"
              style={{
                color: theme === 'dark' ? '#ffffff' : '#1f2937',
                fontSize: `${node.style.textStyle.fontSize}px`,
                lineHeight: '1.4'
              }}
              placeholder="Enter content..."
            />
          ) : (
            <div 
              className={`font-medium text-center px-2 ${
                node.type === 'image' || node.type === 'link' ? 'w-full' : ''
              }`}
              style={{
                color: theme === 'dark' ? '#ffffff' : '#1f2937',
                fontSize: `${node.style.textStyle.fontSize}px`,
                fontWeight: node.style.textStyle.bold ? 'bold' : 'normal',
                fontStyle: node.style.textStyle.italic ? 'italic' : 'normal',
                textDecoration: [
                  node.style.textStyle.underline ? 'underline' : '',
                  node.style.textStyle.strikethrough ? 'line-through' : ''
                ].filter(Boolean).join(' ') || 'none',
                lineHeight: '1.4',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                whiteSpace: 'pre-wrap'
              }}
            >
              {getNodeContent()}
            </div>
          )}
        </div>
      </div>
      
      {/* Resize handles */}
      <ResizeHandles />
    </div>
  );
};

export default React.memo(Node);
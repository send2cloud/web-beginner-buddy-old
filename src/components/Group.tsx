import React, { useState, useRef, useEffect } from 'react';
import { GroupData } from '../types';

interface GroupProps {
  group: GroupData;
  theme: 'light' | 'dark';
  nodes: Record<string, any>;
  onGroupUpdate: (groupId: string, updates: Partial<GroupData>) => void;
  onNodesUpdate: (updates: Record<string, any>) => void;
  onGroupSelect: (groupId: string) => void;
  isSelected: boolean;
}

const Group: React.FC<GroupProps> = ({ 
  group, 
  theme, 
  nodes,
  onGroupUpdate, 
  onNodesUpdate,
  onGroupSelect, 
  isSelected 
}) => {
  const { bounds } = group;
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const groupRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (e.button === 0) {
      onGroupSelect(group.id);
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      e.preventDefault();
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      
      // Move all nodes in the group
      const nodeUpdates: Record<string, any> = {};
      group.nodeIds.forEach(nodeId => {
        const node = nodes[nodeId];
        if (node) {
          nodeUpdates[nodeId] = {
            ...node,
            position: {
              x: node.position.x + deltaX,
              y: node.position.y + deltaY
            }
          };
        }
      });
      
      // Update all nodes at once
      onNodesUpdate(nodeUpdates);
      
      // Update group bounds
      onGroupUpdate(group.id, {
        bounds: {
          ...bounds,
          x: bounds.x + deltaX,
          y: bounds.y + deltaY
        }
      });
      
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  return (
    <div
      ref={groupRef}
      className={`absolute pointer-events-none rounded-[20px] border-2 border-dashed transition-all duration-300 ${
        theme === 'dark'
          ? 'border-gray-500 bg-gray-700 bg-opacity-20'
          : 'border-gray-400 bg-gray-200 bg-opacity-30'
      } ${
        isSelected 
          ? theme === 'dark' 
            ? 'border-blue-400 bg-blue-700 bg-opacity-30' 
            : 'border-blue-500 bg-blue-200 bg-opacity-40'
          : ''
      }`}
      style={{
        left: bounds.x,
        top: bounds.y,
        width: bounds.width,
        height: bounds.height,
      }}
    >
      {/* Draggable handle */}
      <div
        className={`absolute inset-0 cursor-move pointer-events-auto ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        onMouseDown={handleMouseDown}
      />
    </div>
  );
};

export default React.memo(Group);
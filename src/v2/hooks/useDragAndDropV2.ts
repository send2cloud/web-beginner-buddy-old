import { useCallback } from 'react';
import { Point } from '../types';

export const useDragAndDropV2 = (onAddNode: (position: Point, parentId?: string) => void) => {
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Handle file drops
    if (e.dataTransfer.files.length > 0) {
      onAddNode({ x, y });
    }
    
    // Handle text drops
    const text = e.dataTransfer.getData('text/plain');
    if (text) {
      onAddNode({ x, y });
    }
  }, [onAddNode]);

  return {
    handleDragOver,
    handleDrop
  };
};
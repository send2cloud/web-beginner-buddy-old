import { useCallback, useState } from 'react';
import { Point, DragState } from '../types';

interface UseDragAndDropProps {
  onFilesDrop: (files: FileList, position: Point, targetNodeId?: string) => void;
  onNodeDrag: (nodeIds: string[], delta: Point) => void;
}

export const useDragAndDrop = ({ onFilesDrop, onNodeDrag }: UseDragAndDropProps) => {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    startPos: { x: 0, y: 0 },
    dragOffset: { x: 0, y: 0 },
    draggedNodes: []
  });

  const handleDragStart = useCallback((nodeIds: string[], startPos: Point) => {
    setDragState({
      isDragging: true,
      startPos,
      dragOffset: { x: 0, y: 0 },
      draggedNodes: nodeIds
    });
  }, []);

  const handleDragMove = useCallback((currentPos: Point) => {
    if (!dragState.isDragging) return;

    const delta = {
      x: currentPos.x - dragState.startPos.x,
      y: currentPos.y - dragState.startPos.y
    };

    setDragState(prev => ({ ...prev, dragOffset: delta }));
    onNodeDrag(dragState.draggedNodes, delta);
  }, [dragState, onNodeDrag]);

  const handleDragEnd = useCallback(() => {
    setDragState({
      isDragging: false,
      startPos: { x: 0, y: 0 },
      dragOffset: { x: 0, y: 0 },
      draggedNodes: []
    });
  }, []);

  const handleFileDrop = useCallback((e: React.DragEvent, canvasPos: Point, targetNodeId?: string) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      onFilesDrop(e.dataTransfer.files, canvasPos, targetNodeId);
    }
  }, [onFilesDrop]);

  return {
    dragState,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    handleFileDrop
  };
};
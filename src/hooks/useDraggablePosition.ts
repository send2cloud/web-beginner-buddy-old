import { useState, useRef, useEffect, useCallback } from 'react';

interface Position {
  x: number;
  y: number;
}

interface UseDraggablePositionOptions {
  initialPosition?: Position;
  storageKey?: string;
  bounds?: {
    left: number;
    top: number;
    right: number;
    bottom: number;
  };
}

export const useDraggablePosition = (options: UseDraggablePositionOptions = {}) => {
  const { initialPosition = { x: 16, y: 16 }, storageKey, bounds } = options;
  
  // Load position from localStorage if storageKey is provided
  const getInitialPosition = useCallback((): Position => {
    if (storageKey) {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return { x: parsed.x || initialPosition.x, y: parsed.y || initialPosition.y };
        } catch {
          return initialPosition;
        }
      }
    }
    return initialPosition;
  }, [initialPosition, storageKey]);

  const [position, setPosition] = useState<Position>(getInitialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const elementRef = useRef<HTMLDivElement>(null);

  // Save position to localStorage when it changes
  useEffect(() => {
    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(position));
    }
  }, [position, storageKey]);

  const constrainPosition = useCallback((pos: Position): Position => {
    if (!bounds) return pos;
    
    return {
      x: Math.max(bounds.left, Math.min(bounds.right, pos.x)),
      y: Math.max(bounds.top, Math.min(bounds.bottom, pos.y))
    };
  }, [bounds]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    
    const rect = elementRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const newPosition = constrainPosition({
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y
    });
    
    setPosition(newPosition);
  }, [isDragging, dragOffset, constrainPosition]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'grabbing';
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Update bounds on window resize
  useEffect(() => {
    const handleResize = () => {
      if (bounds) {
        setPosition(prev => constrainPosition(prev));
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [bounds, constrainPosition]);

  return {
    position,
    setPosition,
    isDragging,
    elementRef,
    dragHandleProps: {
      onMouseDown: handleMouseDown,
      style: { cursor: isDragging ? 'grabbing' : 'grab' }
    }
  };
};
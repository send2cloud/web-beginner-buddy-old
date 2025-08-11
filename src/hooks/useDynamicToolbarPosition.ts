import { useMemo } from 'react';

interface UseDynamicToolbarPositionProps {
  position: { x: number; y: number };
  toolbarWidth: number;
  toolbarHeight: number;
  margin?: number;
  offsetY?: number;
}

export const useDynamicToolbarPosition = ({
  position,
  toolbarWidth,
  toolbarHeight,
  margin = 20,
  offsetY = -80
}: UseDynamicToolbarPositionProps) => {
  return useMemo(() => {
    let x = position.x;
    let y = position.y + offsetY;
    
    // Adjust horizontal position if too close to screen edges
    if (x - toolbarWidth / 2 < margin) {
      x = toolbarWidth / 2 + margin;
    } else if (x + toolbarWidth / 2 > window.innerWidth - margin) {
      x = window.innerWidth - toolbarWidth / 2 - margin;
    }
    
    // Adjust vertical position if too close to top
    if (y < margin) {
      y = position.y + Math.abs(offsetY); // Show below instead
    }
    
    return { x, y };
  }, [position, toolbarWidth, toolbarHeight, margin, offsetY]);
};
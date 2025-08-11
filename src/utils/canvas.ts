import { Point, CanvasState } from '../types';

export const screenToCanvas = (screenPos: Point, canvas: CanvasState): Point => {
  return {
    x: (screenPos.x - canvas.offset.x) / canvas.scale,
    y: (screenPos.y - canvas.offset.y) / canvas.scale
  };
};

export const canvasToScreen = (canvasPos: Point, canvas: CanvasState): Point => {
  return {
    x: canvasPos.x * canvas.scale + canvas.offset.x,
    y: canvasPos.y * canvas.scale + canvas.offset.y
  };
};

export const getGridSpacing = (scale: number): number => {
  if (scale > 1) return 20;
  if (scale > 0.5) return 40;
  if (scale > 0.25) return 80;
  return 160;
};

export const clampZoom = (scale: number): number => {
  return Math.max(0.1, Math.min(3, scale));
};
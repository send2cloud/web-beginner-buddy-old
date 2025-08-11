import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Point, CanvasState, NodeData } from '../types';
import { screenToCanvas, getGridSpacing, clampZoom } from '../utils/canvas';

const drawConnections = (
  ctx: CanvasRenderingContext2D,
  nodes: Record<string, NodeData>,
  canvas: CanvasState,
  defaultConnectionStyle: { type: 'solid' | 'dashed' }
) => {
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';

  Object.values(nodes).forEach(node => {
    if (node.parentId && nodes[node.parentId]) {
      const parent = nodes[node.parentId];
      
      // Get connection style for this specific connection
      const connectionStyle = parent.connectionStyles?.[node.id] || defaultConnectionStyle;
      
      // Determine connection color based on node border colors
      // Use the topmost or leftmost node's border color if different
      let connectionColor;
      if (parent.position.y < node.position.y || 
          (parent.position.y === node.position.y && parent.position.x < node.position.x)) {
        connectionColor = parent.style.borderColor;
      } else {
        connectionColor = node.style.borderColor;
      }
      
      ctx.strokeStyle = connectionColor;
      
      // Set line dash pattern for this connection
      if (connectionStyle.type === 'dashed') {
        ctx.setLineDash([5, 5]);
      } else {
        ctx.setLineDash([]);
      }
      
      const startX = parent.position.x * canvas.scale + canvas.offset.x;
      const startY = parent.position.y * canvas.scale + canvas.offset.y;
      const endX = node.position.x * canvas.scale + canvas.offset.x;
      const endY = node.position.y * canvas.scale + canvas.offset.y;

      // Calculate smooth bezier curve
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      
      // Control points for smooth S-curve
      const controlPoint1X = startX + deltaX * 0.5;
      const controlPoint1Y = startY + deltaY * 0.1;
      const controlPoint2X = endX - deltaX * 0.5;
      const controlPoint2Y = endY - deltaY * 0.1;

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.bezierCurveTo(controlPoint1X, controlPoint1Y, controlPoint2X, controlPoint2Y, endX, endY);
      ctx.stroke();
    }
    
    // Draw connections based on children array (new connections)
    node.children.forEach(childId => {
      if (nodes[childId]) {
        const child = nodes[childId];
        
        // Get connection style for this specific connection
        const connectionStyle = node.connectionStyles?.[childId] || defaultConnectionStyle;
        
        // Determine connection color based on node border colors
        // Use the topmost or leftmost node's border color if different
        let connectionColor;
        if (node.position.y < child.position.y || 
            (node.position.y === child.position.y && node.position.x < child.position.x)) {
          connectionColor = node.style.borderColor;
        } else {
          connectionColor = child.style.borderColor;
        }
        
        ctx.strokeStyle = connectionColor;
        
        // Set line dash pattern for this connection
        if (connectionStyle.type === 'dashed') {
          ctx.setLineDash([5, 5]);
        } else {
          ctx.setLineDash([]);
        }
        
        const startX = node.position.x * canvas.scale + canvas.offset.x;
        const startY = node.position.y * canvas.scale + canvas.offset.y;
        const endX = child.position.x * canvas.scale + canvas.offset.x;
        const endY = child.position.y * canvas.scale + canvas.offset.y;

        // Calculate smooth bezier curve
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        
        // Control points for smooth S-curve
        const controlPoint1X = startX + deltaX * 0.5;
        const controlPoint1Y = startY + deltaY * 0.1;
        const controlPoint2X = endX - deltaX * 0.5;
        const controlPoint2Y = endY - deltaY * 0.1;

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.bezierCurveTo(controlPoint1X, controlPoint1Y, controlPoint2X, controlPoint2Y, endX, endY);
        ctx.stroke();
      }
    });
  });
};

interface CanvasProps {
  canvas: CanvasState;
  nodes: Record<string, NodeData>;
  theme: 'light' | 'dark';
  defaultConnectionStyle: { type: 'solid' | 'dashed' };
  onCanvasChange: (canvas: CanvasState) => void;
  onDoubleClick: (position: Point) => void;
  onDrop: (e: React.DragEvent, position: Point) => void;
  onCanvasClick: () => void;
  onContextMenu: (e: React.MouseEvent, context: { type: 'canvas' | 'node' | 'selection' }) => void;
  children: React.ReactNode;
}

export const Canvas: React.FC<CanvasProps> = ({
  canvas,
  nodes,
  theme,
  defaultConnectionStyle,
  onCanvasChange,
  onDoubleClick,
  onDrop,
  onCanvasClick,
  onContextMenu,
  children
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPos, setLastPanPos] = useState<Point>({ x: 0, y: 0 });
  const [isDraggingNode, setIsDraggingNode] = useState(false);

  const drawGrid = useCallback(() => {
    const canvasElement = canvasRef.current;
    if (!canvasElement) return;

    const ctx = canvasElement.getContext('2d');
    if (!ctx) return;

    const rect = canvasElement.getBoundingClientRect();
    canvasElement.width = rect.width * window.devicePixelRatio;
    canvasElement.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    ctx.clearRect(0, 0, rect.width, rect.height);

    // Draw grid
    const spacing = getGridSpacing(canvas.scale);
    const scaledSpacing = spacing * canvas.scale;

    const offsetX = canvas.offset.x % scaledSpacing;
    const offsetY = canvas.offset.y % scaledSpacing;

    ctx.fillStyle = theme === 'dark' ? 'hsl(215 20.2% 65.1%)' : 'hsl(215.4 16.3% 46.9%)';
    
    for (let x = offsetX; x < rect.width; x += scaledSpacing) {
      for (let y = offsetY; y < rect.height; y += scaledSpacing) {
        ctx.fillRect(x - 0.5, y - 0.5, 1, 1);
      }
    }

    // Draw connections
    drawConnections(ctx, nodes, canvas, defaultConnectionStyle);
  }, [canvas, nodes, theme, defaultConnectionStyle]);

  useEffect(() => {
    drawGrid();
  }, [drawGrid]);

  // Listen for node drag events
  useEffect(() => {
    const handleNodeDragStart = () => setIsDraggingNode(true);
    const handleNodeDragEnd = () => setIsDraggingNode(false);
    
    window.addEventListener('nodeDragStart', handleNodeDragStart);
    window.addEventListener('nodeDragEnd', handleNodeDragEnd);
    
    return () => {
      window.removeEventListener('nodeDragStart', handleNodeDragStart);
      window.removeEventListener('nodeDragEnd', handleNodeDragEnd);
    };
  }, []);
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only start panning if we're not dragging a node and clicking on empty canvas
    if (e.button === 0 && !isDraggingNode && (e.target === containerRef.current || e.target === canvasRef.current)) {
      setIsPanning(true);
      setLastPanPos({ x: e.clientX, y: e.clientY });
      onCanvasClick(); // Deselect nodes when clicking on empty canvas
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning && !isDraggingNode) {
      const deltaX = e.clientX - lastPanPos.x;
      const deltaY = e.clientY - lastPanPos.y;

      onCanvasChange({
        ...canvas,
        offset: {
          x: canvas.offset.x + deltaX,
          y: canvas.offset.y + deltaY
        }
      });

      setLastPanPos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = clampZoom(canvas.scale * zoomFactor);
    
    const scaleDelta = newScale - canvas.scale;
    
    onCanvasChange({
      scale: newScale,
      offset: {
        x: canvas.offset.x - (mouseX - canvas.offset.x) * scaleDelta / canvas.scale,
        y: canvas.offset.y - (mouseY - canvas.offset.y) * scaleDelta / canvas.scale
      }
    });
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (e.target === containerRef.current || e.target === canvasRef.current) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const screenPos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      const canvasPos = screenToCanvas(screenPos, canvas);
      onDoubleClick(canvasPos);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const screenPos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    const canvasPos = screenToCanvas(screenPos, canvas);
    onDrop(e, canvasPos);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    if (e.target === containerRef.current || e.target === canvasRef.current) {
      onContextMenu(e, { type: 'canvas' });
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden cursor-grab ${
        isPanning ? 'cursor-grabbing' : ''
      } ${theme === 'dark' ? 'bg-background' : 'bg-background'}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onDoubleClick={handleDoubleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onContextMenu={handleContextMenu}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ width: '100%', height: '100%' }}
      />
      
      <div
        className="absolute pointer-events-none"
        style={{
          transform: `translate(${canvas.offset.x}px, ${canvas.offset.y}px) scale(${canvas.scale})`,
          transformOrigin: '0 0'
        }}
      >
        <div className="relative">
          {children}
        </div>
      </div>
    </div>
  );
};
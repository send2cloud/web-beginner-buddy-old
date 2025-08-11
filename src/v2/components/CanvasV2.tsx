import React, { useRef, useCallback, useEffect } from 'react';
import { NodeV2 } from './NodeV2';
import { GroupV2 } from './GroupV2';
import { ContextMenuV2 } from './ContextMenuV2';
import { ConnectionV2 } from './ConnectionV2';
import { useDragAndDropV2 } from '../hooks/useDragAndDropV2';
import { NodeData, GroupData, ConnectionData, Point } from '../types';

interface CanvasV2Props {
  theme: 'light' | 'dark';
  nodes: Record<string, NodeData>;
  connections: Record<string, ConnectionData>;
  groups: Record<string, GroupData>;
  selectedNodes: string[];
  selectedGroups: string[];
  scale: number;
  offset: Point;
  isDragging: boolean;
  isConnecting: boolean;
  connectingFromId?: string;
  activeNodeId?: string;
  onNodeUpdate: (nodeId: string, updates: Partial<NodeData>) => void;
  onNodeSelect: (nodeId: string, multiSelect?: boolean) => void;
  onNodeDelete: (nodeId: string) => void;
  onNodeConnect: (fromId: string, toId: string) => void;
  onGroupSelect: (groupId: string, multiSelect?: boolean) => void;
  onGroupUpdate: (groupId: string, updates: Partial<GroupData>) => void;
  onCanvasClick: (event: React.MouseEvent) => void;
  onCanvasMouseDown: (event: React.MouseEvent) => void;
  onCanvasMouseMove: (event: React.MouseEvent) => void;
  onCanvasMouseUp: (event: React.MouseEvent) => void;
  onAddNode: (position: Point, parentId?: string) => void;
  startConnection: (fromId: string) => void;
  endConnection: () => void;
}

export const CanvasV2: React.FC<CanvasV2Props> = ({
  theme,
  nodes,
  connections,
  groups,
  selectedNodes,
  selectedGroups,
  scale,
  offset,
  isDragging,
  isConnecting,
  connectingFromId,
  activeNodeId,
  onNodeUpdate,
  onNodeSelect,
  onNodeDelete,
  onNodeConnect,
  onGroupSelect,
  onGroupUpdate,
  onCanvasClick,
  onCanvasMouseDown,
  onCanvasMouseMove,
  onCanvasMouseUp,
  onAddNode,
  startConnection,
  endConnection
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = React.useState<{ x: number; y: number; nodeId?: string } | null>(null);

  // File drag and drop functionality
  const { handleDragOver, handleDrop } = useDragAndDropV2(onAddNode);

  // Handle right-click context menu
  const handleContextMenu = useCallback((e: React.MouseEvent, nodeId?: string) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      nodeId
    });
  }, []);

  // Close context menu when clicking elsewhere
  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Grid pattern for background
  const gridPattern = React.useMemo(() => {
    const gridSize = 20 * scale;
    const offsetX = offset.x % gridSize;
    const offsetY = offset.y % gridSize;
    
    return {
      backgroundImage: `
        radial-gradient(circle, ${theme === 'dark' ? '#374151' : '#e5e7eb'} 1px, transparent 1px)
      `,
      backgroundSize: `${gridSize}px ${gridSize}px`,
      backgroundPosition: `${offsetX}px ${offsetY}px`
    };
  }, [scale, offset, theme]);

  return (
    <div
      ref={canvasRef}
      className={`w-full h-full overflow-hidden relative cursor-grab ${
        isDragging ? 'cursor-grabbing' : ''
      } ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}
      style={gridPattern}
      onMouseDown={onCanvasMouseDown}
      onMouseMove={onCanvasMouseMove}
      onMouseUp={onCanvasMouseUp}
      onClick={onCanvasClick}
      onContextMenu={(e) => handleContextMenu(e)}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Canvas content with transform */}
      <div
        style={{
          transform: `scale(${scale}) translate(${offset.x}px, ${offset.y}px)`,
          transformOrigin: '0 0',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
      >
        {/* Render groups first (behind nodes) */}
        {Object.values(groups).map((group) => (
          <GroupV2
            key={group.id}
            group={group}
            isSelected={selectedGroups.includes(group.id)}
            theme={theme}
            scale={scale}
            onSelect={(multiSelect) => onGroupSelect(group.id, multiSelect)}
            onUpdate={(updates) => onGroupUpdate(group.id, updates)}
            onContextMenu={(e) => handleContextMenu(e, group.id)}
          />
        ))}

        {/* Render connections */}
        {Object.values(connections).map((connection) => {
          const fromNode = nodes[connection.fromNodeId];
          const toNode = nodes[connection.toNodeId];
          
          if (!fromNode || !toNode) return null;
          
          return (
            <ConnectionV2
              key={connection.id}
              connection={connection}
              fromNode={fromNode}
              toNode={toNode}
              theme={theme}
            />
          );
        })}

        {/* Render nodes */}
        {Object.values(nodes).map((node) => (
          <NodeV2
            key={node.id}
            node={node}
            isSelected={selectedNodes.includes(node.id)}
            isActive={activeNodeId === node.id}
            isConnecting={isConnecting}
            connectingFromId={connectingFromId}
            theme={theme}
            scale={scale}
            onUpdate={(updates) => onNodeUpdate(node.id, updates)}
            onSelect={(multiSelect) => onNodeSelect(node.id, multiSelect)}
            onDelete={() => onNodeDelete(node.id)}
            onConnect={onNodeConnect}
            onContextMenu={(e) => handleContextMenu(e, node.id)}
            onStartConnection={startConnection}
            onEndConnection={endConnection}
          />
        ))}
      </div>

      {/* Context menu */}
      {contextMenu && (
        <ContextMenuV2
          x={contextMenu.x}
          y={contextMenu.y}
          nodeId={contextMenu.nodeId}
          theme={theme}
          onClose={() => setContextMenu(null)}
          onAddNode={(position) => {
            onAddNode(position, contextMenu.nodeId);
            setContextMenu(null);
          }}
          onDeleteNode={() => {
            if (contextMenu.nodeId) {
              onNodeDelete(contextMenu.nodeId);
            }
            setContextMenu(null);
          }}
        />
      )}
    </div>
  );
};
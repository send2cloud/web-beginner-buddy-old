import { useState, useCallback, useRef, useEffect } from 'react';
import { NodeData, ConnectionData, GroupData, CanvasState, Point } from '../types';
import { generateId } from '../utils/helpers';
import { storageV2 } from '../utils/storageV2';

const initialState: CanvasState = {
  nodes: {},
  connections: {},
  groups: {},
  selectedNodes: [],
  selectedGroups: [],
  activeNodeId: undefined,
  scale: 1,
  offset: { x: 0, y: 0 },
  isDragging: false,
  isConnecting: false,
  connectingFromId: undefined,
  history: [],
  historyIndex: -1
};

export const useMindMapManagerV2 = () => {
  const [state, setState] = useState<CanvasState>(initialState);
  const dragStateRef = useRef({ isDragging: false, draggedNodeId: '', dragOffset: { x: 0, y: 0 }, startPosition: { x: 0, y: 0 } });

  // Load from localStorage on mount
  useEffect(() => {
    const savedData = storageV2.load();
    if (savedData) {
      setState(prev => ({ ...prev, ...savedData }));
    }
  }, []);

  // Auto-save to localStorage
  const saveToLocalStorage = useCallback(() => {
    storageV2.save({
      nodes: state.nodes,
      connections: state.connections,
      groups: state.groups
    });
  }, [state.nodes, state.connections, state.groups]);

  // History management
  const addToHistory = useCallback((newState: Partial<CanvasState>) => {
    setState(prev => {
      const historyState = {
        ...prev,
        nodes: prev.nodes,
        connections: prev.connections,
        groups: prev.groups,
        selectedNodes: prev.selectedNodes,
        selectedGroups: prev.selectedGroups
      };
      
      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push(historyState);
      
      return {
        ...prev,
        ...newState,
        history: newHistory,
        historyIndex: newHistory.length - 1
      };
    });
  }, []);

  // Node operations
  const addNode = useCallback((position: Point, parentId?: string) => {
    const nodeId = generateId();
    const newNode: NodeData = {
      id: nodeId,
      x: position.x,
      y: position.y,
      width: 150,
      height: 60,
      text: 'New Node',
      parentId,
      children: [],
      style: {
        backgroundColor: '#3B82F6',
        borderColor: '#1D4ED8',
        textColor: '#FFFFFF',
        fontSize: 14,
        shape: 'rectangle',
        borderWidth: 2
      }
    };

    addToHistory({
      nodes: { ...state.nodes, [nodeId]: newNode },
      activeNodeId: nodeId,
      selectedNodes: [nodeId]
    });
  }, [state.nodes, addToHistory]);

  const updateNode = useCallback((nodeId: string, updates: Partial<NodeData>) => {
    setState(prev => ({
      ...prev,
      nodes: {
        ...prev.nodes,
        [nodeId]: { ...prev.nodes[nodeId], ...updates }
      }
    }));
  }, []);

  const deleteNode = useCallback((nodeId: string) => {
    const node = state.nodes[nodeId];
    if (!node) return;

    const newNodes = { ...state.nodes };
    const newConnections = { ...state.connections };
    
    // Remove the node
    delete newNodes[nodeId];
    
    // Remove all connections involving this node
    Object.keys(newConnections).forEach(connId => {
      const conn = newConnections[connId];
      if (conn.fromNodeId === nodeId || conn.toNodeId === nodeId) {
        delete newConnections[connId];
      }
    });

    addToHistory({
      nodes: newNodes,
      connections: newConnections,
      selectedNodes: state.selectedNodes.filter(id => id !== nodeId)
    });
  }, [state.nodes, state.connections, state.selectedNodes, addToHistory]);

  // Selection operations
  const selectNode = useCallback((nodeId: string, multiSelect = false) => {
    setState(prev => ({
      ...prev,
      selectedNodes: multiSelect 
        ? (prev.selectedNodes.includes(nodeId) 
            ? prev.selectedNodes.filter(id => id !== nodeId)
            : [...prev.selectedNodes, nodeId])
        : [nodeId],
      activeNodeId: nodeId
    }));
  }, []);

  const deselectAll = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedNodes: [],
      selectedGroups: [],
      activeNodeId: undefined
    }));
  }, []);

  // Canvas operations
  const handleCanvasMouseDown = useCallback((event: React.MouseEvent) => {
    if (event.button === 0) { // Left click
      dragStateRef.current = {
        isDragging: true,
        draggedNodeId: '',
        dragOffset: { x: 0, y: 0 },
        startPosition: { x: event.clientX, y: event.clientY }
      };
      
      setState(prev => ({ ...prev, isDragging: true }));
    }
  }, []);

  const handleCanvasMouseMove = useCallback((event: React.MouseEvent) => {
    if (dragStateRef.current.isDragging && !dragStateRef.current.draggedNodeId) {
      const deltaX = event.clientX - dragStateRef.current.startPosition.x;
      const deltaY = event.clientY - dragStateRef.current.startPosition.y;
      
      setState(prev => ({
        ...prev,
        offset: {
          x: prev.offset.x + deltaX / prev.scale,
          y: prev.offset.y + deltaY / prev.scale
        }
      }));
      
      dragStateRef.current.startPosition = { x: event.clientX, y: event.clientY };
    }
  }, []);

  const handleCanvasMouseUp = useCallback(() => {
    dragStateRef.current.isDragging = false;
    setState(prev => ({ ...prev, isDragging: false }));
  }, []);

  const handleCanvasClick = useCallback((event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      deselectAll();
    }
  }, [deselectAll]);

  // Zoom operations
  const zoomIn = useCallback(() => {
    setState(prev => ({ ...prev, scale: Math.min(prev.scale * 1.2, 3) }));
  }, []);

  const zoomOut = useCallback(() => {
    setState(prev => ({ ...prev, scale: Math.max(prev.scale / 1.2, 0.1) }));
  }, []);

  // File operations
  const exportMindMap = useCallback(() => {
    const data = {
      nodes: state.nodes,
      connections: state.connections,
      groups: state.groups,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mindmap-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [state.nodes, state.connections, state.groups]);

  const importMindMap = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        addToHistory({
          nodes: data.nodes || {},
          connections: data.connections || {},
          groups: data.groups || {}
        });
      } catch (error) {
        console.error('Failed to import mind map:', error);
      }
    };
    reader.readAsText(file);
  }, [addToHistory]);

  const resetCanvas = useCallback(() => {
    addToHistory({
      nodes: {},
      connections: {},
      groups: {},
      selectedNodes: [],
      selectedGroups: []
    });
  }, [addToHistory]);

  // History operations
  const undo = useCallback(() => {
    setState(prev => {
      if (prev.historyIndex > 0) {
        const previousState = prev.history[prev.historyIndex - 1];
        return {
          ...prev,
          ...previousState,
          historyIndex: prev.historyIndex - 1
        };
      }
      return prev;
    });
  }, []);

  const redo = useCallback(() => {
    setState(prev => {
      if (prev.historyIndex < prev.history.length - 1) {
        const nextState = prev.history[prev.historyIndex + 1];
        return {
          ...prev,
          ...nextState,
          historyIndex: prev.historyIndex + 1
        };
      }
      return prev;
    });
  }, []);

  // Placeholder functions for missing features
  const deleteSelectedNodes = useCallback(() => {
    state.selectedNodes.forEach(nodeId => deleteNode(nodeId));
  }, [state.selectedNodes, deleteNode]);

  const groupSelectedNodes = useCallback(() => {
    // Implementation would go here
    console.log('Group selected nodes');
  }, []);

  const ungroupSelectedNodes = useCallback(() => {
    // Implementation would go here
    console.log('Ungroup selected nodes');
  }, []);

  const selectAllNodes = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedNodes: Object.keys(prev.nodes)
    }));
  }, []);

  const changeGlobalColor = useCallback((_color: string) => {
    // Implementation would go here
    console.log('Change global color');
  }, []);

  const changeGlobalTextFormat = useCallback((_format: any) => {
    // Implementation would go here
    console.log('Change global text format');
  }, []);

  const changeGlobalFontSize = useCallback((_size: number) => {
    // Implementation would go here
    console.log('Change global font size');
  }, []);

  const changeGlobalShape = useCallback((_shape: string) => {
    // Implementation would go here
    console.log('Change global shape');
  }, []);

  const addConnection = useCallback((fromId: string, toId: string) => {
    const connectionId = generateId();
    const newConnection: ConnectionData = {
      id: connectionId,
      fromNodeId: fromId,
      toNodeId: toId,
      style: {
        color: '#6B7280',
        width: 2
      }
    };

    setState(prev => ({
      ...prev,
      connections: { ...prev.connections, [connectionId]: newConnection }
    }));
  }, []);

  const startConnection = useCallback((fromId: string) => {
    setState(prev => ({
      ...prev,
      isConnecting: true,
      connectingFromId: fromId
    }));
  }, []);

  const endConnection = useCallback(() => {
    setState(prev => ({
      ...prev,
      isConnecting: false,
      connectingFromId: undefined
    }));
  }, []);

  return {
    ...state,
    addNode,
    updateNode: updateNode,
    deleteNode,
    selectNode: selectNode,
    deselectAll,
    handleCanvasMouseDown,
    handleCanvasMouseMove,
    handleCanvasMouseUp,
    handleCanvasClick,
    zoomIn,
    zoomOut,
    exportMindMap,
    importMindMap,
    resetCanvas,
    saveToLocalStorage,
    undo,
    redo,
    deleteSelectedNodes,
    groupSelectedNodes,
    ungroupSelectedNodes,
    selectAllNodes,
    changeGlobalColor,
    changeGlobalTextFormat,
    changeGlobalFontSize,
    changeGlobalShape,
    addConnection,
    startConnection,
    endConnection,
    onNodeUpdate: updateNode,
    onNodeSelect: selectNode,
    onNodeDeselect: deselectAll,
    onNodeDelete: deleteNode,
    onNodeConnect: addConnection,
    onGroupSelect: () => {},
    onGroupDeselect: () => {},
    onGroupUpdate: () => {},
    onCanvasClick: handleCanvasClick,
    onCanvasMouseDown: handleCanvasMouseDown,
    onCanvasMouseMove: handleCanvasMouseMove,
    onCanvasMouseUp: handleCanvasMouseUp,
    onAddNode: addNode
  };
};
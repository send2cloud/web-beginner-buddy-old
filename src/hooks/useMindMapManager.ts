import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { AppState, NodeData, GroupData, Point, ConnectionStyle } from '../types';
import { generateId, getBoundingBox, getNodesInSubtree } from '../utils/geometry';
import { downloadJSON, importFromJSON } from '../utils/storage';
import { clampZoom } from '../utils/canvas';
import { convertToRGBAWithOpacity, darkenColor } from '../utils/colors';

const initialState: AppState = {
  nodes: {},
  groups: {},
  canvas: { offset: { x: 400, y: 300 }, scale: 1 },
  activeNodeId: null,
  theme: 'light',
  contextMenu: null
};

export const useMindMapManager = () => {
  const [state, setState] = useState<AppState>(initialState);
  const [showHelpPanel, setShowHelpPanel] = useState(false);
  const [connectionStyle, setConnectionStyle] = useState<ConnectionStyle>({
    type: 'solid',
  });
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    draggedNodes: string[];
    startPositions: Record<string, Point>;
  }>({
    isDragging: false,
    draggedNodes: [],
    startPositions: {}
  });

  // Core node operations
  const updateNode = useCallback((id: string, updates: Partial<NodeData>) => {
    setState(prev => ({
      ...prev,
      nodes: {
        ...prev.nodes,
        [id]: { ...prev.nodes[id], ...updates }
      }
    }));
  }, []);

  const createNode = useCallback((position: Point, content = 'New Node', type: NodeData['type'] = 'text', parentId?: string) => {
    const id = generateId();
    
    // Determine colors based on parent inheritance
    let backgroundColor, borderColor;
    
    if (parentId && state.nodes[parentId]) {
      const parent = state.nodes[parentId];
      const parentBg = parent.style.backgroundColor;
      
      // Apply 90% opacity to parent's background color
      backgroundColor = convertToRGBAWithOpacity(parentBg, 0.9);
      borderColor = darkenColor(backgroundColor);
    } else {
      // Use theme-appropriate default colors for root nodes
      const defaultColors = state.theme === 'dark' 
        ? { backgroundColor: '#374151', borderColor: '#6B7280' }  // Dark gray for dark mode
        : { backgroundColor: '#ffffff', borderColor: '#e5e7eb' }; // White for light mode
      backgroundColor = defaultColors.backgroundColor;
      borderColor = defaultColors.borderColor;
    }
    
    const newNode: NodeData = {
      id,
      type,
      content,
      position,
      size: { width: 200, height: 80 },
      children: [],
      selected: false,
      editing: true,
      parentId,
      style: {
        backgroundColor,
        borderColor,
        shape: 'rounded',
        borderRadius: 12,
        textStyle: {
          bold: false,
          italic: false,
          underline: false,
          strikethrough: false,
          fontSize: 14
        }
      }
    };

    setState(prev => {
      const newState = {
        ...prev,
        nodes: { ...prev.nodes, [id]: newNode },
        activeNodeId: id
      };

      // Add to parent's children if parentId provided
      if (parentId && prev.nodes[parentId]) {
        newState.nodes[parentId] = {
          ...prev.nodes[parentId],
          children: [...prev.nodes[parentId].children, id]
        };
      }

      return newState;
    });

    return id;
  }, [state.nodes, state.theme]);

  const createChildNode = useCallback((parentId: string) => {
    const parent = state.nodes[parentId];
    if (!parent) return;

    const existingChildren = parent.children.length;
    const childPosition = {
      x: parent.position.x + 250,
      y: parent.position.y + (existingChildren * 100) + 100
    };

    createNode(childPosition, 'Child Node', 'text', parentId);
  }, [state.nodes, createNode]);

  const createSiblingNode = useCallback((nodeId: string) => {
    const node = state.nodes[nodeId];
    if (!node) return;

    const siblingPosition = {
      x: node.position.x,
      y: node.position.y + 100
    };

    createNode(siblingPosition, 'Sibling Node', 'text', node.parentId);
  }, [state.nodes, createNode]);

  const selectNode = useCallback((id: string, multi: boolean) => {
    setState(prev => {
      const newNodes = { ...prev.nodes };
      
      if (!multi) {
        // Clear all selections
        Object.keys(newNodes).forEach(nodeId => {
          newNodes[nodeId] = { ...newNodes[nodeId], selected: false };
        });
      }

      // Toggle or select the clicked node
      newNodes[id] = { 
        ...newNodes[id], 
        selected: !newNodes[id].selected || !multi,
        editing: false
      };

      return {
        ...prev,
        nodes: newNodes,
        activeNodeId: id
      };
    });
  }, []);

  const deleteSelectedNodes = useCallback(() => {
    setState(prev => {
      const nodesToDelete = Object.values(prev.nodes)
        .filter(node => node.selected)
        .map(node => node.id);

      if (nodesToDelete.length === 0) return prev;

      const newNodes = { ...prev.nodes };
      const newGroups = { ...prev.groups };

      // Remove deleted nodes from their parents' children arrays
      nodesToDelete.forEach(nodeId => {
        const node = newNodes[nodeId];
        if (node.parentId && newNodes[node.parentId]) {
          newNodes[node.parentId] = {
            ...newNodes[node.parentId],
            children: newNodes[node.parentId].children.filter(id => id !== nodeId)
          };
        }
        
        // Orphan the children (remove their parentId)
        node.children.forEach(childId => {
          if (newNodes[childId]) {
            newNodes[childId] = { ...newNodes[childId], parentId: undefined };
          }
        });

        delete newNodes[nodeId];
      });

      // Remove groups that contain deleted nodes
      Object.entries(newGroups).forEach(([groupId, group]) => {
        const hasDeletedNodes = group.nodeIds.some(nodeId => nodesToDelete.includes(nodeId));
        if (hasDeletedNodes) {
          delete newGroups[groupId];
        }
      });

      return {
        ...prev,
        nodes: newNodes,
        groups: newGroups,
        activeNodeId: prev.activeNodeId && nodesToDelete.includes(prev.activeNodeId) ? null : prev.activeNodeId
      };
    });
  }, []);

  const groupSelectedNodes = useCallback(() => {
    const selectedNodes = Object.values(state.nodes).filter(node => node.selected);
    if (selectedNodes.length < 2) return;

    const groupId = generateId();
    const bounds = getBoundingBox(selectedNodes);

    const newGroup: GroupData = {
      id: groupId,
      nodeIds: selectedNodes.map(node => node.id),
      bounds
    };

    setState(prev => ({
      ...prev,
      groups: { ...prev.groups, [groupId]: newGroup },
      nodes: Object.fromEntries(
        Object.entries(prev.nodes).map(([id, node]) => [
          id,
          selectedNodes.some(n => n.id === id)
            ? { ...node, groupId, selected: false }
            : node
        ])
      )
    }));
  }, [state.nodes]);

  const connectSelectedNodes = useCallback(() => {
    const selectedNodes = Object.values(state.nodes).filter(node => node.selected);
    
    if (selectedNodes.length !== 2) return;

    const [node1, node2] = selectedNodes;
    
    // Check if they're already directly connected (either direction)
    const alreadyConnected = node1.children.includes(node2.id) || node2.children.includes(node1.id);
    
    if (alreadyConnected) {
      toast.error('Nodes are already connected');
      return;
    }

    // Add the connection: node1 -> node2
    setState(prev => ({
      ...prev,
      nodes: {
        ...prev.nodes,
        [node1.id]: {
          ...prev.nodes[node1.id],
          children: [...prev.nodes[node1.id].children, node2.id],
          selected: false
        },
        [node2.id]: {
          ...prev.nodes[node2.id],
          selected: false
        }
      }
    }));
    
    toast.success('Nodes connected');
  }, [state.nodes]);

  // Canvas operations
  const handleCanvasChange = useCallback((canvas: typeof state.canvas) => {
    setState(prev => ({ ...prev, canvas }));
  }, []);

  const handleCanvasClick = useCallback(() => {
    setState(prev => ({
      ...prev,
      nodes: Object.fromEntries(
        Object.entries(prev.nodes).map(([id, node]) => [
          id,
          { ...node, selected: false, editing: false }
        ])
      ),
      activeNodeId: null,
      contextMenu: null
    }));
    setSelectedGroupId(null);
  }, []);

  const handleCanvasDoubleClick = useCallback((position: Point) => {
    createNode(position);
  }, [createNode]);

  // Theme and UI operations
  const handleThemeToggle = useCallback(() => {
    setState(prev => ({ ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' }));
  }, []);

  const handleToggleHelpPanel = useCallback(() => {
    setShowHelpPanel(prev => !prev);
  }, []);

  // File operations
  const handleExport = useCallback(() => {
    downloadJSON(state);
  }, [state]);

  const handleImport = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedState = importFromJSON(e.target?.result as string);
        setState(importedState);
      } catch (error) {
        alert('Failed to import file. Please check the format.');
      }
    };
    reader.readAsText(file);
  }, []);

  const handleReset = useCallback(() => {
    if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
      setState(initialState);
    }
  }, []);

  const handleSave = useCallback(() => {
    toast.success('Save functionality coming soon!');
  }, []);

  const handleZoomIn = useCallback(() => {
    const scaleFactor = 1.2;
    const newScale = Math.max(0.1, Math.min(3, state.canvas.scale * scaleFactor));
    
    setState(prev => ({
      ...prev,
      canvas: {
        ...prev.canvas,
        scale: newScale
      }
    }));
  }, [state.canvas.scale]);

  const handleZoomOut = useCallback(() => {
    const scaleFactor = 0.8;
    const newScale = Math.max(0.1, Math.min(3, state.canvas.scale * scaleFactor));
    
    setState(prev => ({
      ...prev,
      canvas: {
        ...prev.canvas,
        scale: newScale
      }
    }));
  }, [state.canvas.scale]);

  const handleZoomTo100Percent = useCallback(() => {
    setState(prev => ({
      ...prev,
      canvas: {
        ...prev.canvas,
        scale: 1
      }
    }));
  }, []);

  const handleSmartZoom = useCallback((zoomIn: boolean) => {
    const selectedNodes = Object.values(state.nodes).filter(node => node.selected);
    
    if (selectedNodes.length > 0) {
      const avgX = selectedNodes.reduce((sum, node) => sum + node.position.x, 0) / selectedNodes.length;
      const avgY = selectedNodes.reduce((sum, node) => sum + node.position.y, 0) / selectedNodes.length;
      
      const screenX = avgX * state.canvas.scale + state.canvas.offset.x;
      const screenY = avgY * state.canvas.scale + state.canvas.offset.y;
      
      const newScale = clampZoom(state.canvas.scale * (zoomIn ? 1.2 : 1 / 1.2));
      
      const newOffsetX = screenX - avgX * newScale;
      const newOffsetY = screenY - avgY * newScale;
      
      setState(prev => ({
        ...prev,
        canvas: {
          scale: newScale,
          offset: { x: newOffsetX, y: newOffsetY }
        }
      }));
    } else {
      if (zoomIn) {
        handleZoomIn();
      } else {
        handleZoomOut();
      }
    }
  }, [state.nodes, state.canvas, handleZoomIn, handleZoomOut]);

  // Viewport operations
  const fitNodesToViewport = useCallback((nodes: NodeData[]) => {
    if (nodes.length === 0) return;
    
    const bounds = getBoundingBox(nodes);
    const padding = 50;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    const scaleX = (viewportWidth - padding * 2) / bounds.width;
    const scaleY = (viewportHeight - padding * 2) / bounds.height;
    const scale = clampZoom(Math.min(scaleX, scaleY));
    
    const centerX = bounds.x + bounds.width / 2;
    const centerY = bounds.y + bounds.height / 2;
    const offsetX = viewportWidth / 2 - centerX * scale;
    const offsetY = viewportHeight / 2 - centerY * scale;
    
    setState(prev => ({
      ...prev,
      canvas: {
        scale,
        offset: { x: offsetX, y: offsetY }
      }
    }));
  }, []);

  const handleFitAllToViewport = useCallback(() => {
    const allNodes = Object.values(state.nodes);
    fitNodesToViewport(allNodes);
  }, [state.nodes, fitNodesToViewport]);

  const handleFitSelectedToViewport = useCallback(() => {
    const selectedNodes = Object.values(state.nodes).filter(node => node.selected);
    if (selectedNodes.length === 0) return;
    
    const allNodesToFit: NodeData[] = [];
    const processedIds = new Set<string>();
    
    selectedNodes.forEach(node => {
      if (!processedIds.has(node.id)) {
        const subtreeNodes = getNodesInSubtree(node.id, state.nodes);
        subtreeNodes.forEach(subtreeNode => {
          if (!processedIds.has(subtreeNode.id)) {
            allNodesToFit.push(subtreeNode);
            processedIds.add(subtreeNode.id);
          }
        });
      }
    });
    
    fitNodesToViewport(allNodesToFit);
  }, [state.nodes, fitNodesToViewport]);

  // Drag operations
  const handleNodeDragStart = useCallback((nodeId: string, startPos: Point) => {
    const selectedNodes = Object.values(state.nodes).filter(node => node.selected);
    const dragNodeIds = selectedNodes.length > 1 && selectedNodes.some(n => n.id === nodeId)
      ? selectedNodes.map(n => n.id)
      : [nodeId];

    const startPositions: Record<string, Point> = {};
    dragNodeIds.forEach(id => {
      const node = state.nodes[id];
      if (node) {
        startPositions[id] = { ...node.position };
      }
    });

    setDragState({
      isDragging: true,
      draggedNodes: dragNodeIds,
      startPositions
    });
  }, [state.nodes]);

  const handleNodeDragMove = useCallback((delta: Point) => {
    if (!dragState.isDragging) return;

    setState(prev => {
      const newNodes = { ...prev.nodes };
      const newGroups = { ...prev.groups };

      dragState.draggedNodes.forEach(nodeId => {
        const startPos = dragState.startPositions[nodeId];
        if (startPos && newNodes[nodeId]) {
          newNodes[nodeId] = {
            ...newNodes[nodeId],
            position: {
              x: startPos.x + delta.x / prev.canvas.scale,
              y: startPos.y + delta.y / prev.canvas.scale
            }
          };
        }
      });

      // Update group bounds for affected groups
      Object.values(newGroups).forEach(group => {
        const hasAffectedNodes = group.nodeIds.some(nodeId => dragState.draggedNodes.includes(nodeId));
        if (hasAffectedNodes) {
          const groupNodes = group.nodeIds.map(id => newNodes[id]).filter(Boolean);
          group.bounds = getBoundingBox(groupNodes);
        }
      });

      return { ...prev, nodes: newNodes, groups: newGroups };
    });
  }, [dragState]);

  const handleNodeDragEnd = useCallback(() => {
    setDragState({
      isDragging: false,
      draggedNodes: [],
      startPositions: {}
    });
  }, []);

  // File drop operations
  const handleFilesDrop = useCallback((files: FileList, position: Point, targetNodeId?: string) => {
    Array.from(files).forEach((file, index) => {
      const offsetPosition = {
        x: position.x + index * 20,
        y: position.y + index * 20
      };

      const parentId = targetNodeId || state.activeNodeId;

      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        createNode(offsetPosition, url, 'image', parentId);
        toast.success(`Added image: ${file.name}`);
      } else {
        createNode(offsetPosition, file.name, 'text', parentId);
        toast.success(`Added file: ${file.name}`);
      }
    });
  }, [createNode, state.activeNodeId]);

  // Handle text/URL drops
  const handleTextDrop = useCallback((text: string, position: Point, targetNodeId?: string) => {
    const parentId = targetNodeId || state.activeNodeId;
    
    // Check if it's a URL
    const urlPattern = /^(https?:\/\/|www\.)/i;
    const isUrl = urlPattern.test(text.trim());
    
    if (isUrl) {
      createNode(position, text.trim(), 'link', parentId);
      toast.success('Added link node');
    } else {
      createNode(position, text.trim(), 'text', parentId);
      toast.success('Added text node');
    }
  }, [createNode, state.activeNodeId]);

  // Formatting operations
  const handleColorChange = useCallback((type: 'background' | 'border', color: string) => {
    setState(prev => {
      const newNodes = { ...prev.nodes };
      Object.values(newNodes).forEach(node => {
        if (node.selected) {
          newNodes[node.id] = {
            ...node,
            style: {
              ...node.style,
              backgroundColor: type === 'background' ? color : node.style.backgroundColor,
              borderColor: type === 'border' ? color : node.style.borderColor
            }
          };
        }
      });
      return { ...prev, nodes: newNodes };
    });
  }, []);

  const handleTextFormat = useCallback((format: 'bold' | 'italic' | 'underline' | 'strikethrough') => {
    setState(prev => {
      const newNodes = { ...prev.nodes };
      Object.values(newNodes).forEach(node => {
        if (node.selected) {
          newNodes[node.id] = {
            ...node,
            style: {
              ...node.style,
              textStyle: {
                ...node.style.textStyle,
                [format]: !node.style.textStyle[format]
              }
            }
          };
        }
      });
      return { ...prev, nodes: newNodes };
    });
  }, []);

  const handleGlobalColorChange = useCallback((type: 'background' | 'border', color: string) => {
    setState(prev => {
      const newNodes = { ...prev.nodes };
      Object.keys(newNodes).forEach(nodeId => {
        newNodes[nodeId] = {
          ...newNodes[nodeId],
          style: {
            ...newNodes[nodeId].style,
            [type === 'background' ? 'backgroundColor' : 'borderColor']: color
          }
        };
      });
      return { ...prev, nodes: newNodes };
    });
  }, []);

  const handleGlobalTextFormat = useCallback((format: 'bold' | 'italic' | 'underline' | 'strikethrough') => {
    setState(prev => {
      const newNodes = { ...prev.nodes };
      Object.keys(newNodes).forEach(nodeId => {
        newNodes[nodeId] = {
          ...newNodes[nodeId],
          style: {
            ...newNodes[nodeId].style,
            textStyle: {
              ...newNodes[nodeId].style.textStyle,
              [format]: !newNodes[nodeId].style.textStyle[format]
            }
          }
        };
      });
      return { ...prev, nodes: newNodes };
    });
  }, []);

  const handleFontSizeChange = useCallback((increase: boolean) => {
    setState(prev => {
      const newNodes = { ...prev.nodes };
      Object.values(newNodes).forEach(node => {
        if (node.selected) {
          const currentSize = node.style.textStyle.fontSize;
          const newSize = increase 
            ? Math.min(currentSize + 2, 32) 
            : Math.max(currentSize - 2, 8);
          
          newNodes[node.id] = {
            ...node,
            style: {
              ...node.style,
              textStyle: {
                ...node.style.textStyle,
                fontSize: newSize
              }
            }
          };
        }
      });
      return { ...prev, nodes: newNodes };
    });
  }, []);

  const handleGlobalFontSizeChange = useCallback((increase: boolean) => {
    setState(prev => {
      const newNodes = { ...prev.nodes };
      Object.keys(newNodes).forEach(nodeId => {
        const currentSize = newNodes[nodeId].style.textStyle.fontSize;
        const newSize = increase 
          ? Math.min(currentSize + 2, 32) 
          : Math.max(currentSize - 2, 8);
        
        newNodes[nodeId] = {
          ...newNodes[nodeId],
          style: {
            ...newNodes[nodeId].style,
            textStyle: {
              ...newNodes[nodeId].style.textStyle,
              fontSize: newSize
            }
          }
        };
      });
      return { ...prev, nodes: newNodes };
    });
  }, []);

  const handleShapeChange = useCallback((shape: 'rectangle' | 'rounded' | 'pill') => {
    setState(prev => {
      const newNodes = { ...prev.nodes };
      Object.values(newNodes).forEach(node => {
        if (node.selected) {
          newNodes[node.id] = {
            ...node,
            style: {
              ...node.style,
              shape,
              borderRadius: shape === 'rectangle' ? 4 : shape === 'rounded' ? 12 : Math.min(node.size.width, node.size.height) / 2
            }
          };
        }
      });
      return { ...prev, nodes: newNodes };
    });
  }, []);

  const handleGlobalShapeChange = useCallback((shape: 'rectangle' | 'rounded' | 'pill') => {
    setState(prev => {
      const newNodes = { ...prev.nodes };
      Object.keys(newNodes).forEach(nodeId => {
        newNodes[nodeId] = {
          ...newNodes[nodeId],
          style: {
            ...newNodes[nodeId].style,
            shape,
            borderRadius: shape === 'rectangle' ? 4 : shape === 'rounded' ? 12 : Math.min(newNodes[nodeId].size.width, newNodes[nodeId].size.height) / 2
          }
        };
      });
      return { ...prev, nodes: newNodes };
    });
  }, []);

  // Group operations
  const handleGroupUpdate = useCallback((groupId: string, updates: Partial<GroupData>) => {
    setState(prev => ({
      ...prev,
      groups: {
        ...prev.groups,
        [groupId]: { ...prev.groups[groupId], ...updates }
      }
    }));
  }, []);

  const handleGroupSelect = useCallback((groupId: string) => {
    setSelectedGroupId(groupId);
    setState(prev => ({
      ...prev,
      nodes: Object.fromEntries(
        Object.entries(prev.nodes).map(([id, node]) => [
          id,
          { ...node, selected: false }
        ])
      )
    }));
  }, []);

  const handleGroupColorChange = useCallback((color: string) => {
    if (!selectedGroupId) return;
    
    setState(prev => ({
      ...prev,
      groups: {
        ...prev.groups,
        [selectedGroupId]: {
          ...prev.groups[selectedGroupId],
          style: {
            ...prev.groups[selectedGroupId].style,
            backgroundColor: color
          }
        }
      }
    }));
  }, [selectedGroupId]);

  const handleGroupBorderChange = useCallback((color: string) => {
    if (!selectedGroupId) return;
    
    setState(prev => ({
      ...prev,
      groups: {
        ...prev.groups,
        [selectedGroupId]: {
          ...prev.groups[selectedGroupId],
          style: {
            ...prev.groups[selectedGroupId].style,
            borderColor: color
          }
        }
      }
    }));
  }, [selectedGroupId]);

  const handleUngroup = useCallback(() => {
    if (!selectedGroupId) return;
    
    setState(prev => {
      const newNodes = { ...prev.nodes };
      const newGroups = { ...prev.groups };
      
      const group = newGroups[selectedGroupId];
      if (group) {
        group.nodeIds.forEach(nodeId => {
          if (newNodes[nodeId]) {
            newNodes[nodeId] = { ...newNodes[nodeId], groupId: undefined };
          }
        });
      }
      
      delete newGroups[selectedGroupId];
      
      return { ...prev, nodes: newNodes, groups: newGroups };
    });
    
    setSelectedGroupId(null);
  }, [selectedGroupId]);

  // Connection style management
  const handleConnectionStyleChange = useCallback((nodeId1: string, nodeId2: string, style: ConnectionStyle) => {
    setState(prev => {
      const newNodes = { ...prev.nodes };
      
      // Find which node has the other in its children array
      if (newNodes[nodeId1]?.children.includes(nodeId2)) {
        // nodeId1 -> nodeId2 connection
        newNodes[nodeId1] = {
          ...newNodes[nodeId1],
          connectionStyles: {
            ...newNodes[nodeId1].connectionStyles,
            [nodeId2]: style
          }
        };
      } else if (newNodes[nodeId2]?.children.includes(nodeId1)) {
        // nodeId2 -> nodeId1 connection
        newNodes[nodeId2] = {
          ...newNodes[nodeId2],
          connectionStyles: {
            ...newNodes[nodeId2].connectionStyles,
            [nodeId1]: style
          }
        };
      }
      
      return { ...prev, nodes: newNodes };
    });
  }, []);

  const getConnectionStyle = useCallback((nodeId1: string, nodeId2: string): ConnectionStyle => {
    // Check if nodeId1 has nodeId2 in its children
    if (state.nodes[nodeId1]?.children.includes(nodeId2)) {
      return state.nodes[nodeId1].connectionStyles?.[nodeId2] || connectionStyle;
    }
    // Check if nodeId2 has nodeId1 in its children
    if (state.nodes[nodeId2]?.children.includes(nodeId1)) {
      return state.nodes[nodeId2].connectionStyles?.[nodeId1] || connectionStyle;
    }
    // Default style if no connection exists
    return connectionStyle;
  }, [state.nodes, connectionStyle]);

  // Context menu operations
  const handleContextMenu = useCallback((e: React.MouseEvent, context: { type: 'canvas' | 'node' | 'selection'; nodeId?: string }) => {
    e.preventDefault();
    
    const selectedNodes = Object.values(state.nodes).filter(node => node.selected);
    const selectedCount = selectedNodes.length;
    
    let contextType = context.type;
    if (selectedCount > 1) {
      contextType = 'selection';
    }
    
    setState(prev => ({
      ...prev,
      contextMenu: {
        position: { x: e.clientX, y: e.clientY },
        context: {
          type: contextType,
          nodeId: context.nodeId,
          selectedCount
        }
      }
    }));
  }, [state.nodes]);

  const handleCloseContextMenu = useCallback(() => {
    setState(prev => ({ ...prev, contextMenu: null }));
  }, []);

  // Computed values
  const selectedNodeIds = Object.values(state.nodes)
    .filter(node => node.selected)
    .map(node => node.id);

  const getMiniToolbarPosition = useCallback(() => {
    const selectedNodes = Object.values(state.nodes).filter(node => node.selected);
    if (selectedNodes.length === 0) return null;

    const avgX = selectedNodes.reduce((sum, node) => sum + node.position.x, 0) / selectedNodes.length;
    const avgY = selectedNodes.reduce((sum, node) => sum + node.position.y, 0) / selectedNodes.length;

    return {
      x: avgX * state.canvas.scale + state.canvas.offset.x,
      y: avgY * state.canvas.scale + state.canvas.offset.y
    };
  }, [state.nodes, state.canvas]);

  // Context menu actions
  const contextMenuActions = {
    onCreateNode: () => {
      if (state.contextMenu) {
        const canvasPos = {
          x: (state.contextMenu.position.x - state.canvas.offset.x) / state.canvas.scale,
          y: (state.contextMenu.position.y - state.canvas.offset.y) / state.canvas.scale
        };
        createNode(canvasPos);
      }
    },
    onCreateChild: () => {
      if (state.contextMenu?.context.nodeId) {
        createChildNode(state.contextMenu.context.nodeId);
      }
    },
    onCreateSibling: () => {
      if (state.contextMenu?.context.nodeId) {
        createSiblingNode(state.contextMenu.context.nodeId);
      }
    },
    onEdit: () => {
      if (state.contextMenu?.context.nodeId) {
        updateNode(state.contextMenu.context.nodeId, { editing: true });
      }
    },
    onCopy: () => {
      const selectedNodes = Object.values(state.nodes).filter(node => node.selected);
      if (selectedNodes.length > 0) {
        const textContent = selectedNodes.map(node => node.content).join('\n');
        navigator.clipboard.writeText(textContent).catch(() => {
          toast.error('Failed to copy to clipboard');
        });
        toast.success(`Copied ${selectedNodes.length} node${selectedNodes.length > 1 ? 's' : ''}`);
      }
    },
    onCut: () => {
      contextMenuActions.onCopy();
      deleteSelectedNodes();
    },
    onPaste: async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (!text.trim()) {
          toast.error('Clipboard is empty');
          return;
        }

        if (state.contextMenu?.context.nodeId) {
          const parentNode = state.nodes[state.contextMenu.context.nodeId];
          if (parentNode) {
            const childPosition = {
              x: parentNode.position.x + 250,
              y: parentNode.position.y + (parentNode.children.length * 100) + 100
            };
            createNode(childPosition, text.trim(), 'text', state.contextMenu.context.nodeId);
            toast.success('Pasted as child node');
          }
        } else {
          const canvasPos = {
            x: (state.contextMenu!.position.x - state.canvas.offset.x) / state.canvas.scale,
            y: (state.contextMenu!.position.y - state.canvas.offset.y) / state.canvas.scale
          };
          createNode(canvasPos, text.trim(), 'text');
          toast.success('Pasted as new node');
        }
      } catch (error) {
        toast.error('Failed to access clipboard');
      }
    },
    onDelete: deleteSelectedNodes,
    onConnect: connectSelectedNodes,
    onGroup: groupSelectedNodes,
    onSelectAll: () => {
      setState(prev => ({
        ...prev,
        nodes: Object.fromEntries(
          Object.entries(prev.nodes).map(([id, node]) => [
            id,
            { ...node, selected: true }
          ])
        )
      }));
      toast.success(`Selected ${Object.keys(state.nodes).length} nodes`);
    },
    onChangeColor: () => {
      toast.info('Color picker coming soon!');
    }
  };

  return {
    // State
    state,
    setState,
    showHelpPanel,
    connectionStyle,
    setConnectionStyle,
    selectedGroupId,
    dragState,
    setDragState,
    selectedNodeIds,
    getMiniToolbarPosition,
    contextMenuActions,

    // Core operations
    updateNode,
    createNode,
    createChildNode,
    createSiblingNode,
    selectNode,
    deleteSelectedNodes,
    groupSelectedNodes,
    connectSelectedNodes,

    // Canvas operations
    handleCanvasChange,
    handleCanvasClick,
    handleCanvasDoubleClick,

    // Theme and UI
    handleThemeToggle,
    handleToggleHelpPanel,

    // File operations
    handleExport,
    handleImport,
    handleReset,
    handleSave,

    // Zoom operations
    handleZoomIn,
    handleZoomOut,
    handleZoomTo100Percent,
    handleSmartZoom,
    handleFitAllToViewport,
    handleFitSelectedToViewport,

    // Drag operations
    handleNodeDragStart,
    handleNodeDragMove,
    handleNodeDragEnd,
    handleFilesDrop,
    handleTextDrop,

    // Formatting operations
    handleColorChange,
    handleTextFormat,
    handleGlobalColorChange,
    handleGlobalTextFormat,
    handleFontSizeChange,
    handleGlobalFontSizeChange,
    handleShapeChange,
    handleGlobalShapeChange,

    // Group operations
    handleGroupUpdate,
    handleGroupSelect,
    handleGroupColorChange,
    handleGroupBorderChange,
    handleUngroup,

    // Connection operations
    handleConnectionStyleChange,
    getConnectionStyle,

    // Context menu operations
    handleContextMenu,
    handleCloseContextMenu
  };
};
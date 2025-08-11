import { useEffect, useCallback } from 'react';
import { NodeData, CanvasState, Point } from '../types';
import toast from 'react-hot-toast';

interface UseKeyboardShortcutsProps {
  nodes: Record<string, NodeData>;
  canvas: CanvasState;
  activeNodeId: string | null;
  onCreateChildNode: (parentId: string) => void;
  onCreateSiblingNode: (nodeId: string) => void;
  onDeleteSelectedNodes: () => void;
  onGroupSelectedNodes: () => void;
  onConnectSelectedNodes: () => void;
  onCreateNode: (position: Point, content?: string, type?: NodeData['type'], parentId?: string) => void;
  onZoomTo100Percent: () => void;
  onFitAllToViewport: () => void;
  onFitSelectedToViewport: () => void;
  onToggleHelpPanel: () => void;
  onSmartZoom: (zoomIn: boolean) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export const useKeyboardShortcuts = ({
  nodes,
  canvas,
  activeNodeId,
  onCreateChildNode,
  onCreateSiblingNode,
  onDeleteSelectedNodes,
  onGroupSelectedNodes,
  onConnectSelectedNodes,
  onCreateNode,
  onZoomTo100Percent,
  onFitAllToViewport,
  onFitSelectedToViewport,
  onToggleHelpPanel,
  onSmartZoom,
  onZoomIn,
  onZoomOut
}: UseKeyboardShortcutsProps) => {
  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text.trim()) {
        toast.error('Clipboard is empty');
        return;
      }

      if (activeNodeId) {
        // Create as child node if there's an active node
        const activeNode = nodes[activeNodeId];
        if (activeNode) {
          const childPosition = {
            x: activeNode.position.x + 250,
            y: activeNode.position.y + (activeNode.children.length * 100) + 100
          };
          onCreateNode(childPosition, text.trim(), 'text', activeNodeId);
          toast.success('Pasted as child node');
        }
      } else {
        // Create as new node at center of screen if no active node
        const centerPosition = {
          x: (window.innerWidth / 2 - canvas.offset.x) / canvas.scale,
          y: (window.innerHeight / 2 - canvas.offset.y) / canvas.scale
        };
        onCreateNode(centerPosition, text.trim(), 'text');
        toast.success('Pasted as new node');
      }
    } catch (error) {
      toast.error('Failed to access clipboard');
    }
  }, [activeNodeId, nodes, onCreateNode, canvas]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't handle shortcuts if user is editing a node
    if (document.activeElement?.tagName === 'INPUT' || 
        document.activeElement?.tagName === 'TEXTAREA') {
      // Allow copy/paste even when editing
      if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'v')) {
        if (e.key === 'v') {
          // Don't handle paste when editing - let browser handle it
          return;
        }
        // Let browser handle copy when editing
        return;
      }
      return;
    }

    // Handle Ctrl/Cmd + V for paste
    if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
      e.preventDefault();
      handlePaste();
      return;
    }

    // Handle Ctrl/Cmd + C for copy (let browser handle it naturally)
    if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
      // Don't prevent default - let browser handle copy
      return;
    }

    // Handle Ctrl/Cmd + C for copy (let browser handle it)
    if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
      // Don't prevent default - let browser handle copy
      return;
    }

    const selectedNodes = Object.values(nodes).filter(node => node.selected);
    switch (e.key) {
      case 'Tab':
        e.preventDefault();
        if (activeNodeId) {
          onCreateChildNode(activeNodeId);
          toast.success('Child node created');
        } else {
          toast.error('No active node selected');
        }
        break;
      
      case 'Enter':
        if (e.shiftKey && activeNodeId) {
          e.preventDefault();
          onCreateSiblingNode(activeNodeId);
          toast.success('Sibling node created');
        }
        break;
      
      case 'Delete':
      case 'Backspace':
        e.preventDefault();
        if (selectedNodes.length > 0) {
          onDeleteSelectedNodes();
          toast.success(`Deleted ${selectedNodes.length} node${selectedNodes.length > 1 ? 's' : ''}`);
        } else {
          toast.error('No nodes selected to delete');
        }
        break;
      
      case 'g':
      case 'G':
        e.preventDefault();
        if (selectedNodes.length >= 2) {
          onGroupSelectedNodes();
          toast.success(`Grouped ${selectedNodes.length} nodes`);
        } else {
          toast.error('Select at least 2 nodes to group');
        }
        break;
      
      case 'c':
      case 'C':
        // Only handle 'c' key without Ctrl/Cmd modifiers
        if (e.ctrlKey || e.metaKey) {
          return; // Let browser handle Ctrl/Cmd+C
        }
        e.preventDefault();
        if (selectedNodes.length === 2) {
          onConnectSelectedNodes();
          toast.success('Nodes connected');
        } else if (selectedNodes.length > 2) {
          toast.error('Unable to connect multiple nodes. Select exactly 2 nodes.');
        } else {
          toast.error('Select exactly 2 nodes to connect');
        }
        break;
      
      case '0':
        e.preventDefault();
        onZoomTo100Percent();
        toast.success('Zoom reset to 100%');
        break;
      
      case '1':
        e.preventDefault();
        onFitAllToViewport();
        toast.success('Fitted all nodes to viewport');
        break;
      
      case '2':
        e.preventDefault();
        if (selectedNodes.length > 0) {
          onFitSelectedToViewport();
          toast.success('Fitted selected nodes to viewport');
        } else {
          toast.error('No nodes selected to fit');
        }
        break;
      
      case '?':
        e.preventDefault();
        onToggleHelpPanel();
        break;
      
      case '=':
      case '+':
        e.preventDefault();
        if (selectedNodes.length > 0) {
          onSmartZoom(true);
          toast.success('Zoomed in towards selection');
        } else {
          onZoomIn();
          toast.success('Zoomed in');
        }
        break;
      
      case '-':
      case '_':
        e.preventDefault();
        if (selectedNodes.length > 0) {
          onSmartZoom(false);
          toast.success('Zoomed out from selection');
        } else {
          onZoomOut();
          toast.success('Zoomed out');
        }
        break;
    }
  }, [nodes, activeNodeId, onCreateChildNode, onCreateSiblingNode, onDeleteSelectedNodes, onGroupSelectedNodes, onConnectSelectedNodes, handlePaste, onZoomTo100Percent, onFitAllToViewport, onFitSelectedToViewport, onToggleHelpPanel, onZoomIn, onZoomOut, onSmartZoom]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};
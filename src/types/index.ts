export interface Point {
  x: number;
  y: number;
}

export interface NodeData {
  id: string;
  type: 'text' | 'image' | 'link';
  content: string;
  position: Point;
  size: { width: number; height: number };
  parentId?: string;
  children: string[];
  selected: boolean;
  editing: boolean;
  groupId?: string;
  style: {
    backgroundColor: string;
    borderColor: string;
    shape: 'rectangle' | 'rounded' | 'pill';
    borderRadius: number;
    textStyle: {
      bold: boolean;
      italic: boolean;
      underline: boolean;
      strikethrough: boolean;
      fontSize: number;
    };
  };
  connectionStyles?: Record<string, ConnectionStyle>; // Styles for connections to other nodes
}

export interface ConnectionStyle {
  type: 'solid' | 'dashed';
}

export interface GroupData {
  id: string;
  nodeIds: string[];
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface CanvasState {
  offset: Point;
  scale: number;
}

export interface AppState {
  nodes: Record<string, NodeData>;
  groups: Record<string, GroupData>;
  canvas: CanvasState;
  activeNodeId: string | null;
  theme: 'light' | 'dark';
  contextMenu: {
    position: Point;
    context: {
      type: 'canvas' | 'node' | 'selection';
      nodeId?: string;
      selectedCount?: number;
    };
  } | null;
}

export interface DragState {
  isDragging: boolean;
  startPos: Point;
  dragOffset: Point;
  draggedNodes: string[];
}
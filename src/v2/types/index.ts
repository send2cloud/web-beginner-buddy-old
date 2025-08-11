export interface Point {
  x: number;
  y: number;
}

export interface NodeData {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  parentId?: string;
  children: string[];
  style: {
    backgroundColor: string;
    borderColor: string;
    textColor: string;
    fontSize: number;
    shape: 'rectangle' | 'circle' | 'diamond';
    borderWidth: number;
  };
  fileUrl?: string;
  fileType?: string;
  fileName?: string;
}

export interface ConnectionData {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  style: {
    color: string;
    width: number;
  };
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
  style: {
    backgroundColor: string;
    borderColor: string;
  };
}

export interface CanvasState {
  nodes: Record<string, NodeData>;
  connections: Record<string, ConnectionData>;
  groups: Record<string, GroupData>;
  selectedNodes: string[];
  selectedGroups: string[];
  activeNodeId?: string;
  scale: number;
  offset: Point;
  isDragging: boolean;
  isConnecting: boolean;
  connectingFromId?: string;
  history: CanvasState[];
  historyIndex: number;
}

export interface DragState {
  isDragging: boolean;
  draggedNodeId?: string;
  dragOffset: Point;
  startPosition: Point;
}
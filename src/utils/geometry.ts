import { Point, NodeData } from '../types';

export const distance = (p1: Point, p2: Point): number => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

export const isPointInRect = (point: Point, rect: { x: number; y: number; width: number; height: number }): boolean => {
  return point.x >= rect.x && 
         point.x <= rect.x + rect.width && 
         point.y >= rect.y && 
         point.y <= rect.y + rect.height;
};

export const getBoundingBox = (nodes: NodeData[]): { x: number; y: number; width: number; height: number } => {
  if (nodes.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  nodes.forEach(node => {
    const left = node.position.x - node.size.width / 2;
    const right = node.position.x + node.size.width / 2;
    const top = node.position.y - node.size.height / 2;
    const bottom = node.position.y + node.size.height / 2;

    minX = Math.min(minX, left);
    minY = Math.min(minY, top);
    maxX = Math.max(maxX, right);
    maxY = Math.max(maxY, bottom);
  });

  const padding = 20;
  return {
    x: minX - padding,
    y: minY - padding,
    width: maxX - minX + padding * 2,
    height: maxY - minY + padding * 2
  };
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const getNodesInSubtree = (nodeId: string, nodes: Record<string, NodeData>): NodeData[] => {
  const result: NodeData[] = [];
  const visited = new Set<string>();
  
  const traverse = (id: string) => {
    if (visited.has(id) || !nodes[id]) return;
    
    visited.add(id);
    result.push(nodes[id]);
    
    // Traverse children
    nodes[id].children.forEach(childId => {
      traverse(childId);
    });
  };
  
  traverse(nodeId);
  return result;
};
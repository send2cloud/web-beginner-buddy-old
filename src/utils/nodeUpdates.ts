
import { Node } from '../types';

export const updateMultipleNodes = (
  nodes: Record<string, Node>,
  updates: Record<string, Partial<Node>>,
  updateNodeFn: (nodeId: string, updates: Partial<Node>) => void
) => {
  Object.entries(updates).forEach(([nodeId, nodeUpdates]) => {
    updateNodeFn(nodeId, nodeUpdates);
  });
};

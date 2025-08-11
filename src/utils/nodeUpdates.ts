
import { NodeData } from '../types';

export const updateMultipleNodes = (
  updates: Record<string, Partial<NodeData>>,
  updateNodeFn: (nodeId: string, updates: Partial<NodeData>) => void
) => {
  Object.entries(updates).forEach(([nodeId, nodeUpdates]) => {
    updateNodeFn(nodeId, nodeUpdates);
  });
};

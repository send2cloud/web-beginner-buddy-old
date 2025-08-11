import React from 'react';
import { Plus, Trash2, Copy, Edit } from 'lucide-react';

interface ContextMenuV2Props {
  x: number;
  y: number;
  nodeId?: string;
  theme: 'light' | 'dark';
  onClose: () => void;
  onAddNode: (position: { x: number; y: number }) => void;
  onDeleteNode?: () => void;
}

export const ContextMenuV2: React.FC<ContextMenuV2Props> = ({
  x,
  y,
  nodeId,
  theme,
  onClose,
  onAddNode,
  onDeleteNode
}) => {
  const handleAddNode = () => {
    onAddNode({ x: x - 75, y: y - 30 });
    onClose();
  };

  const handleDeleteNode = () => {
    if (onDeleteNode) {
      onDeleteNode();
    }
    onClose();
  };

  return (
    <div
      className={`fixed z-50 ${
        theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
      } border border-gray-300 rounded-lg shadow-lg py-1 min-w-40`}
      style={{ left: x, top: y }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={handleAddNode}
        className={`w-full px-3 py-2 text-left hover:${
          theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
        } flex items-center gap-2`}
      >
        <Plus size={16} />
        Add Node
      </button>
      
      {nodeId && (
        <>
          <button
            onClick={() => onClose()}
            className={`w-full px-3 py-2 text-left hover:${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
            } flex items-center gap-2`}
          >
            <Edit size={16} />
            Edit
          </button>
          
          <button
            onClick={() => onClose()}
            className={`w-full px-3 py-2 text-left hover:${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
            } flex items-center gap-2`}
          >
            <Copy size={16} />
            Duplicate
          </button>
          
          <hr className={`my-1 ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`} />
          
          <button
            onClick={handleDeleteNode}
            className={`w-full px-3 py-2 text-left hover:bg-red-500 hover:text-white flex items-center gap-2 text-red-500`}
          >
            <Trash2 size={16} />
            Delete
          </button>
        </>
      )}
    </div>
  );
};
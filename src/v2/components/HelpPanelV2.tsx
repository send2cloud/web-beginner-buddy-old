import React from 'react';
import { X, Mouse, Keyboard, FileText } from 'lucide-react';

interface HelpPanelV2Props {
  theme: 'light' | 'dark';
  onClose: () => void;
}

export const HelpPanelV2: React.FC<HelpPanelV2Props> = ({ theme, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${
        theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
      } rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-96 overflow-y-auto`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-300 dark:border-gray-600">
          <h2 className="text-lg font-semibold">Help & Shortcuts</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          
          {/* Mouse controls */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Mouse size={16} />
              <h3 className="font-medium">Mouse Controls</h3>
            </div>
            <div className="text-sm space-y-1 ml-6">
              <div><strong>Left Click:</strong> Select node/canvas</div>
              <div><strong>Double Click:</strong> Edit node text</div>
              <div><strong>Right Click:</strong> Context menu</div>
              <div><strong>Drag:</strong> Move nodes or pan canvas</div>
              <div><strong>Scroll:</strong> Zoom in/out</div>
            </div>
          </div>

          {/* Keyboard shortcuts */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Keyboard size={16} />
              <h3 className="font-medium">Keyboard Shortcuts</h3>
            </div>
            <div className="text-sm space-y-1 ml-6">
              <div><strong>Tab:</strong> Add new node</div>
              <div><strong>Delete:</strong> Delete selected</div>
              <div><strong>Ctrl+G:</strong> Group selected</div>
              <div><strong>Ctrl+Shift+G:</strong> Ungroup</div>
              <div><strong>Ctrl+A:</strong> Select all</div>
              <div><strong>Ctrl+S:</strong> Save</div>
              <div><strong>Ctrl+E:</strong> Export</div>
              <div><strong>Ctrl+R:</strong> Reset canvas</div>
              <div><strong>F1:</strong> Toggle help</div>
            </div>
          </div>

          {/* File operations */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText size={16} />
              <h3 className="font-medium">File Operations</h3>
            </div>
            <div className="text-sm space-y-1 ml-6">
              <div><strong>Drag & Drop:</strong> Add files to canvas</div>
              <div><strong>Export:</strong> Save as JSON file</div>
              <div><strong>Import:</strong> Load JSON file</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
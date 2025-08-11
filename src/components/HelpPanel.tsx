import React from 'react';
import { HelpCircle, X } from 'lucide-react';

interface HelpPanelProps {
  theme: 'light' | 'dark';
  isOpen: boolean;
  onToggle: () => void;
}

export const HelpPanel: React.FC<HelpPanelProps> = ({ theme, isOpen, onToggle }) => {

  const shortcuts = [
    { key: 'Double-click', action: 'Create new node' },
    { key: 'Ctrl/Cmd + V', action: 'Paste clipboard as node' },
    { key: 'Tab', action: 'Add child node to active node' },
    { key: 'Shift + Enter', action: 'Add sibling node to active node' },
    { key: 'Delete/Backspace', action: 'Delete selected nodes' },
    { key: 'G', action: 'Group selected nodes' },
    { key: 'C', action: 'Connect two selected nodes' },
    { key: 'Shift + Click', action: 'Multi-select nodes' },
    { key: 'Mouse wheel', action: 'Zoom in/out' },
    { key: 'Drag', action: 'Pan canvas or move nodes' },
    { key: '+ / =', action: 'Zoom in (towards selection if any)' },
    { key: '- / _', action: 'Zoom out (from selection if any)' },
    { key: '0', action: 'Reset zoom to 100%' },
    { key: '1', action: 'Fit all nodes to viewport' },
    { key: '2', action: 'Fit selected nodes and children' },
    { key: '?', action: 'Show/hide keyboard shortcuts' },
  ];

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className={`absolute bottom-4 right-4 z-10 p-3 rounded-full shadow-lg transition-colors ${
          theme === 'dark'
            ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            : 'bg-white text-gray-600 hover:bg-gray-50'
        }`}
        title="Show help"
      >
        <HelpCircle size={20} />
      </button>
    );
  }

  return (
    <div className={`absolute bottom-4 right-4 z-10 p-6 rounded-lg shadow-xl max-w-sm border ${
      theme === 'dark'
        ? 'bg-gray-800 border-gray-600 text-white'
        : 'bg-white border-gray-200 text-gray-800'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Keyboard Shortcuts</h3>
        <button
          onClick={onToggle}
          className={`p-1 rounded transition-colors ${
            theme === 'dark'
              ? 'text-gray-400 hover:text-white'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <X size={18} />
        </button>
      </div>
      
      <div className="space-y-2">
        {shortcuts.map((shortcut, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <span className={`font-mono px-2 py-1 rounded text-xs ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              {shortcut.key}
            </span>
            <span className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              {shortcut.action}
            </span>
          </div>
        ))}
      </div>
      
      <div className={`mt-4 pt-4 border-t text-xs ${
        theme === 'dark' 
          ? 'border-gray-600 text-gray-400'
          : 'border-gray-200 text-gray-500'
      }`}>
        Drag and drop files, images, or links onto the canvas to create nodes.
      </div>
    </div>
  );
};
import React, { useEffect, useRef } from 'react';
import { 
  Plus, 
  Copy, 
  Scissors, 
  Clipboard, 
  Trash2, 
  Link, 
  Users, 
  Edit3,
  MousePointer,
  Palette
} from 'lucide-react';

interface ContextMenuProps {
  position: { x: number; y: number };
  theme: 'light' | 'dark';
  onClose: () => void;
  context: {
    type: 'canvas' | 'node' | 'selection';
    nodeId?: string;
    selectedCount?: number;
    canConnect?: boolean;
    canGroup?: boolean;
  };
  actions: {
    onCreateNode?: () => void;
    onCreateChild?: () => void;
    onCreateSibling?: () => void;
    onEdit?: () => void;
    onCopy?: () => void;
    onCut?: () => void;
    onPaste?: () => void;
    onDelete?: () => void;
    onConnect?: () => void;
    onGroup?: () => void;
    onSelectAll?: () => void;
    onChangeColor?: () => void;
  };
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  position,
  theme,
  onClose,
  context,
  actions
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // Adjust position to keep menu on screen
  const adjustedPosition = React.useMemo(() => {
    const menuWidth = 200;
    const menuHeight = 300;
    const padding = 10;

    let x = position.x;
    let y = position.y;

    if (x + menuWidth > window.innerWidth - padding) {
      x = window.innerWidth - menuWidth - padding;
    }
    if (y + menuHeight > window.innerHeight - padding) {
      y = window.innerHeight - menuHeight - padding;
    }

    return { x: Math.max(padding, x), y: Math.max(padding, y) };
  }, [position]);

  const MenuItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    shortcut?: string;
    onClick?: () => void;
    disabled?: boolean;
    danger?: boolean;
  }> = ({ icon, label, shortcut, onClick, disabled, danger }) => (
    <button
      className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors ${
        disabled
          ? 'opacity-50 cursor-not-allowed'
          : `hover:${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} ${
              danger 
                ? theme === 'dark' ? 'text-red-400' : 'text-red-600'
                : theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
            }`
      }`}
      onClick={() => {
        if (!disabled && onClick) {
          onClick();
          onClose();
        }
      }}
      disabled={disabled}
    >
      <div className="flex items-center gap-2">
        {icon}
        <span>{label}</span>
      </div>
      {shortcut && (
        <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          {shortcut}
        </span>
      )}
    </button>
  );

  const Separator = () => (
    <div className={`h-px my-1 ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`} />
  );

  return (
    <div
      ref={menuRef}
      className={`fixed z-50 min-w-[200px] rounded-lg shadow-xl border backdrop-blur-sm ${
        theme === 'dark'
          ? 'bg-gray-800/95 border-gray-600'
          : 'bg-white/95 border-gray-200'
      }`}
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
      }}
    >
      <div className="py-1">
        {context.type === 'canvas' && (
          <>
            <MenuItem
              icon={<Plus size={16} />}
              label="Create Node"
              shortcut="Double-click"
              onClick={actions.onCreateNode}
            />
            <MenuItem
              icon={<Clipboard size={16} />}
              label="Paste"
              shortcut="⌘V"
              onClick={actions.onPaste}
            />
            <MenuItem
              icon={<MousePointer size={16} />}
              label="Select All"
              shortcut="⌘A"
              onClick={actions.onSelectAll}
            />
          </>
        )}

        {context.type === 'node' && (
          <>
            <MenuItem
              icon={<Edit3 size={16} />}
              label="Edit"
              shortcut="Double-click"
              onClick={actions.onEdit}
            />
            <MenuItem
              icon={<Plus size={16} />}
              label="Add Child"
              shortcut="Tab"
              onClick={actions.onCreateChild}
            />
            <MenuItem
              icon={<Plus size={16} />}
              label="Add Sibling"
              shortcut="⇧Enter"
              onClick={actions.onCreateSibling}
            />
            <Separator />
            <MenuItem
              icon={<Copy size={16} />}
              label="Copy"
              shortcut="⌘C"
              onClick={actions.onCopy}
            />
            <MenuItem
              icon={<Scissors size={16} />}
              label="Cut"
              shortcut="⌘X"
              onClick={actions.onCut}
            />
            <MenuItem
              icon={<Clipboard size={16} />}
              label="Paste"
              shortcut="⌘V"
              onClick={actions.onPaste}
            />
            <Separator />
            <MenuItem
              icon={<Palette size={16} />}
              label="Change Color"
              onClick={actions.onChangeColor}
            />
            <Separator />
            <MenuItem
              icon={<Trash2 size={16} />}
              label="Delete"
              shortcut="Del"
              onClick={actions.onDelete}
              danger
            />
          </>
        )}

        {context.type === 'selection' && context.selectedCount && context.selectedCount > 1 && (
          <>
            <MenuItem
              icon={<Copy size={16} />}
              label={`Copy ${context.selectedCount} nodes`}
              shortcut="⌘C"
              onClick={actions.onCopy}
            />
            <MenuItem
              icon={<Scissors size={16} />}
              label={`Cut ${context.selectedCount} nodes`}
              shortcut="⌘X"
              onClick={actions.onCut}
            />
            <Separator />
            {context.canConnect && (
              <MenuItem
                icon={<Link size={16} />}
                label="Connect Nodes"
                shortcut="C"
                onClick={actions.onConnect}
              />
            )}
            {context.canGroup && (
              <MenuItem
                icon={<Users size={16} />}
                label="Group Nodes"
                shortcut="G"
                onClick={actions.onGroup}
              />
            )}
            <MenuItem
              icon={<Palette size={16} />}
              label="Change Colors"
              onClick={actions.onChangeColor}
            />
            <Separator />
            <MenuItem
              icon={<Trash2 size={16} />}
              label={`Delete ${context.selectedCount} nodes`}
              shortcut="Del"
              onClick={actions.onDelete}
              danger
            />
          </>
        )}
      </div>
    </div>
  );
};
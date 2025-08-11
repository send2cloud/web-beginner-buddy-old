import { useEffect } from 'react';

interface KeyboardShortcutsV2Props {
  onAddNode: (position: { x: number; y: number }) => void;
  onDeleteSelected: () => void;
  onGroupSelected: () => void;
  onUngroupSelected: () => void;
  onSelectAll: () => void;
  onToggleHelp: () => void;
  onSave: () => void;
  onExport: () => void;
  onReset: () => void;
  onUndo: () => void;
  onRedo: () => void;
}

export const useKeyboardShortcutsV2 = ({
  onAddNode,
  onDeleteSelected,
  onGroupSelected,
  onUngroupSelected,
  onSelectAll,
  onToggleHelp,
  onSave,
  onExport,
  onReset,
  onUndo,
  onRedo
}: KeyboardShortcutsV2Props) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const isCtrl = e.ctrlKey || e.metaKey;

      switch (e.key) {
        case 'Tab':
          e.preventDefault();
          onAddNode({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
          break;
        
        case 'Delete':
        case 'Backspace':
          e.preventDefault();
          onDeleteSelected();
          break;
        
        case 'F1':
          e.preventDefault();
          onToggleHelp();
          break;
        
        case 'g':
          if (isCtrl) {
            e.preventDefault();
            if (e.shiftKey) {
              onUngroupSelected();
            } else {
              onGroupSelected();
            }
          }
          break;
        
        case 'a':
          if (isCtrl) {
            e.preventDefault();
            onSelectAll();
          }
          break;
        
        case 's':
          if (isCtrl) {
            e.preventDefault();
            onSave();
          }
          break;
        
        case 'e':
          if (isCtrl) {
            e.preventDefault();
            onExport();
          }
          break;
        
        case 'r':
          if (isCtrl) {
            e.preventDefault();
            onReset();
          }
          break;
        
        case 'z':
          if (isCtrl) {
            e.preventDefault();
            if (e.shiftKey) {
              onRedo();
            } else {
              onUndo();
            }
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [
    onAddNode,
    onDeleteSelected,
    onGroupSelected,
    onUngroupSelected,
    onSelectAll,
    onToggleHelp,
    onSave,
    onExport,
    onReset,
    onUndo,
    onRedo
  ]);
};
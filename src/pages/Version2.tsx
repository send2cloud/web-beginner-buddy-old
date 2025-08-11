import React from 'react';
import { CanvasV2 } from '../v2/components/CanvasV2';
import { AuthV2 } from '../v2/components/AuthV2';
import { UnifiedToolbarV2 } from '../v2/components/UnifiedToolbarV2';
import { HelpPanelV2 } from '../v2/components/HelpPanelV2';
import { useMindMapManagerV2 } from '../v2/hooks/useMindMapManagerV2';
import { useKeyboardShortcutsV2 } from '../v2/hooks/useKeyboardShortcutsV2';

export default function Version2() {
  const mindMapManager = useMindMapManagerV2();
  const [theme, setTheme] = React.useState<'light' | 'dark'>('dark');
  const [showHelp, setShowHelp] = React.useState(false);

  // Theme toggle
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Apply theme to document
  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Keyboard shortcuts
  useKeyboardShortcutsV2({
    onAddNode: mindMapManager.addNode,
    onDeleteSelected: mindMapManager.deleteSelectedNodes,
    onGroupSelected: mindMapManager.groupSelectedNodes,
    onUngroupSelected: mindMapManager.ungroupSelectedNodes,
    onSelectAll: mindMapManager.selectAllNodes,
    onToggleHelp: () => setShowHelp(!showHelp),
    onSave: mindMapManager.saveToLocalStorage,
    onExport: mindMapManager.exportMindMap,
    onReset: mindMapManager.resetCanvas,
    onUndo: mindMapManager.undo,
    onRedo: mindMapManager.redo
  });

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <AuthV2>
        <CanvasV2
          theme={theme}
          {...mindMapManager}
        />
        
        <UnifiedToolbarV2
          theme={theme}
          scale={mindMapManager.scale}
          onThemeToggle={toggleTheme}
          onExport={mindMapManager.exportMindMap}
          onImport={mindMapManager.importMindMap}
          onReset={mindMapManager.resetCanvas}
          onZoomIn={mindMapManager.zoomIn}
          onZoomOut={mindMapManager.zoomOut}
          onSave={mindMapManager.saveToLocalStorage}
          onGlobalColorChange={mindMapManager.changeGlobalColor}
          onGlobalTextFormat={mindMapManager.changeGlobalTextFormat}
          onGlobalFontSizeChange={mindMapManager.changeGlobalFontSize}
          onGlobalShapeChange={mindMapManager.changeGlobalShape}
        />

        {showHelp && (
          <HelpPanelV2
            theme={theme}
            onClose={() => setShowHelp(false)}
          />
        )}
      </AuthV2>
    </div>
  );
}
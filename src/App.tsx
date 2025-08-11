
import React from 'react';
import { Toaster } from 'react-hot-toast';
import { useMindMapManager } from './hooks/useMindMapManager';
import { Canvas } from './components/Canvas';
import Node from './components/Node';
import Group from './components/Group';
import { GroupToolbar } from './components/GroupToolbar';
import { UnifiedToolbar } from './components/UnifiedToolbar';
import { HelpPanel } from './components/HelpPanel';
import { MiniToolbar } from './components/MiniToolbar';
import { ContextMenu } from './components/ContextMenu';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

const MindMapApp: React.FC<{ mindMapManager: ReturnType<typeof useMindMapManager> }> = ({ mindMapManager }) => {
  const {
    state,
    connectionStyle,
    selectedNodeIds,
    getMiniToolbarPosition,
    updateNode,
    createNode,
    createChildNode,
    createSiblingNode,
    selectNode,
    deleteSelectedNodes,
    groupSelectedNodes,
    connectSelectedNodes,
    handleNodeDragStart,
    handleNodeDragMove,
    handleNodeDragEnd,
    handleFilesDrop,
    handleTextDrop,
    handleCanvasDoubleClick,
    handleCanvasClick,
    handleCanvasChange,
    handleThemeToggle,
    handleExport,
    handleImport,
    handleReset,
    handleZoomIn,
    handleZoomOut,
    handleSave,
    handleColorChange,
    handleTextFormat,
    handleGlobalColorChange,
    handleGlobalTextFormat,
    handleFontSizeChange,
    handleGlobalFontSizeChange,
    handleGlobalShapeChange,
    handleShapeChange,
    selectedGroupId,
    handleGroupUpdate,
    handleGroupSelect,
    handleGroupColorChange,
    handleGroupBorderChange,
    handleUngroup,
    handleContextMenu,
    handleCloseContextMenu,
    handleZoomTo100Percent,
    handleFitAllToViewport,
    handleFitSelectedToViewport,
    handleToggleHelpPanel,
    contextMenuActions,
    showHelpPanel,
    handleSmartZoom,
  } = mindMapManager;

  // Add keyboard shortcuts
  useKeyboardShortcuts({
    nodes: state.nodes,
    activeNodeId: state.activeNodeId,
    canvas: state.canvas,
    onCreateChildNode: createChildNode,
    onCreateSiblingNode: createSiblingNode,
    onDeleteSelectedNodes: deleteSelectedNodes,
    onGroupSelectedNodes: groupSelectedNodes,
    onConnectSelectedNodes: connectSelectedNodes,
    onCreateNode: createNode,
    onZoomTo100Percent: handleZoomTo100Percent,
    onFitAllToViewport: handleFitAllToViewport,
    onFitSelectedToViewport: handleFitSelectedToViewport,
    onToggleHelpPanel: handleToggleHelpPanel,
    onZoomIn: handleZoomIn,
    onZoomOut: handleZoomOut,
    onSmartZoom: handleSmartZoom,
  });

  return (
    <>
      <Canvas
        canvas={state.canvas}
        nodes={state.nodes}
        theme={state.theme}
        defaultConnectionStyle={connectionStyle}
        onCanvasChange={handleCanvasChange}
        onDoubleClick={handleCanvasDoubleClick}
        onCanvasClick={handleCanvasClick}
        onContextMenu={handleContextMenu}
        onDrop={(e, position) => {
          e.preventDefault();
          if (e.dataTransfer.files.length > 0) {
            // Handle file drops
            handleFilesDrop(e.dataTransfer.files, position);
          } else {
            // Handle text/URL drops
            const urlData = e.dataTransfer.getData('text/uri-list');
            const textData = e.dataTransfer.getData('text/plain');
            
            if (urlData) {
              handleTextDrop(urlData, position);
            } else if (textData) {
              handleTextDrop(textData, position);
            }
          }
        }}
      >
        {/* Render groups first (behind nodes) */}
        {Object.values(state.groups).map(group => (
          <Group 
            key={group.id} 
            group={group} 
            theme={state.theme}
            nodes={state.nodes}
            onGroupUpdate={handleGroupUpdate}
            onNodesUpdate={(nodeUpdates) => {
              // Fix: Use proper state update pattern
              mindMapManager.updateMultipleNodes(nodeUpdates);
            }}
            onGroupSelect={handleGroupSelect}
            isSelected={selectedGroupId === group.id}
          />
        ))}

        {/* Render nodes */}
        {Object.values(state.nodes).map(node => (
          <Node
            key={node.id}
            node={node}
            theme={state.theme}
            isActive={state.activeNodeId === node.id}
            onUpdate={updateNode}
            onSelect={selectNode}
            onDragStart={handleNodeDragStart}
            onDragMove={handleNodeDragMove}
            onDragEnd={handleNodeDragEnd}
            onContextMenu={handleContextMenu}
            onCreateChild={createChildNode}
          />
        ))}
      </Canvas>

      {/* Mini Toolbar for Selected Nodes */}
      {selectedNodeIds.length > 0 && getMiniToolbarPosition() && (
        <MiniToolbar
          selectedCount={selectedNodeIds.length}
          position={getMiniToolbarPosition()!}
          theme={state.theme}
          selectedNodes={selectedNodeIds}
          nodes={state.nodes}
          onColorChange={handleColorChange}
          onTextFormat={handleTextFormat}
          onFontSizeChange={handleFontSizeChange}
          onShapeChange={handleShapeChange}
          onConnectionStyleChange={mindMapManager.handleConnectionStyleChange}
          getConnectionStyle={mindMapManager.getConnectionStyle}
          onDelete={deleteSelectedNodes}
          onConnect={selectedNodeIds.length === 2 ? connectSelectedNodes : undefined}
          onGroup={selectedNodeIds.length >= 2 ? groupSelectedNodes : undefined}
        />
      )}

      {/* Group Toolbar for Selected Group */}
      {selectedGroupId && state.groups[selectedGroupId] && (
        <GroupToolbar
          position={{
            x: state.groups[selectedGroupId].bounds.x + state.groups[selectedGroupId].bounds.width / 2,
            y: state.groups[selectedGroupId].bounds.y + state.groups[selectedGroupId].bounds.height / 2
          }}
          theme={state.theme}
          onColorChange={handleGroupColorChange}
          onBorderChange={handleGroupBorderChange}
          onUngroup={handleUngroup}
        />
      )}

      {/* Global Toolbar */}
      <UnifiedToolbar
        theme={state.theme}
        scale={state.canvas.scale}
        onThemeToggle={handleThemeToggle}
        onExport={handleExport}
        onImport={handleImport}
        onReset={handleReset}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onSave={handleSave}
        onGlobalColorChange={handleGlobalColorChange}
        onGlobalTextFormat={handleGlobalTextFormat}
        onGlobalFontSizeChange={handleGlobalFontSizeChange}
        onGlobalShapeChange={handleGlobalShapeChange}
      />

      <HelpPanel 
        theme={state.theme} 
        isOpen={showHelpPanel}
        onToggle={handleToggleHelpPanel}
      />

      {/* Context Menu */}
      {state.contextMenu && (
        <ContextMenu
          position={state.contextMenu.position}
          theme={state.theme}
          onClose={handleCloseContextMenu}
          context={{
            ...state.contextMenu.context,
            canConnect: state.contextMenu.context.selectedCount === 2,
            canGroup: (state.contextMenu.context.selectedCount || 0) >= 2
          }}
          actions={contextMenuActions}
        />
      )}
    </>
  );
};

function App() {
  const mindMapManager = useMindMapManager();

  return (
    <div className={`w-screen h-screen overflow-hidden transition-colors duration-300 ${
      mindMapManager.state.theme === 'dark' ? 'dark' : ''
    }`}>
      <Toaster
        position="bottom-center"
        toastOptions={{
          duration: 2000,
          style: {
            background: mindMapManager.state.theme === 'dark' ? '#374151' : '#ffffff',
            color: mindMapManager.state.theme === 'dark' ? '#ffffff' : '#000000',
            border: `1px solid ${mindMapManager.state.theme === 'dark' ? '#4B5563' : '#E5E7EB'}`,
            borderRadius: '8px',
            fontSize: '14px',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#ffffff',
            },
          },
        }}
      />
      
      <MindMapApp mindMapManager={mindMapManager} />
    </div>
  );
}

export default App;

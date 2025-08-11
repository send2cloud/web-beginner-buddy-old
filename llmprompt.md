# LLM Prompt: Replicate Advanced Mind Map Application

## 🎯 Objective
Create a comprehensive mind mapping application with real-time collaboration, advanced node management, and intuitive user experience. This prompt will guide you through replicating all features and architecture.

## 🏗️ Core Architecture Requirements

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Database**: InstantDB for real-time collaboration
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

### Project Structure
```
src/
├── components/          # All React components
├── hooks/              # Custom React hooks
├── types/              # TypeScript definitions
├── utils/              # Utility functions
├── lib/                # External configurations
└── App.tsx             # Main application
```

## 🎨 UI/UX Requirements

### Canvas System
Create an infinite, zoomable canvas with:
- **Grid Background**: Dot grid that scales with zoom level
- **Smooth Pan/Zoom**: Mouse wheel zoom, drag to pan
- **Coordinate System**: Screen-to-canvas coordinate transformation
- **Zoom Limits**: 0.1x to 3x zoom range

### Node System
Implement interactive nodes with:
- **Visual Design**: Rounded rectangles with shadows and borders
- **Editing**: Double-click to edit, inline text input
- **Selection**: Single/multi-select with Shift+click
- **Dragging**: Smooth drag with visual feedback
- **Styling**: Customizable colors, shapes, text formatting

### Connection System
Create visual connections between nodes:
- **Bezier Curves**: Smooth S-curves between parent-child nodes
- **Arrow Options**: Optional start/end arrows
- **Line Styles**: Solid or dashed lines
- **Dynamic Rendering**: HTML5 Canvas for performance

## 🔧 Feature Implementation Guide

### 1. Canvas Component
```typescript
interface CanvasProps {
  canvas: CanvasState;
  nodes: Record<string, NodeData>;
  theme: 'light' | 'dark';
  onCanvasChange: (canvas: CanvasState) => void;
  onDoubleClick: (position: Point) => void;
  // ... other props
}
```

**Key Features:**
- Infinite scrolling with offset tracking
- Zoom with mouse wheel (zoom towards cursor)
- Grid rendering that adapts to zoom level
- Connection rendering with bezier curves
- Event handling for pan, zoom, double-click

### 2. Node Component
```typescript
interface NodeData {
  id: string;
  type: 'text' | 'image' | 'link';
  content: string;
  position: Point;
  size: { width: number; height: number };
  parentId?: string;
  children: string[];
  selected: boolean;
  editing: boolean;
  style: NodeStyle;
}
```

**Key Features:**
- Inline editing with Enter/Escape handling
- Drag and drop with multi-node support
- Visual selection indicators
- Context menu on right-click
- Style customization (colors, shapes, text formatting)

### 3. Hierarchical Relationships
Implement parent-child node relationships:
- **Child Creation**: Tab key creates child node
- **Sibling Creation**: Shift+Enter creates sibling
- **Visual Inheritance**: Child nodes inherit parent colors (with opacity)
- **Connection Drawing**: Automatic connections between parent-child
- **Subtree Operations**: Move/delete affects entire subtrees

### 4. Real-time Collaboration
Set up InstantDB integration:
```typescript
// lib/db.ts
import { init } from '@instantdb/react';
import schema from '../instant.schema';

const db = init({ 
  appId: 'your-app-id', 
  schema 
});
```

**Schema Design:**
- Users table for authentication
- Files table for mind map data
- Folders table for organization
- Real-time permissions and security

### 5. Keyboard Shortcuts System
Implement comprehensive shortcuts:
```typescript
const shortcuts = {
  'Tab': 'Create child node',
  'Shift+Enter': 'Create sibling node',
  'Delete': 'Delete selected nodes',
  'G': 'Group selected nodes',
  'C': 'Connect two selected nodes',
  '=': 'Smart zoom in',
  '-': 'Smart zoom out',
  '0': 'Reset zoom to 100%',
  '1': 'Fit all nodes to viewport',
  '2': 'Fit selected nodes to viewport',
  'Ctrl+V': 'Paste clipboard as node'
};
```

### 6. Advanced Features

#### Grouping System
- Visual group containers around selected nodes
- Group drag moves all contained nodes
- Group styling and management toolbar

#### Smart Zoom
- Zoom towards selected nodes when available
- Fallback to cursor-based zoom
- Smooth viewport transitions

#### File Integration
- Drag & drop files onto canvas
- Image nodes for dropped images
- File nodes for other file types

#### Export/Import
- JSON export of entire mind map
- Import with validation and error handling
- Local storage backup

## 🎨 Visual Design Guidelines

### Color System
```typescript
const COLORS = [
  { name: 'White/Gray', light: '#ffffff', dark: '#374151' },
  { name: 'Blue', light: '#3B82F6', dark: '#1E40AF' },
  { name: 'Green', light: '#10B981', dark: '#047857' },
  // ... more colors
];
```

### Theme Support
- Light/dark mode toggle
- Consistent color schemes
- Theme-aware component styling
- Smooth theme transitions

### Responsive Design
- Mobile-first approach
- Touch gesture support
- Adaptive UI components
- Viewport-aware positioning

## 🔄 State Management Pattern

### App State Structure
```typescript
interface AppState {
  nodes: Record<string, NodeData>;
  groups: Record<string, GroupData>;
  canvas: CanvasState;
  activeNodeId: string | null;
  theme: 'light' | 'dark';
  contextMenu: ContextMenuState | null;
}
```

### State Update Patterns
- Immutable updates with spread operators
- Batch updates for performance
- Optimistic updates with rollback
- Real-time sync with InstantDB

## 🎯 User Experience Priorities

### Intuitive Interactions
1. **Double-click empty space** → Create new node
2. **Double-click node** → Edit node text
3. **Drag node** → Move node (with multi-select support)
4. **Right-click** → Context menu with relevant actions
5. **Keyboard shortcuts** → Power user efficiency

### Visual Feedback
- Hover states on interactive elements
- Selection indicators with themed colors
- Smooth animations and transitions
- Loading states and error handling
- Toast notifications for actions

### Performance Considerations
- Efficient canvas rendering
- Debounced database updates
- Virtual scrolling for large datasets
- Memory leak prevention
- Smooth 60fps interactions

## 🔧 Implementation Steps

### Phase 1: Core Foundation
1. Set up React + TypeScript + Vite project
2. Implement basic canvas with pan/zoom
3. Create node component with editing
4. Add basic drag and drop

### Phase 2: Advanced Features
1. Implement node connections
2. Add hierarchical relationships
3. Create keyboard shortcuts system
4. Implement multi-selection

### Phase 3: Collaboration
1. Set up InstantDB integration
2. Add authentication system
3. Implement real-time sync
4. Add user management

### Phase 4: Polish
1. Add theming system
2. Implement export/import
3. Create comprehensive toolbars
4. Add help system and documentation

## 🚨 Critical Implementation Notes

### Canvas Coordinate System
Always maintain separation between screen coordinates and canvas coordinates:
```typescript
const canvasPos = screenToCanvas(screenPos, canvas);
const screenPos = canvasToScreen(canvasPos, canvas);
```

### Event Handling
Prevent event bubbling for nested interactions:
```typescript
const handleNodeClick = (e: React.MouseEvent) => {
  e.stopPropagation(); // Prevent canvas click
  // Handle node-specific logic
};
```

### Performance Optimization
- Use `useCallback` for event handlers
- Implement `React.memo` for expensive components
- Debounce frequent updates (drag, zoom)
- Clean up event listeners in useEffect

### Real-time Sync
- Handle offline/online states
- Implement conflict resolution
- Provide visual feedback for sync status
- Graceful error handling

## 🎨 Styling Guidelines

### Tailwind CSS Patterns
```typescript
// Theme-aware styling
className={`${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}

// Interactive states
className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"

// Responsive design
className="w-full md:w-auto lg:max-w-sm"
```

### Component Composition
- Keep components focused and reusable
- Use compound component patterns
- Implement proper prop interfaces
- Follow React best practices

## 🔍 Testing Strategy

### Unit Tests
- Utility functions (geometry, canvas math)
- Component rendering and interactions
- State management logic
- Keyboard shortcut handling

### Integration Tests
- Canvas interactions
- Node creation and editing
- Real-time collaboration
- Export/import functionality

### User Experience Tests
- Accessibility compliance
- Performance benchmarks
- Cross-browser compatibility
- Mobile responsiveness

## 📚 Additional Resources

### Key Dependencies
```json
{
  "@instantdb/react": "^0.20.21",
  "lucide-react": "^0.344.0",
  "react-hot-toast": "^2.5.2",
  "tailwindcss": "^3.4.1"
}
```

### Useful Utilities
- UUID generation for node IDs
- Debounce functions for performance
- Local storage helpers
- Geometric calculation utilities

This prompt provides a comprehensive guide to replicate the advanced mind map application. Follow the implementation phases, maintain the architectural patterns, and prioritize user experience throughout development.
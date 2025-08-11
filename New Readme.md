# Advanced Mind Map Application

A modern, collaborative mind mapping application built with React, TypeScript, and InstantDB. Create, organize, and visualize your ideas with real-time collaboration and advanced features.

![Mind Map Demo](https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=400&fit=crop)

## ✨ Features

### Core Functionality
- **Interactive Canvas** - Infinite zoomable canvas with smooth panning and grid
- **Node Management** - Create, edit, delete, and organize nodes with drag & drop
- **Smart Connections** - Connect nodes with beautiful bezier curves and arrows
- **Hierarchical Structure** - Parent-child relationships with visual inheritance
- **Multi-Selection** - Select multiple nodes for batch operations

### Advanced Features
- **Real-time Collaboration** - Powered by InstantDB for live updates
- **File Integration** - Drag & drop images, files, and links onto canvas
- **Grouping System** - Group related nodes with visual containers
- **Theming** - Light/dark mode with automatic color inheritance
- **Export/Import** - JSON export/import for data portability
- **Keyboard Shortcuts** - Comprehensive shortcuts for power users

### Visual Customization
- **Node Styling** - Custom colors, shapes (rectangle, rounded, pill)
- **Text Formatting** - Bold, italic, underline, strikethrough, font sizes
- **Connection Styles** - Solid/dashed lines with optional arrows
- **Responsive Design** - Works seamlessly on desktop and mobile

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd mind-map-app

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Setup

Create a `.env` file with your InstantDB credentials:

```env
VITE_INSTANT_APP_ID=your-instant-app-id
```

## 🎯 Usage

### Basic Operations
- **Double-click** empty canvas to create a node
- **Double-click** node to edit text
- **Drag** nodes to move them
- **Shift+click** for multi-selection
- **Right-click** for context menus

### Keyboard Shortcuts
- `Tab` - Add child node to active node
- `Shift+Enter` - Add sibling node
- `Delete/Backspace` - Delete selected nodes
- `G` - Group selected nodes
- `C` - Connect two selected nodes
- `Ctrl/Cmd+V` - Paste clipboard as node
- `=` / `-` - Smart zoom in/out (towards selection if any)
- `0` - Reset zoom to 100%
- `1` - Fit all nodes to viewport
- `2` - Fit selected nodes to viewport
- `?` - Show/hide help panel

### File Operations
- Drag & drop images to create image nodes
- Drag & drop files to create file nodes
- Export mind map as JSON
- Import existing JSON mind maps

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: InstantDB (real-time database)
- **Build Tool**: Vite
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

### Project Structure
```
src/
├── components/          # React components
│   ├── Canvas.tsx      # Main canvas component
│   ├── Node.tsx        # Individual node component
│   ├── Auth.tsx        # Authentication
│   └── ...
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── lib/                # External library configurations
└── App.tsx             # Main application component
```

### Data Flow
1. **State Management** - React useState for local state
2. **Real-time Sync** - InstantDB handles data persistence and collaboration
3. **Canvas Rendering** - HTML5 Canvas for connections, DOM for nodes
4. **Event Handling** - Custom event system for drag & drop operations

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style
- TypeScript strict mode enabled
- ESLint with React hooks rules
- Tailwind CSS for styling
- Functional components with hooks

## 🗺️ Roadmap

See [ROADMAP.md](./ROADMAP.md) for detailed development plans.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [InstantDB](https://instantdb.com) for real-time database
- [Lucide](https://lucide.dev) for beautiful icons
- [Tailwind CSS](https://tailwindcss.com) for styling
- [React](https://reactjs.org) for the UI framework
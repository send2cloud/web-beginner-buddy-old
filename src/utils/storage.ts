import { AppState } from '../types';

const DEFAULT_NODE_STYLE = {
  backgroundColor: '#374151', // Default to dark mode colors
  borderColor: '#6B7280',
  shape: 'rounded' as const,
  borderRadius: 12,
  textStyle: {
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    fontSize: 14,
  },
};

const ensureNodeStyle = (node: any) => {
  return {
    ...node,
    style: {
      ...DEFAULT_NODE_STYLE,
      ...node.style,
      textStyle: {
        ...DEFAULT_NODE_STYLE.textStyle,
        ...node.style?.textStyle,
      },
    },
  };
};

const STORAGE_KEY = 'mindmap-app-state';

export const saveToStorage = (state: AppState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save to storage:', error);
  }
};

export const loadFromStorage = (): AppState | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    const state = JSON.parse(stored);
    if (state.nodes) {
      state.nodes = Object.fromEntries(
        Object.entries(state.nodes).map(([id, node]) => [id, ensureNodeStyle(node)])
      );
    }
    return state;
  } catch (error) {
    console.error('Failed to load from storage:', error);
    return null;
  }
};

export const exportToJSON = (state: AppState): string => {
  return JSON.stringify(state, null, 2);
};

export const importFromJSON = (json: string): AppState => {
  const state = JSON.parse(json);
  if (state.nodes) {
    state.nodes = Object.fromEntries(
      Object.entries(state.nodes).map(([id, node]) => [id, ensureNodeStyle(node)])
    );
  }
  return state;
};

export const downloadJSON = (state: AppState, filename = 'mindmap.json'): void => {
  const blob = new Blob([exportToJSON(state)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
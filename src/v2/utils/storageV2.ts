import { NodeData, ConnectionData, GroupData } from '../types';

interface SaveData {
  nodes: Record<string, NodeData>;
  connections: Record<string, ConnectionData>;
  groups: Record<string, GroupData>;
}

const STORAGE_KEY = 'mindmap-v2-data';

export const storageV2 = {
  save: (data: SaveData): void => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  },

  load: (): SaveData | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
    }
    return null;
  },

  clear: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }
};
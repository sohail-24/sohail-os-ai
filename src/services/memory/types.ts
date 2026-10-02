import { MemoryItem, MemoryStats } from '../../types';

export interface IMemoryService {
  getStats(): Promise<MemoryStats>;
  getItems(category?: string): Promise<MemoryItem[]>;
  store(item: Omit<MemoryItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<MemoryItem>;
  search(query: string, limit?: number): Promise<MemoryItem[]>;
  clearCategory(category: string): Promise<void>;
}

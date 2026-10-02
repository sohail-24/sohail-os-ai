export interface MemoryItem {
  id: string;
  category: 'user_profile' | 'preferences' | 'system_context' | 'project' | 'session_summary';
  key: string;
  value: string;
  createdAt: number;
  updatedAt: number;
  source?: string;
}

export interface MemoryStats {
  totalItems: number;
  vectorStoreStatus: 'uninitialized' | 'indexing' | 'ready';
  lastCompactedAt?: number;
  storageSizeBytes: number;
}

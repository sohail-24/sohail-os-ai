import { IMemoryService } from './types';
import { MemoryItem, MemoryStats } from '../../types';

/**
 * Placeholder Local Memory Service.
 * In future phases, this will interface with a local SQLite/DuckDB/vector store for RAG and personal context.
 */
export class MemoryServicePlaceholder implements IMemoryService {
  public async getStats(): Promise<MemoryStats> {
    return {
      totalItems: 4,
      vectorStoreStatus: 'uninitialized',
      storageSizeBytes: 1420,
    };
  }

  public async getItems(_category?: string): Promise<MemoryItem[]> {
    return [
      {
        id: 'mem_1',
        category: 'user_profile',
        key: 'preferred_editor',
        value: 'VS Code / Cursor',
        createdAt: Date.now() - 86400000,
        updatedAt: Date.now() - 86400000,
      },
      {
        id: 'mem_2',
        category: 'preferences',
        key: 'ai_inference_mode',
        value: 'Local First (Ollama)',
        createdAt: Date.now() - 72000000,
        updatedAt: Date.now() - 72000000,
      },
      {
        id: 'mem_3',
        category: 'system_context',
        key: 'target_os',
        value: 'macOS Apple Silicon (Darwin arm64)',
        createdAt: Date.now() - 50000000,
        updatedAt: Date.now() - 50000000,
      },
      {
        id: 'mem_4',
        category: 'project',
        key: 'primary_project',
        value: 'SOHAIL OS AI',
        createdAt: Date.now() - 36000000,
        updatedAt: Date.now() - 36000000,
      },
    ];
  }

  public async store(item: Omit<MemoryItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<MemoryItem> {
    return {
      id: `mem_${Date.now()}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      ...item,
    };
  }

  public async search(_query: string, _limit = 5): Promise<MemoryItem[]> {
    return [];
  }

  public async clearCategory(_category: string): Promise<void> {
    // Placeholder
  }
}

export const memoryService: IMemoryService = new MemoryServicePlaceholder();

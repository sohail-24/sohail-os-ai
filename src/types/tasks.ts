export type TaskStatus = 'queued' | 'running' | 'completed' | 'failed' | 'paused';

export interface TaskStep {
  id: string;
  description: string;
  status: TaskStatus;
  skillId?: string;
  result?: string;
}

export interface OrchestratedTask {
  id: string;
  title: string;
  prompt: string;
  status: TaskStatus;
  createdAt: number;
  completedAt?: number;
  steps: TaskStep[];
  autoExecute: boolean;
}

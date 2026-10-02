import { OrchestratedTask, TaskStatus } from '../../types';

export interface ITasksService {
  getTasks(status?: TaskStatus): Promise<OrchestratedTask[]>;
  createTask(title: string, prompt: string): Promise<OrchestratedTask>;
  cancelTask(id: string): Promise<boolean>;
  getTaskById(id: string): Promise<OrchestratedTask | undefined>;
}

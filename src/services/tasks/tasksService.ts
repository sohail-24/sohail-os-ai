import { ITasksService } from './types';
import { OrchestratedTask, TaskStatus } from '../../types';

/**
 * Placeholder Tasks Service.
 * In future phases, will manage multi-step local task decomposition, execution graphs,
 * and background agent orchestration for macOS automation.
 */
export class TasksServicePlaceholder implements ITasksService {
  private sampleTasks: OrchestratedTask[] = [
    {
      id: 'task_001',
      title: 'Organize ~/Downloads folder by month and extension',
      prompt: 'Clean up my Downloads directory, archive screenshots, and sort PDFs into Documents/Archive',
      status: 'queued',
      createdAt: Date.now() - 3600000,
      autoExecute: false,
      steps: [
        { id: 's1', description: 'Scan ~/Downloads directory structure', status: 'queued', skillId: 'filesystem' },
        { id: 's2', description: 'Group files by created month and file type', status: 'queued', skillId: 'filesystem' },
        { id: 's3', description: 'Move and organize with confirmation prompt', status: 'queued', skillId: 'mac_control' },
      ],
    },
    {
      id: 'task_002',
      title: 'Generate daily workspace brief from local calendar & reminders',
      prompt: 'Check upcoming events for today and format a prioritized markdown checklist',
      status: 'queued',
      createdAt: Date.now() - 7200000,
      autoExecute: false,
      steps: [
        { id: 's4', description: 'Query macOS EventKit for today’s schedule', status: 'queued', skillId: 'mac_control' },
        { id: 's5', description: 'Summarize tasks into priority checklist', status: 'queued', skillId: 'local_ai' },
      ],
    },
  ];

  public async getTasks(status?: TaskStatus): Promise<OrchestratedTask[]> {
    if (status) {
      return this.sampleTasks.filter((t) => t.status === status);
    }
    return [...this.sampleTasks];
  }

  public async createTask(title: string, prompt: string): Promise<OrchestratedTask> {
    const newTask: OrchestratedTask = {
      id: `task_${Date.now()}`,
      title,
      prompt,
      status: 'queued',
      createdAt: Date.now(),
      autoExecute: false,
      steps: [
        { id: `step_1`, description: 'Analyze intent and map to Mac skills', status: 'queued' },
        { id: `step_2`, description: 'Execute scheduled sub-actions', status: 'queued' },
      ],
    };
    this.sampleTasks.unshift(newTask);
    return newTask;
  }

  public async cancelTask(id: string): Promise<boolean> {
    const task = this.sampleTasks.find((t) => t.id === id);
    if (task) {
      task.status = 'failed';
      return true;
    }
    return false;
  }

  public async getTaskById(id: string): Promise<OrchestratedTask | undefined> {
    return this.sampleTasks.find((t) => t.id === id);
  }
}

export const tasksService: ITasksService = new TasksServicePlaceholder();

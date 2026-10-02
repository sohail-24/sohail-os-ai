import { ISkillsService } from './types';
import { MacSkill, SkillCategory } from '../../types';

/**
 * Placeholder Skills Service.
 * Defines native Mac capability interfaces for future local execution modules:
 * Accessibility, application automation, keyboard events, filesystem, and terminal.
 */
export class SkillsServicePlaceholder implements ISkillsService {
  private skills: MacSkill[] = [
    {
      id: 'skill_app_launch',
      name: 'Application Launcher & Focus',
      category: 'app_automation',
      description: 'Open, switch focus, and close native macOS applications via Workspace API',
      enabled: true,
      requiredPermissions: ['accessibility'],
      author: 'built-in',
    },
    {
      id: 'skill_fs_manager',
      name: 'Local Filesystem Operations',
      category: 'filesystem',
      description: 'List directories, search files, read documents, and safely move files locally',
      enabled: true,
      requiredPermissions: ['fullDiskAccess'],
      author: 'built-in',
    },
    {
      id: 'skill_window_arrange',
      name: 'Window Grid & Space Management',
      category: 'window_management',
      description: 'Snap windows, tile active applications, and manage multiple displays',
      enabled: false,
      requiredPermissions: ['accessibility'],
      author: 'built-in',
    },
    {
      id: 'skill_terminal_exec',
      name: 'Sandboxed Terminal Runner',
      category: 'terminal',
      description: 'Run authorized bash/zsh shell scripts with confirmation gates',
      enabled: false,
      requiredPermissions: ['terminal'],
      author: 'built-in',
    },
    {
      id: 'skill_system_control',
      name: 'macOS Volume & Display Controls',
      category: 'system_control',
      description: 'Adjust screen brightness, volume, Dark Mode, and Do Not Disturb',
      enabled: true,
      requiredPermissions: [],
      author: 'built-in',
    },
  ];

  public async getSkills(category?: SkillCategory): Promise<MacSkill[]> {
    if (category) {
      return this.skills.filter((s) => s.category === category);
    }
    return [...this.skills];
  }

  public async toggleSkill(id: string, enabled: boolean): Promise<boolean> {
    const skill = this.skills.find((s) => s.id === id);
    if (skill) {
      skill.enabled = enabled;
      return true;
    }
    return false;
  }

  public async getSkillById(id: string): Promise<MacSkill | undefined> {
    return this.skills.find((s) => s.id === id);
  }
}

export const skillsService: ISkillsService = new SkillsServicePlaceholder();

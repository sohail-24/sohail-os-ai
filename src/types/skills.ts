export type SkillCategory =
  | 'system_control'
  | 'app_automation'
  | 'filesystem'
  | 'terminal'
  | 'window_management'
  | 'productivity';

export interface MacSkill {
  id: string;
  name: string;
  category: SkillCategory;
  description: string;
  enabled: boolean;
  requiredPermissions: string[];
  parametersSchema?: Record<string, unknown>;
  author: 'built-in' | 'user';
}

import { MacSkill, SkillCategory } from '../../types';

export interface ISkillsService {
  getSkills(category?: SkillCategory): Promise<MacSkill[]>;
  toggleSkill(id: string, enabled: boolean): Promise<boolean>;
  getSkillById(id: string): Promise<MacSkill | undefined>;
}

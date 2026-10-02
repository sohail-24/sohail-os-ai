import { VoiceConfig, VoiceEngineState, VoiceEvent } from '../../types';

export interface IVoiceService {
  readonly state: VoiceEngineState;
  
  startListening(callback?: (event: VoiceEvent) => void): Promise<boolean>;
  stopListening(): Promise<void>;
  speak(text: string): Promise<void>;
  getConfig(): VoiceConfig;
  updateConfig(config: Partial<VoiceConfig>): void;
}

import { IVoiceService } from './types';
import { VoiceConfig, VoiceEngineState, VoiceEvent } from '../../types';

/**
 * Placeholder Voice Service.
 * Audio processing is intentionally not activated in this initial phase.
 */
export class VoiceServicePlaceholder implements IVoiceService {
  public state: VoiceEngineState = 'idle';

  private config: VoiceConfig = {
    inputEngine: 'local-whisper',
    outputEngine: 'system-say',
    hotwordEnabled: false,
    hotword: 'Hey Sohail',
  };

  public async startListening(_callback?: (event: VoiceEvent) => void): Promise<boolean> {
    // Intentionally no voice processing in initial version
    return false;
  }

  public async stopListening(): Promise<void> {
    this.state = 'idle';
  }

  public async speak(_text: string): Promise<void> {
    // Intentionally no voice synthesis in initial version
  }

  public getConfig(): VoiceConfig {
    return { ...this.config };
  }

  public updateConfig(config: Partial<VoiceConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

export const voiceService: IVoiceService = new VoiceServicePlaceholder();

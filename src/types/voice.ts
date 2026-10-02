export type VoiceEngineState = 'idle' | 'listening' | 'transcribing' | 'speaking' | 'disabled';

export interface VoiceConfig {
  inputEngine: 'local-whisper' | 'system-speech-recognition' | 'disabled';
  outputEngine: 'system-say' | 'local-piper' | 'disabled';
  voiceId?: string;
  hotwordEnabled: boolean;
  hotword: string;
}

export interface VoiceEvent {
  type: 'speech-start' | 'speech-end' | 'transcript-interim' | 'transcript-final' | 'error';
  transcript?: string;
  error?: string;
}

import { SystemStatusState } from '../types';

export const APP_CONFIG = {
  name: 'SOHAIL OS AI',
  tagline: 'Local-first personal AI assistant for macOS',
  version: '0.1.0-alpha',
  targetPlatform: 'macOS (Darwin arm64 / Apple Silicon)',
};

export const INITIAL_SYSTEM_STATUS: SystemStatusState = {
  aiEngine: {
    status: 'idle',
    provider: 'Local Engine (Ollama Ready)',
    model: 'Standby / Unconfigured',
    detail: 'Decoupled abstract AI service layer. Ready for local Ollama runner in next milestone.',
  },
  ollama: {
    status: 'offline',
    endpoint: 'http://localhost:11434',
    connected: false,
    detail: 'Port 11434 offline. Local inference service will be activated in the next step.',
  },
  macControl: {
    status: 'unconfigured',
    bridgeVersion: 'macOS Native Bridge v0.1',
    accessibilityGranted: false,
    detail: 'Bridge contract defined. Native accessibility and AppleScript execution dormant.',
  },
  voice: {
    status: 'idle',
    inputEngine: 'Local Whisper (Placeholder)',
    outputEngine: 'System Speech Synthesizer',
    detail: 'Microphone listener in standby. Audio processing disabled for initial release.',
  },
};

export const QUICK_PROMPTS = [
  {
    title: 'Organize Downloads folder',
    prompt: 'Scan ~/Downloads, group screenshots by date, and move PDFs into a dedicated subfolder.',
    category: 'Filesystem Automation',
  },
  {
    title: 'Review today’s calendar & notes',
    prompt: 'Check my upcoming events and local daily note, then summarize top 3 priorities.',
    category: 'Local Context',
  },
  {
    title: 'Inspect active macOS applications',
    prompt: 'List all running GUI applications and their memory footprint via system bridge.',
    category: 'System Control',
  },
  {
    title: 'Draft local workspace brief',
    prompt: 'Prepare a clean workspace summary for my active project tasks without sending data to the cloud.',
    category: 'Privacy First',
  },
];

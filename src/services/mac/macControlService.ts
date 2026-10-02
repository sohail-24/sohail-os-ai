import { IMacControlService } from './types';
import { MacAppInfo, MacPermissionStatus, MacSystemInfo, MacOSPermission } from '../../types';

export interface MacActionCommand {
  target: 'finder' | 'terminal' | 'window' | 'system' | 'application';
  action: string;
  payload?: Record<string, unknown>;
}

/**
 * Placeholder Mac Control Service.
 * This is an interface boundary for a future native macOS daemon / AppleScript / Accessibility API bridge.
 * DOES NOT execute any native code or command in this web client phase.
 */
export class MacControlServicePlaceholder implements IMacControlService {
  public readonly isBridgeConnected = false;

  public async checkPermissions(): Promise<MacPermissionStatus[]> {
    return [
      {
        permission: 'accessibility',
        granted: false,
        requiredFor: 'Simulating keystrokes, clicks, and reading UI element positions',
      },
      {
        permission: 'automation',
        granted: false,
        requiredFor: 'Controlling native macOS applications via Apple Events',
      },
      {
        permission: 'fullDiskAccess',
        granted: false,
        requiredFor: 'Reading user documents, ~/Downloads, and system logs',
      },
      {
        permission: 'terminal',
        granted: false,
        requiredFor: 'Executing local bash and zsh commands',
      },
      {
        permission: 'screenRecording',
        granted: false,
        requiredFor: 'Computer vision and desktop OCR',
      },
    ];
  }

  public async requestPermission(_permission: MacOSPermission): Promise<boolean> {
    // Intentionally no-op placeholder
    return false;
  }

  public async getSystemInfo(): Promise<MacSystemInfo> {
    return {
      osVersion: 'macOS Sonoma / Sequoia (Placeholder)',
      architecture: 'arm64',
      hostname: 'MacBook-Pro.local',
      uptimeSeconds: 0,
    };
  }

  public async getRunningApps(): Promise<MacAppInfo[]> {
    return [
      { bundleId: 'com.apple.finder', name: 'Finder', isRunning: true, isActive: false },
      { bundleId: 'com.apple.Safari', name: 'Safari', isRunning: true, isActive: true },
      { bundleId: 'com.apple.Terminal', name: 'Terminal', isRunning: false, isActive: false },
      { bundleId: 'com.apple.Notes', name: 'Notes', isRunning: false, isActive: false },
    ];
  }

  public async executeAction(_command: MacActionCommand): Promise<{ success: boolean; output?: string; error?: string }> {
    return {
      success: false,
      error: 'Mac native control bridge is in architectural placeholder mode. No native actions are executed.',
    };
  }
}

export const macControlService: IMacControlService = new MacControlServicePlaceholder();

import {
  MacAppInfo,
  MacPermissionStatus,
  MacSystemInfo,
  MacOSPermission,
  MacBridgeHealth,
  MacAccessibilityStatus,
} from '../../types';

export interface MacActionCommand {
  target: 'finder' | 'terminal' | 'window' | 'system' | 'application';
  action: string;
  payload?: Record<string, unknown>;
}

export interface IMacControlService {
  readonly isBridgeConnected: boolean;
  
  checkBridgeHealth(): Promise<MacBridgeHealth>;
  checkAccessibility(): Promise<MacAccessibilityStatus>;
  getRunningApps(): Promise<MacAppInfo[]>;
  getFrontmostApp(): Promise<MacAppInfo | null>;
  getSystemInfo(): Promise<MacSystemInfo>;
  checkPermissions(): Promise<MacPermissionStatus[]>;
  requestPermission(permission: MacOSPermission): Promise<boolean>;
  executeAction(command: MacActionCommand): Promise<{ success: boolean; output?: string; error?: string }>;
  getEndpoint?(): string;
  setEndpoint?(url: string): void;
}

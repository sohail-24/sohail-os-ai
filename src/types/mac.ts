export type MacOSPermission =
  | 'accessibility'
  | 'fullDiskAccess'
  | 'automation'
  | 'screenRecording'
  | 'terminal';

export interface MacPermissionStatus {
  permission: MacOSPermission;
  granted: boolean;
  requiredFor: string;
}

export interface MacSystemInfo {
  osVersion: string;
  architecture: 'arm64' | 'x86_64' | 'unknown';
  hostname: string;
  uptimeSeconds: number;
}

export interface MacAppInfo {
  bundleId: string;
  name: string;
  processId?: number;
  isRunning: boolean;
  isActive: boolean;
  isHidden?: boolean;
}

export interface MacBridgeHealth {
  status: 'ok' | 'unavailable' | 'error';
  bridge?: string;
  version?: string;
  isMacOS?: boolean;
  osVersion?: string;
  architecture?: string;
  accessibilityGranted?: boolean;
  runningAppsCount?: number;
  frontmostApp?: MacAppInfo | null;
  error?: string;
}

export interface MacAccessibilityStatus {
  granted: boolean;
  message: string;
  instruction?: string;
}

export interface MacActionResult {
  success: boolean;
  action: string;
  message?: string;
  data?: unknown;
}

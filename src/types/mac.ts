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
  isRunning: boolean;
  isActive: boolean;
}

export interface MacActionResult {
  success: boolean;
  action: string;
  message?: string;
  data?: unknown;
}

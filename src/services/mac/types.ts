import { MacActionCommand } from './macControlService';
import { MacAppInfo, MacPermissionStatus, MacSystemInfo, MacOSPermission } from '../../types';

export interface IMacControlService {
  readonly isBridgeConnected: boolean;
  
  checkPermissions(): Promise<MacPermissionStatus[]>;
  requestPermission(permission: MacOSPermission): Promise<boolean>;
  getSystemInfo(): Promise<MacSystemInfo>;
  getRunningApps(): Promise<MacAppInfo[]>;
  executeAction(command: MacActionCommand): Promise<{ success: boolean; output?: string; error?: string }>;
}

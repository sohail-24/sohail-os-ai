import { IMacControlService, MacActionCommand } from './types';
import {
  MacAppInfo,
  MacPermissionStatus,
  MacSystemInfo,
  MacOSPermission,
  MacBridgeHealth,
  MacAccessibilityStatus,
} from '../../types';

const STORAGE_KEY_BRIDGE_ENDPOINT = 'sohail_os_ai_mac_bridge_endpoint';
const DEFAULT_BRIDGE_ENDPOINT = 'http://localhost:11435';

/**
 * Real local macOS Bridge Service client.
 * Communicates with the native Swift bridge listening on localhost:11435.
 * The web application never directly invokes native APIs.
 * In this foundation milestone, the bridge is strictly READ-ONLY.
 */
export class MacControlService implements IMacControlService {
  private endpoint: string;
  private _isBridgeConnected = false;
  private lastHealth: MacBridgeHealth | null = null;

  constructor() {
    this.endpoint = this.loadStoredEndpoint();
  }

  private loadStoredEndpoint(): string {
    try {
      return localStorage.getItem(STORAGE_KEY_BRIDGE_ENDPOINT) || DEFAULT_BRIDGE_ENDPOINT;
    } catch {
      return DEFAULT_BRIDGE_ENDPOINT;
    }
  }

  public getEndpoint(): string {
    return this.endpoint;
  }

  public setEndpoint(url: string): void {
    const cleaned = url.trim().replace(/\/+$/, '');
    this.endpoint = cleaned || DEFAULT_BRIDGE_ENDPOINT;
    try {
      localStorage.setItem(STORAGE_KEY_BRIDGE_ENDPOINT, this.endpoint);
    } catch {
      // Ignore
    }
  }

  public get isBridgeConnected(): boolean {
    return this._isBridgeConnected;
  }

  /**
   * Pings the native macOS bridge health endpoint.
   * Tests GET /api/health
   */
  public async checkBridgeHealth(): Promise<MacBridgeHealth> {
    const url = `${this.endpoint.replace(/\/+$/, '')}/api/health`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const res = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        this._isBridgeConnected = true;
        this.lastHealth = {
          status: 'ok',
          bridge: data.bridge || 'SOHAIL OS AI macOS Bridge',
          version: data.version || '0.1.0',
          isMacOS: data.isMacOS ?? true,
          osVersion: data.osVersion,
          architecture: data.architecture,
          accessibilityGranted: data.accessibilityGranted ?? false,
          runningAppsCount: data.runningAppsCount,
          frontmostApp: data.frontmostApp,
        };
        return this.lastHealth;
      }

      this._isBridgeConnected = false;
      return {
        status: 'error',
        error: `Bridge returned HTTP status ${res.status}`,
      };
    } catch {
      this._isBridgeConnected = false;
      return {
        status: 'unavailable',
        error: 'Mac Control Bridge unavailable (Run "swift run" in mac-bridge/)',
      };
    }
  }

  /**
   * Queries the native bridge for Accessibility permission status.
   * Tests GET /api/accessibility
   */
  public async checkAccessibility(): Promise<MacAccessibilityStatus> {
    const url = `${this.endpoint.replace(/\/+$/, '')}/api/accessibility`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const res = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        return {
          granted: Boolean(data.granted),
          message: data.message || (data.granted ? 'Accessibility granted' : 'Accessibility permission required'),
          instruction: data.instruction,
        };
      }

      return {
        granted: false,
        message: 'Unable to query Accessibility permission from bridge.',
      };
    } catch {
      return {
        granted: false,
        message: 'Mac Control Bridge unavailable. Start the Swift bridge to inspect Accessibility status.',
      };
    }
  }

  /**
   * Queries the list of currently running GUI applications from the native bridge.
   * Tests GET /api/apps
   */
  public async getRunningApps(): Promise<MacAppInfo[]> {
    const url = `${this.endpoint.replace(/\/+$/, '')}/api/apps`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const res = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.apps)) {
          return data.apps.map((app: Record<string, unknown>) => ({
            name: String(app.name || 'Unknown'),
            bundleId: String(app.bundleId || ''),
            processId: typeof app.processId === 'number' ? app.processId : undefined,
            isRunning: true,
            isActive: Boolean(app.isActive),
            isHidden: Boolean(app.isHidden),
          }));
        }
      }
      return [];
    } catch {
      return [];
    }
  }

  /**
   * Queries the currently frontmost / focused application from the native bridge.
   * Tests GET /api/frontmost
   */
  public async getFrontmostApp(): Promise<MacAppInfo | null> {
    const url = `${this.endpoint.replace(/\/+$/, '')}/api/frontmost`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const res = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.frontmost) {
          return {
            name: String(data.frontmost.name || 'Unknown'),
            bundleId: String(data.frontmost.bundleId || ''),
            processId: typeof data.frontmost.processId === 'number' ? data.frontmost.processId : undefined,
            isRunning: true,
            isActive: true,
            isHidden: Boolean(data.frontmost.isHidden),
          };
        }
      }
      return null;
    } catch {
      return null;
    }
  }

  public async getSystemInfo(): Promise<MacSystemInfo> {
    if (this.lastHealth && this.lastHealth.status === 'ok') {
      return {
        osVersion: this.lastHealth.osVersion || 'macOS',
        architecture: (this.lastHealth.architecture === 'arm64' ? 'arm64' : 'x86_64'),
        hostname: 'Local Mac',
        uptimeSeconds: 0,
      };
    }

    return {
      osVersion: 'macOS (Bridge Offline)',
      architecture: 'unknown',
      hostname: 'MacBook',
      uptimeSeconds: 0,
    };
  }

  public async checkPermissions(): Promise<MacPermissionStatus[]> {
    const accessStatus = await this.checkAccessibility();

    return [
      {
        permission: 'accessibility',
        granted: accessStatus.granted,
        requiredFor: 'Reading window hierarchy, frontmost application, and UI elements',
      },
      {
        permission: 'automation',
        granted: false,
        requiredFor: 'Controlling native macOS applications via Apple Events (Upcoming)',
      },
      {
        permission: 'fullDiskAccess',
        granted: false,
        requiredFor: 'Reading user documents and system directories (Upcoming)',
      },
      {
        permission: 'terminal',
        granted: false,
        requiredFor: 'Executing local bash and zsh commands (Upcoming)',
      },
      {
        permission: 'screenRecording',
        granted: false,
        requiredFor: 'Computer vision and desktop OCR (Upcoming)',
      },
    ];
  }

  public async requestPermission(_permission: MacOSPermission): Promise<boolean> {
    // We strictly do NOT attempt to automatically change or bypass macOS permissions
    return false;
  }

  public async executeAction(_command: MacActionCommand): Promise<{ success: boolean; output?: string; error?: string }> {
    return {
      success: false,
      error: 'Mac native action execution is intentionally disabled in this read-only foundation phase.',
    };
  }
}

// Export singleton instance of real MacControlService
export const macControlService: IMacControlService = new MacControlService();

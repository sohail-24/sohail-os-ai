# SOHAIL OS AI - Native macOS Bridge (Read-Only Foundation)

This directory contains the Swift native bridge daemon for **SOHAIL OS AI**.

The bridge acts as an isolated local proxy between the SOHAIL OS AI interface and macOS system frameworks.

---

## 1. What the Mac Control Bridge Does

In this initial foundation milestone, the bridge is strictly **read-only**:

1. **macOS Detection:** Confirms that the host running the bridge is an authentic macOS system and reports architecture (`arm64` / `x86_64`) and macOS version.
2. **Accessibility Permission Status:** Queries `AXIsProcessTrustedWithOptions` to check whether the process is authorized for Accessibility.
3. **Running Applications Listing:** Enumerates active GUI applications via `NSWorkspace.shared.runningApplications`, exposing application names, bundle IDs, process IDs (PID), active states, and hidden states.
4. **Frontmost Application Detection:** Identifies the currently active/frontmost application on the user's screen using `NSWorkspace.shared.frontmostApplication`.
5. **Bridge Diagnostics:** Exposes a health endpoint for the SOHAIL OS AI interface to monitor connection latency and entitlement status.

---

## 2. How the React Application Communicates With It

- **Network Boundary:** The bridge listens exclusively on loopback (`http://127.0.0.1:11435`).
- **No Cloud Communication:** No traffic leaves the machine. No third-party network requests are made.
- **Service Abstraction:** The React application communicates via the `IMacControlService` interface (`src/services/mac/`). The UI never directly invokes native binaries or native headers.
- **Endpoints Provided:**
  - `GET /api/health` — Bridge status, OS info, and Accessibility permission flag.
  - `GET /api/accessibility` — Detailed Accessibility status and setup guidance.
  - `GET /api/apps` — List of all running GUI applications.
  - `GET /api/frontmost` — Currently focused/frontmost application.
  - `OPTIONS *` — CORS preflight headers allowing local browser communication.

---

## 3. How to Build and Run the Swift Bridge Locally

On your Mac:

```bash
cd mac-bridge

# Build and run directly using Swift Package Manager
swift run

# Or compile an optimized release binary
swift build -c release
./.build/release/sohail-mac-bridge
```

The daemon will start and log:
```
=================================================================
  SOHAIL OS AI - Native macOS Bridge (Read-Only Foundation)
  Listening exclusively on http://127.0.0.1:11435
  Accessibility granted: [YES | NO (Permission Required)]
=================================================================
```

---

## 4. How to Enable Accessibility Permission

macOS protects application automation and UI inspection with system-level Accessibility entitlements.

To grant permission:

1. Open **System Settings** on your Mac.
2. Navigate to **Privacy & Security** → **Accessibility**.
3. If running the bridge from Terminal:
   - Ensure **Terminal** (or **iTerm2** / your terminal emulator) is toggled **ON**.
4. If running a standalone compiled binary:
   - Click the **+** button at the bottom of the list and select the `sohail-mac-bridge` binary located at `mac-bridge/.build/release/sohail-mac-bridge`.
5. After toggling permission, click **Refresh Mac Status** in SOHAIL OS AI Settings.

---

## 5. What is Intentionally NOT Implemented Yet

To adhere to the safety-first, milestone-based approach:

- **NO Action Automation:** No mouse click simulation, cursor movement, or window snapping.
- **NO Keystroke Automation:** No synthetic key events or keyboard injection.
- **NO Terminal / Shell Execution:** The bridge does not spawn shell commands or execute scripts.
- **NO Filesystem Modification:** The bridge does not write or delete files outside project boundaries.
- **NO WhatsApp Automation:** No external messaging or browser hijacking.
- **NO Screen Recording / Vision:** Screen frame capture is disabled.

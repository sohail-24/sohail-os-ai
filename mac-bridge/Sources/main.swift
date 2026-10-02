import Foundation
import AppKit
import ApplicationServices

// ==============================================================================
// SOHAIL OS AI - Native macOS Bridge (Read-Only Foundation)
// ==============================================================================
// This lightweight native daemon runs locally on macOS and serves system state
// exclusively to the local SOHAIL OS AI interface over loopback (127.0.0.1:11435).
// It does NOT listen on external interfaces (0.0.0.0) and performs NO action
// automation in this phase.
// ==============================================================================

struct BridgeConfig {
    static let port: UInt16 = 11435
    static let host: String = "127.0.0.1"
    static let version: String = "0.1.0"
}

// MARK: - Native macOS Capability Inspector

class MacSystemInspector {
    static let shared = MacSystemInspector()

    private init() {}

    func getOperatingSystemInfo() -> [String: Any] {
        let osVersion = ProcessInfo.processInfo.operatingSystemVersionString
        var arch = "unknown"
        #if arch(arm64)
        arch = "arm64"
        #elseif arch(x86_64)
        arch = "x86_64"
        #endif

        return [
            "isMacOS": true,
            "osVersion": osVersion,
            "architecture": arch,
            "hostname": Host.current().localizedName ?? "Mac"
        ]
    }

    /// Checks whether this bridge process currently has macOS Accessibility permissions.
    /// Uses AXIsProcessTrustedWithOptions without displaying an unwanted popup prompt.
    func checkAccessibilityPermission() -> Bool {
        let checkOptPrompt = kAXTrustedCheckOptionPrompt.takeUnretainedValue() as String
        let options = [checkOptPrompt: false] as CFDictionary
        return AXIsProcessTrustedWithOptions(options)
    }

    /// Lists currently running GUI applications via AppKit NSWorkspace.
    func getRunningApplications() -> [[String: Any]] {
        let running = NSWorkspace.shared.runningApplications
        var list: [[String: Any]] = []

        for app in running {
            // Filter to regular GUI applications with window/user presence
            if app.activationPolicy == .regular {
                let info: [String: Any] = [
                    "name": app.localizedName ?? "Unknown",
                    "bundleId": app.bundleIdentifier ?? "",
                    "processId": app.processIdentifier,
                    "isActive": app.isActive,
                    "isHidden": app.isHidden
                ]
                list.append(info)
            }
        }

        // Sort alphabetically by application name
        return list.sorted {
            (($0["name"] as? String) ?? "").localizedCaseInsensitiveCompare(($1["name"] as? String) ?? "") == .orderedAscending
        }
    }

    /// Identifies the current frontmost / active application on the user's desktop.
    func getFrontmostApplication() -> [String: Any]? {
        guard let front = NSWorkspace.shared.frontmostApplication else {
            return nil
        }

        return [
            "name": front.localizedName ?? "Unknown",
            "bundleId": front.bundleIdentifier ?? "",
            "processId": front.processIdentifier,
            "isActive": front.isActive,
            "isHidden": front.isHidden
        ]
    }
}

// MARK: - Loopback-Only HTTP Server

class LocalHTTPServer {
    private var serverSocket: Int32 = -1
    private let queue = DispatchQueue(label: "com.sohail.os.macbridge.server", attributes: .concurrent)

    func start() {
        serverSocket = socket(AF_INET, SOCK_STREAM, 0)
        guard serverSocket >= 0 else {
            print("[Error] Failed to create socket.")
            exit(1)
        }

        var opt: Int32 = 1
        setsockopt(serverSocket, SOL_SOCKET, SO_REUSEADDR, &opt, socklen_t(MemoryLayout<Int32>.size))

        var addr = sockaddr_in()
        addr.sin_family = sa_family_t(AF_INET)
        addr.sin_port = in_port_t(BridgeConfig.port).bigEndian
        addr.sin_addr.s_addr = inet_addr(BridgeConfig.host) // 127.0.0.1 strictly

        let bindResult = withUnsafePointer(to: &addr) {
            $0.withMemoryRebound(to: sockaddr.self, capacity: 1) {
                bind(serverSocket, $0, socklen_t(MemoryLayout<sockaddr_in>.size))
            }
        }

        guard bindResult >= 0 else {
            print("[Error] Failed to bind to \(BridgeConfig.host):\(BridgeConfig.port). Is the port already in use?")
            exit(1)
        }

        guard listen(serverSocket, 16) >= 0 else {
            print("[Error] Failed to listen on socket.")
            exit(1)
        }

        print("=================================================================")
        print("  SOHAIL OS AI - Native macOS Bridge (Read-Only Foundation)")
        print("  Listening exclusively on http://\(BridgeConfig.host):\(BridgeConfig.port)")
        print("  Accessibility granted: \(MacSystemInspector.shared.checkAccessibilityPermission() ? "YES" : "NO (Permission Required)")")
        print("=================================================================")

        while true {
            var clientAddr = sockaddr_in()
            var clientLen = socklen_t(MemoryLayout<sockaddr_in>.size)
            let clientSocket = withUnsafeMutablePointer(to: &clientAddr) {
                $0.withMemoryRebound(to: sockaddr.self, capacity: 1) {
                    accept(serverSocket, $0, &clientLen)
                }
            }

            guard clientSocket >= 0 else { continue }

            queue.async {
                self.handleClient(clientSocket)
            }
        }
    }

    private func handleClient(_ clientSocket: Int32) {
        defer { close(clientSocket) }

        var buffer = [UInt8](repeating: 0, count: 4096)
        let bytesRead = recv(clientSocket, &buffer, buffer.count - 1, 0)
        guard bytesRead > 0 else { return }

        buffer[bytesRead] = 0
        guard let requestString = String(bytes: buffer[..<bytesRead], encoding: .utf8) else {
            return
        }

        let lines = requestString.components(separatedBy: "\r\n")
        guard let requestLine = lines.first else { return }
        let tokens = requestLine.components(separatedBy: " ")
        guard tokens.count >= 2 else { return }

        let method = tokens[0].uppercased()
        let path = tokens[1]

        // Handle CORS preflight
        if method == "OPTIONS" {
            self.sendResponse(clientSocket, status: "204 No Content", jsonString: "")
            return
        }

        guard method == "GET" else {
            self.sendResponse(clientSocket, status: "405 Method Not Allowed", jsonString: "{\"error\": \"Method not allowed\"}")
            return
        }

        self.routeRequest(clientSocket, path: path)
    }

    private func routeRequest(_ clientSocket: Int32, path: String) {
        let cleanPath = path.components(separatedBy: "?").first ?? path
        let inspector = MacSystemInspector.shared

        switch cleanPath {
        case "/", "/health", "/api/health":
            let osInfo = inspector.getOperatingSystemInfo()
            let isAccessGranted = inspector.checkAccessibilityPermission()
            let frontmost = inspector.getFrontmostApplication()
            let runningCount = inspector.getRunningApplications().count

            let payload: [String: Any] = [
                "status": "ok",
                "bridge": "SOHAIL OS AI macOS Bridge",
                "version": BridgeConfig.version,
                "isMacOS": true,
                "osVersion": osInfo["osVersion"] as? String ?? "",
                "architecture": osInfo["architecture"] as? String ?? "",
                "accessibilityGranted": isAccessGranted,
                "runningAppsCount": runningCount,
                "frontmostApp": frontmost as Any
            ]
            self.sendJSONResponse(clientSocket, object: payload)

        case "/api/accessibility":
            let granted = inspector.checkAccessibilityPermission()
            let message = granted
                ? "Accessibility permission is granted."
                : "Accessibility permission required. Please enable it in System Settings → Privacy & Security → Accessibility."

            let payload: [String: Any] = [
                "granted": granted,
                "message": message,
                "instruction": "Open System Settings → Privacy & Security → Accessibility and add the bridge executable or Terminal."
            ]
            self.sendJSONResponse(clientSocket, object: payload)

        case "/api/apps":
            let apps = inspector.getRunningApplications()
            let payload: [String: Any] = [
                "count": apps.count,
                "apps": apps
            ]
            self.sendJSONResponse(clientSocket, object: payload)

        case "/api/frontmost":
            let frontmost = inspector.getFrontmostApplication()
            let payload: [String: Any] = [
                "frontmost": frontmost as Any
            ]
            self.sendJSONResponse(clientSocket, object: payload)

        default:
            self.sendResponse(clientSocket, status: "404 Not Found", jsonString: "{\"error\": \"Endpoint not found\"}")
        }
    }

    private func sendJSONResponse(_ clientSocket: Int32, object: [String: Any]) {
        do {
            let data = try JSONSerialization.data(withJSONObject: object, options: [.prettyPrinted])
            if let jsonString = String(data: data, encoding: .utf8) {
                self.sendResponse(clientSocket, status: "200 OK", jsonString: jsonString)
            } else {
                self.sendResponse(clientSocket, status: "500 Internal Server Error", jsonString: "{\"error\": \"Encoding failed\"}")
            }
        } catch {
            self.sendResponse(clientSocket, status: "500 Internal Server Error", jsonString: "{\"error\": \"Serialization failed\"}")
        }
    }

    private func sendResponse(_ clientSocket: Int32, status: String, jsonString: String) {
        let headers = [
            "HTTP/1.1 \(status)",
            "Content-Type: application/json; charset=utf-8",
            "Access-Control-Allow-Origin: *",
            "Access-Control-Allow-Methods: GET, OPTIONS",
            "Access-Control-Allow-Headers: Content-Type, Accept",
            "Connection: close",
            "Content-Length: \(jsonString.utf8.count)",
            "",
            jsonString
        ].joined(separator: "\r\n")

        if let data = headers.data(using: .utf8) {
            data.withUnsafeBytes { rawBuffer in
                _ = send(clientSocket, rawBuffer.baseAddress, data.count, 0)
            }
        }
    }
}

// Entry Point
let server = LocalHTTPServer()
server.start()

// swift-tools-version: 5.9
// The swift-tools-version declares the minimum version of Swift required to build this package.

import PackageDescription

let package = Package(
    name: "SohailOSMacBridge",
    platforms: [
        .macOS(.v13)
    ],
    products: [
        .executable(
            name: "sohail-mac-bridge",
            targets: ["SohailOSMacBridge"]
        )
    ],
    dependencies: [],
    targets: [
        .executableTarget(
            name: "SohailOSMacBridge",
            dependencies: [],
            path: "Sources"
        )
    ]
)

# port-checker 🔍

[![npm version](https://img.shields.io/npm/v/@daily-dev/port-checker.svg)](https://www.npmjs.com/package/@daily-dev/port-checker)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)](https://nodejs.org/)

> Check which process is using a port — simple, fast, cross-platform

[中文](#中文说明) | [English](#english-description)

---

## 中文说明

一个简单易用的命令行工具，用于检测本地端口占用情况。支持 Linux、macOS 和 Windows。

### ✨ 功能特性

- 🔍 **端口检测** - 检查指定端口是否被占用
- 📊 **进程信息** - 显示 PID、进程名和状态
- 🖥️ **跨平台** - 支持 Linux、macOS 和 Windows
- 🎨 **清晰输出** - 彩色状态指示和表格格式
- ⚡ **零依赖** - 纯 Node.js，无外部依赖
- 🔢 **批量检测** - 同时检测多个端口

### 📦 安装

```bash
npm install -g @daily-dev/port-checker
```

或使用 npx（无需安装）：

```bash
npx @daily-dev/port-checker 3000
```

### 🚀 使用方法

```bash
# 检测单个端口
port-check 3000

# 检测多个端口
port-check 3000 8080 9000

# 显示帮助
port-check --help
```

### 📋 示例输出

```bash
$ port-check 3000 8080 22 80

检测 4 个端口...

───────────────────────────────────────────
 端口   │ 状态       │ PID    │ 进程名
───────────────────────────────────────────
 3000   │ 🟢 空闲    │ -      │ -
 8080   │ 🔴 占用    │ 5678   │ nginx
 22     │ 🔴 占用    │ -      │ sshd
 80     │ 🟢 空闲    │ -      │ -
───────────────────────────────────────────

摘要: 2 个占用, 2 个空闲
```

> **注意**: 部分系统端口可能需要管理员权限才能显示 PID 和进程名。

---

## English Description

A lightweight CLI tool to detect port occupancy and identify the process using it. Works on Linux, macOS, and Windows.

### ✨ Features

- 🔍 **Port Detection** - Check if a port is occupied
- 📊 **Process Info** - Show PID, process name, and status
- 🖥️ **Cross-Platform** - Works on Linux, macOS, and Windows
- 🎨 **Clear Output** - Color-coded status with table format
- ⚡ **Zero Dependencies** - Pure Node.js, no external deps
- 🔢 **Batch Check** - Check multiple ports at once

### 📦 Installation

```bash
npm install -g @daily-dev/port-checker
```

Or using npx (no install):

```bash
npx @daily-dev/port-checker 3000
```

### 🚀 Usage

```bash
# Check a single port
port-check 3000

# Check multiple ports
port-check 3000 8080 9000

# Show help
port-check --help
```

### 📋 Example Output

```bash
$ port-check 3000 8080 22 80

Checking 4 port(s)...

───────────────────────────────────────────
 PORT   │ STATUS     │ PID    │ NAME
───────────────────────────────────────────
 3000   │ 🟢 free    │ -      │ -
 8080   │ 🔴 occupied│ 5678   │ nginx
 22     │ 🔴 occupied│ -      │ sshd
 80     │ 🟢 free    │ -      │ -
───────────────────────────────────────────

Summary: 2 occupied, 2 free
```

> **Note**: Some system ports may show "unknown" for PID/name without elevated permissions.

---

## 🔧 How It Works / 工作原理

1. **Port Detection** - Attempts to bind to the port to check availability
2. **Process Lookup** - Uses platform-specific tools:
   - **Linux**: `ss`, `netstat`, or `lsof`
   - **macOS**: `lsof`
   - **Windows**: `netstat` + `tasklist`

---

## 🛠️ Requirements / 系统要求

- Node.js >= 14.0.0

---

## 📄 License / 许可证

[MIT](LICENSE) © Daily Dev Project

---

## 🤝 Contributing / 贡献

Contributions are welcome! Please feel free to submit a Pull Request.
欢迎贡献！请随时提交 Pull Request。

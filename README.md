# AgentDesk

A cross-platform desktop app for managing multiple AI CLI agent sessions from a single dashboard.

## Features

- **Multi-session management** - Run Claude Code, Codex, Aider, Cline, and custom tools side by side
- **Real terminal emulation** - Full PTY support with xterm.js and WebGL rendering
- **Session persistence** - SQLite-backed history with full-text search
- **Prompt templates** - Reusable configurations for common workflows
- **Cost tracking** - Per-session token usage and cost monitoring
- **Markdown mode** - Toggle between raw terminal and rendered markdown views

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript + Vite |
| Backend | Rust (Tauri 2) |
| Terminal | xterm.js + WebGL |
| State | Zustand |
| PTY | portable-pty |
| Database | SQLite (rusqlite) |

## Getting Started

### Prerequisites

- Node.js 18+
- Rust 1.70+
- Platform build tools (see [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/))

### Development

```bash
npm install
npm run tauri dev
```

### Build

```bash
npm run tauri build
```

## Architecture

```
React Frontend (Vite + TypeScript)
  ├─ xterm.js (terminal emulation)
  ├─ Zustand (state management)
  └─ React Router (navigation)

Tauri 2 IPC Layer
  ├─ Commands (CRUD operations)
  ├─ Channels (PTY streaming)
  └─ Events (status notifications)

Rust Backend
  ├─ portable-pty (cross-platform PTY)
  ├─ rusqlite (SQLite persistence)
  └─ tokio (async runtime)
```

## License

MIT

# AgentDesk - AI Agent Instructions

## Overview

AgentDesk is a cross-platform desktop app (Tauri 2 + React + TypeScript + Rust) for managing multiple AI CLI agent sessions from a single dashboard.

## Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: Rust (Tauri 2)
- **Terminal**: xterm.js with WebGL addon
- **State**: Zustand (multiple focused stores)
- **PTY**: portable-pty (cross-platform)
- **DB**: rusqlite (SQLite, added in Phase 3)

## Build/Run Commands

```bash
# Install frontend dependencies
npm install

# Dev mode (launches both Vite + Tauri)
npm run tauri dev

# Production build
npm run tauri build

# Frontend only (no Tauri)
npm run dev

# Type check
npx tsc --noEmit
```

## Code Style

### TypeScript/React
- 4-space indentation
- Single quotes for strings
- Semicolons required
- Functional components with hooks
- Zustand for state management (7 focused stores)
- Typed Tauri invoke wrappers in `src/lib/tauri-commands.ts`

### Rust
- Standard Rust formatting (`cargo fmt`)
- Use `Result<T, String>` for Tauri commands
- Models in `src-tauri/src/models/`
- PTY management in `src-tauri/src/pty/`
- Tauri commands in `src-tauri/src/commands/`

## Architecture

### IPC Protocol
| Mechanism | Use Case |
|-----------|----------|
| Commands (invoke) | CRUD, one-off requests |
| Channels | High-throughput PTY output streaming |
| Events (emit) | Low-frequency status notifications |

### Key Design Decisions
- **Channels for PTY data** (not Events) - millions/sec throughput
- **rusqlite directly** (not Tauri SQL plugin) - type-safe server-side SQL
- **portable-pty** (not tauri-plugin-pty) - tight integration with session metadata
- **History write batching** - flush every 5s or 32KB

## File Organization

```
src/                    # React frontend
  components/           # UI components by domain
  pages/                # Route pages
  stores/               # Zustand stores
  hooks/                # React hooks
  lib/                  # Utilities, types, constants
  styles/               # CSS

src-tauri/              # Rust backend
  src/
    commands/           # Tauri IPC commands
    models/             # Data models
    pty/                # PTY session management
    db/                 # SQLite (Phase 3+)
  migrations/           # SQL migrations
```

## Do NOT commit
- `node_modules/`
- `src-tauri/target/`
- `.env` files

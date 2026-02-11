# ADR 001: Dockview-Based Tab & Grid Layout Architecture

**Status**: Accepted
**Date**: 2026-02-11
**Decision Makers**: Implementation Agent
**Related PRD**: docs/prd/tab-grid-layout.md
**Related Issue**: #7

---

## Context

AgentDesk currently uses a custom binary-tree split pane system (`layoutStore` with `SplitPane`/`LeafPane` nodes) that limits users to rigid 2-child splits. Users managing multiple AI agent terminals need:

1. **Multi-tab workspaces** — Group terminals by project/context
2. **Free-form grid layouts** — Arrange cells beyond binary constraints
3. **Activity notifications** — Know when AI agents finish and await input
4. **Persistent layouts** — Restore tab/grid state on app restart

Building a robust docking/layout system from scratch is complex (months of work to stabilize). We need a battle-tested library.

---

## Decision

We will use **[Dockview](https://github.com/mathuo/dockview)** (v4.13+) as the foundation for the tab & grid layout system.

### Why Dockview?

| Criterion | Dockview | FlexLayout | react-mosaic |
|-----------|----------|------------|--------------|
| **Zero dependencies** | ✅ | ❌ (React-only) | ❌ (react-dnd) |
| **Native tabs** | ✅ | ✅ | ❌ (manual) |
| **Split/grid views** | ✅ | ✅ | ✅ |
| **Serialization** | ✅ JSON | ✅ JSON | ✅ JSON |
| **Custom headers** | ✅ React components | ✅ | Limited |
| **Active maintenance** | ✅ (1 month ago) | ✅ (1 month ago) | ❌ (1 year ago) |
| **Weekly downloads** | ~30K | ~48K | ~63K |
| **GitHub stars** | 2,967 | 1,245 | 4,722 |
| **Floating panes** | ✅ | ❌ | ❌ |
| **Documentation** | ✅ Excellent | ✅ Good | ⚠️ Minimal |

**Winner**: Dockview

- Zero dependencies (lighter bundle)
- Best custom header support (critical for our activity indicators)
- Actively maintained, modern API
- VS Code uses similar docking model (proven at scale)

---

## Architecture Design

### Component Hierarchy

```
AppShell
├── Sidebar (unchanged)
├── MainContent
│   ├── TopTabBar (new) ─────────────── Custom tab bar
│   │   ├── TabItem[] (draggable, blinkable)
│   │   └── AddTabButton (+)
│   ├── TabContentArea (conditional)
│   │   ├── TerminalGridTab ─────────── Dockview instance
│   │   │   └── DockviewReact
│   │   │       └── Panel[] (custom)
│   │   │           ├── CellTitleBar ─── Custom header
│   │   │           └── TerminalView ─── xterm.js
│   │   ├── DashboardTab ───────────── Existing dashboard
│   │   └── SettingsTab ────────────── Existing settings
│   └── StatusBar (unchanged)
```

### State Management (Zustand)

#### New Stores

**tabStore** (new):
```typescript
interface Tab {
    id: string;
    name: string;
    type: 'terminal-grid' | 'dashboard' | 'settings' | 'custom';
    layoutState: DockviewSerializedModel;
    order: number;
}

interface TabState {
    tabs: Tab[];
    activeTabId: string;
    addTab(type, name?): string;
    removeTab(id): void;
    setActiveTab(id): void;
    renameTab(id, name): void;
    reorderTabs(ids[]): void;
    updateLayout(id, layout): void;
}
```

**notificationStore** (new):
```typescript
interface NotificationState {
    blinkingCells: Set<string>;
    blinkingTabs: Set<string>;
    desktopNotificationsEnabled: boolean;
    soundEnabled: boolean;

    startBlinking(cellId, tabId): void;
    stopBlinking(cellId): void;
    acknowledgeCell(cellId): void;
    sendDesktopNotification(title, body): void;
}
```

#### Modified Stores

**layoutStore** (deprecated binary tree, replaced with per-tab Dockview instances):
- Remove `root: PaneNode` (binary tree)
- Remove recursive tree operations
- Keep only: `activePaneId` (maps to Dockview panel ID)

**sessionStore** (unchanged):
- No changes needed — session lifecycle independent of layout

---

## Implementation Phases

### Phase 1: Dockview Integration & Tab Bar (Foundational)

**Goal**: Replace binary tree with Dockview, add top-level tabs

**Tasks**:
1. Install `dockview@^4.13.1`
2. Create `tabStore` (tab CRUD, persistence)
3. Build `<TopTabBar>` component
4. Build `<TerminalGridTab>` wrapper around `<DockviewReact>`
5. Custom `<CellTitleBar>` as Dockview `headerComponent`
6. Render `<TerminalView>` inside Dockview panels
7. Migrate existing layout to single default tab
8. Per-tab layout serialization (`dockviewApi.toJSON()` → `tabStore`)
9. Wire Dashboard/Settings as non-terminal tab types

**Acceptance Criteria**:
- [ ] User can create/rename/close tabs
- [ ] Switching tabs restores that tab's Dockview layout
- [ ] xterm.js renders correctly inside Dockview panels
- [ ] Layout persists across app restart
- [ ] All existing functionality preserved (no regressions)

### Phase 2: Cell Operations & Titles (Interaction)

**Goal**: Split, merge, resize, dynamic titles

**Tasks**:
1. Split buttons in `<CellTitleBar>` → call `dockviewApi.addPanel()`
2. Maximize button → `panel.api.maximize()`
3. Close button → stop session, remove panel
4. Drag-to-move/swap (Dockview built-in)
5. Cell merge functionality (custom logic)
6. Dynamic titles: escape sequence parsing → `xterm.onTitleChange` → priority system
7. Title rename (double-click inline edit)

**Acceptance Criteria**:
- [ ] Split (H/V) creates new panels correctly
- [ ] Maximize fills tab area, restore returns to grid
- [ ] Cell drag-to-move reorders panels
- [ ] Terminal escape sequences update cell titles
- [ ] User-set titles persist

### Phase 3: Activity Detection & Animation (Backend + Frontend)

**Goal**: PTY output tracking → Running/Idle states → animations

**Backend (Rust)**:
1. Add `last_output_at: Instant` to `PtySession` struct
2. Background thread: check every 1s, emit `Idle` if `now - last_output_at > threshold`
3. Tauri event: `session-activity-change` with `{ sessionId, state }`

**Frontend**:
1. Subscribe to `session-activity-change` events
2. Update session status in `sessionStore`
3. CSS animations:
   - Running: animated left bar sweep
   - Idle: static blue bar
4. Reduced motion fallback

**Acceptance Criteria**:
- [ ] PTY activity detected within 1s of threshold
- [ ] Running animation plays smoothly (60fps)
- [ ] Idle state shows static indicator
- [ ] Reduced motion disables animations

### Phase 4: Notification System (Polish)

**Goal**: Blinking cells/tabs + desktop notifications

**Tasks**:
1. `notificationStore` with blinking state management
2. Cell title bar blinking on Running → Idle transition
3. Tab blinking when child cells blink
4. Blink acknowledgment on cell focus
5. Tauri notification plugin (`@tauri-apps/plugin-notification`)
6. Notification batching (5-second window)
7. Settings UI (enable/disable, sound, per-session)
8. Optional: taskbar badge count

**Acceptance Criteria**:
- [ ] Cell blinks when agent finishes task
- [ ] Parent tab blinks when child cells blink
- [ ] Clicking cell stops blinking
- [ ] Desktop notification appears within 500ms
- [ ] Batch notification for multiple cells (3+ → "3 sessions need attention")
- [ ] Settings toggle works

---

## Technical Decisions

### TD-1: Per-Tab Dockview Instances

**Decision**: Each terminal-grid tab has its own `<DockviewReact>` instance.

**Rationale**:
- Avoids complex remounting logic when switching tabs
- Each tab's layout is independent and serializable
- Simpler state management

**Trade-off**: Slight memory overhead (~5MB per tab), acceptable for 5-10 tabs.

### TD-2: Custom Cell Title Bar (not Dockview Default Tabs)

**Decision**: Use Dockview panels with custom `headerComponent`, not Dockview's built-in tab bar.

**Rationale**:
- Our "tabs" are top-level workspaces, not Dockview tabs
- Dockview panels represent terminal cells
- Custom headers allow full control for activity indicators

### TD-3: Tab Persistence via localStorage + SQLite

**Decision**: Store tab configurations in both localStorage (fast read) and SQLite (durable backup).

**Rationale**:
- localStorage for instant restore on startup
- SQLite for multi-device sync potential (future)
- Write to both on every layout change

### TD-4: Notification Batching Window = 5 seconds

**Decision**: Accumulate idle transitions for 5 seconds before sending desktop notification.

**Rationale**:
- Avoids spam if multiple agents finish simultaneously
- 5s is short enough that user isn't left waiting
- Aligns with typical task-switching latency

---

## Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **xterm.js resize glitches in Dockview** | Medium | High | Debounce resize events; thorough `fit()` integration; extensive testing |
| **Dockview API breaking changes** | Low | Medium | Pin to `^4.13.1`; wrap in abstraction layer; monitor release notes |
| **CPU overhead from animations** | Low | Medium | GPU-accelerated CSS only; provide disable option |
| **Layout serialization edge cases** | Medium | Medium | Comprehensive save/restore tests; graceful fallback to default layout |
| **Notification spam** | Medium | Low | Batching, per-session toggle, global disable |
| **State management complexity** | Medium | Medium | Clear store boundaries; extensive unit tests |

---

## Alternatives Considered

### Alt-1: Build Custom Layout Manager

**Pros**: Full control, tailored to exact needs
**Cons**: 2-3 months of development, high bug potential, ongoing maintenance burden

**Rejected**: Not worth reinventing the wheel when proven libraries exist.

### Alt-2: FlexLayout

**Pros**: Higher weekly downloads, mature codebase
**Cons**: React-only dependency, less flexible custom headers

**Rejected**: Dockview's zero-dep approach and better custom header support are more aligned with our needs.

### Alt-3: react-mosaic

**Pros**: Most popular, used in VS Code extensions
**Cons**: No native tab support, requires react-dnd dependency

**Rejected**: Lack of native tabs means significant additional work.

---

## Dependencies

### New Dependencies

```json
{
  "dependencies": {
    "dockview": "^4.13.1",
    "@tauri-apps/plugin-notification": "^2.0.0"
  }
}
```

### Updated Tauri Config

```json
{
  "plugins": {
    "notification": {
      "all": true
    }
  }
}
```

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Tab creation time | < 2s |
| Tab switch latency | < 100ms |
| Layout restore time (5 tabs, 10 cells) | < 500ms |
| Activity detection accuracy | 100% (no false positives) |
| Desktop notification delay | < 500ms after idle transition |
| xterm.js rendering issues | 0 resize glitches |
| User satisfaction | 8/10+ |

---

## References

- [Dockview Documentation](https://dockview.dev/)
- [Dockview GitHub](https://github.com/mathuo/dockview)
- [PRD: Tab & Grid Layout](../prd/tab-grid-layout.md)
- [Competitive Analysis](../competitive-analysis/terminal-tab-grid-systems.md)
- [Design System](../../designs/tab-grid-design-system.md)

---

## Approval

**Status**: ✅ Accepted
**Approved By**: User (via PRD approval)
**Implementation Start Date**: 2026-02-11

---

## Changelog

- 2026-02-11: Initial ADR created after PRD and design approval

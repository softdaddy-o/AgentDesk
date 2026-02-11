# Design System Extension: Tab & Grid Layout

**Version**: 2.0.0
**Last Updated**: 2026-02-11
**Parent Design System**: AgentDesk (Tokyonight + Glassmorphism)

---

## Overview

This document extends the existing AgentDesk design system to include the tab & grid layout system. We preserve the refined dark cockpit aesthetic while adding new components for tabbed workspaces, grid cells, and activity indicators.

---

## Extended Color Palette

### Activity State Colors (New)

```css
/* Cell Activity States */
--activity-running: #bb9af7;        /* Purple - Process actively running */
--activity-running-glow: rgba(187, 154, 247, 0.4);
--activity-idle: #7aa2f7;           /* Blue - Waiting for input */
--activity-idle-glow: rgba(122, 162, 247, 0.4);
--activity-attention: #f7768e;      /* Red - Needs user attention (blinking) */
--activity-attention-glow: rgba(247, 118, 142, 0.6);

/* Tab Blinking States */
--tab-blink-primary: var(--accent);
--tab-blink-glow: var(--accent-glow);
```

### Dockview Theme Override Colors

```css
/* Dockview CSS Variable Overrides */
--dv-background: var(--bg-primary);
--dv-paneview-header-background: var(--bg-secondary);
--dv-group-view-background: var(--bg-tertiary);
--dv-tabs-and-actions-container-background: var(--bg-secondary);
--dv-activegroup-visiblepanel-tab-background: var(--bg-hover);
--dv-separator-border: var(--border);
--dv-drag-over-background: var(--accent-dim);
```

---

## Components

### 1. Top-Level Tab Bar

**Visual Specifications**:
- **Height**: 40px
- **Background**: `var(--bg-secondary)` with bottom border `1px solid var(--border)`
- **Padding**: 0 (tabs fill the space)
- **Shadow**: `0 2px 8px rgba(0, 0, 0, 0.2)` for subtle depth

**Tab Item**:
- **Min Width**: 120px
- **Max Width**: 200px
- **Padding**: 0 16px
- **Border Radius**: 0 (flat top, consistent with modern tab design)
- **Font**: `var(--font-sans)`, 14px, weight 500
- **Transition**: background 150ms ease

**Tab States**:
```css
/* Inactive Tab */
background: transparent;
color: var(--text-secondary);
border-bottom: 2px solid transparent;

/* Hover */
background: var(--bg-hover);
color: var(--text-primary);

/* Active Tab */
background: var(--bg-tertiary);
color: var(--text-primary);
border-bottom: 2px solid var(--accent);

/* Blinking Tab (needs attention) */
animation: tab-blink 1.5s ease-in-out infinite;
border-bottom-color: var(--activity-attention);

@keyframes tab-blink {
    0%, 100% { opacity: 1; box-shadow: 0 0 0 rgba(247, 118, 142, 0); }
    50% { opacity: 0.7; box-shadow: 0 0 8px var(--activity-attention-glow); }
}
```

**Tab Actions**:
- Close button (X icon): appears on hover, 16px × 16px, right-aligned
- Drag handle: implicit (entire tab is draggable)
- Type indicator: small icon (16px) left of text — 􀎫 (terminal), 􀋲 (dashboard), 􀣋 (settings)

---

### 2. Terminal Grid Cell (Dockview Panel)

**Visual Specifications**:
- **Background**: `var(--bg-tertiary)`
- **Border**: `1px solid var(--border)`
- **Border Radius**: 8px (subtle, non-zero for glassmorphism)
- **Minimum Size**: 200px × 150px
- **Gap Between Cells**: 4px (Dockview split spacing)

**Cell Title Bar (Custom Dockview Header)**:
- **Height**: 32px
- **Background**: `var(--bg-secondary)` with glassmorphism `backdrop-filter: blur(8px)`
- **Padding**: 0 12px
- **Border Bottom**: `1px solid var(--border)`
- **Font**: `var(--font-sans)`, 13px, weight 500

**Title Bar Layout**:
```
┌─────────────────────────────────────────────────┐
│ [Status Dot] Title Text       [Split▼] [×] [⛶] │  32px height
└─────────────────────────────────────────────────┘
```

**Status Dot** (left-aligned, 8px circle):
- **Starting**: `#e0af68` (warning yellow), static
- **Running**: `#bb9af7` (purple) with pulsing animation
- **Idle**: `#7aa2f7` (blue), static
- **Working**: `#bb9af7` (purple), pulsing
- **Error**: `#f7768e` (danger red), static
- **Stopped**: `#414868` (gray), static

```css
/* Running Animation */
@keyframes pulse-running {
    0%, 100% {
        box-shadow: 0 0 0 0 var(--activity-running-glow);
        opacity: 1;
    }
    50% {
        box-shadow: 0 0 0 4px var(--activity-running-glow);
        opacity: 0.8;
    }
}

.status-dot.running {
    animation: pulse-running 2s ease-in-out infinite;
}
```

**Title Bar Blinking** (needs attention state):
```css
@keyframes title-bar-blink {
    0%, 100% {
        background: var(--bg-secondary);
        border-bottom-color: var(--border);
    }
    50% {
        background: rgba(247, 118, 142, 0.15);
        border-bottom-color: var(--activity-attention);
        box-shadow: inset 0 0 12px var(--activity-attention-glow);
    }
}

.cell-title-bar.blinking {
    animation: title-bar-blink 1.2s ease-in-out infinite;
}
```

**Action Buttons** (right-aligned):
- **Split Dropdown**: 20px × 20px button, shows menu on click: "Split Horizontal" | "Split Vertical"
- **Maximize**: 􀂓 icon, toggles cell full-screen within tab
- **Close**: × icon, closes cell with confirmation if terminal is running

---

### 3. Activity Indicators

**Running Indicator** (subtle animation on title bar):
```css
/* Animated gradient sweep */
.cell-title-bar.running::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 3px;
    height: 100%;
    background: linear-gradient(
        to bottom,
        transparent,
        var(--activity-running),
        transparent
    );
    animation: running-sweep 2s linear infinite;
}

@keyframes running-sweep {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(100%); }
}
```

**Idle Indicator** (static accent bar):
```css
.cell-title-bar.idle::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 3px;
    height: 100%;
    background: var(--activity-idle);
}
```

**Attention Indicator** (blinking title bar + pulsing border):
```css
.cell.needs-attention {
    border-color: var(--activity-attention);
    box-shadow: 0 0 0 2px var(--activity-attention-glow);
    animation: attention-pulse 1.2s ease-in-out infinite;
}

@keyframes attention-pulse {
    0%, 100% { box-shadow: 0 0 0 0 var(--activity-attention-glow); }
    50% { box-shadow: 0 0 0 4px var(--activity-attention-glow); }
}
```

---

### 4. Dockview Theme Integration

**Required Styles** (Dockview CSS overrides):

```css
/* Import Dockview base styles */
@import 'dockview/dist/styles/dockview.css';

/* Custom theme overrides */
.dockview-theme-agentdesk {
    /* Backgrounds */
    --dv-background-color: var(--bg-primary);
    --dv-paneview-header-background-color: var(--bg-secondary);
    --dv-group-view-background-color: var(--bg-tertiary);

    /* Tabs */
    --dv-tabs-and-actions-container-background-color: var(--bg-secondary);
    --dv-activegroup-visiblepanel-tab-background-color: var(--bg-hover);
    --dv-tab-divider-color: var(--border);

    /* Separators */
    --dv-separator-border: var(--border);
    --dv-separator-border-width: 1px;

    /* Drag Overlay */
    --dv-drag-over-background-color: var(--accent-dim);

    /* Focus */
    --dv-activegroup-header-background-color: var(--bg-secondary);
    --dv-activegroup-header-border-color: var(--accent);

    /* Text */
    --dv-tab-label-color: var(--text-secondary);
    --dv-activegroup-visiblepanel-tab-label-color: var(--text-primary);
}

/* Custom Dockview panel styling */
.dv-default-tab {
    font-family: var(--font-sans);
    font-size: 13px;
    padding: 0 12px;
    border-radius: 0;
    transition: background var(--duration-fast) ease;
}

.dv-default-tab:hover {
    background: var(--bg-hover);
}
```

---

## User Flows

### Flow 1: Creating a New Tab

```
User clicks [+ New Tab]
    ↓
Dropdown shows tab types:
    - Terminal Grid
    - Dashboard
    - Settings
    ↓
User selects "Terminal Grid"
    ↓
New tab created with default name "Workspace 1"
Tab bar auto-scrolls to new tab
New tab becomes active
Empty grid with "Add Terminal" prompt
```

### Flow 2: Activity Detection → Notification

```
AI Agent (Claude Code) finishes task
    ↓
PTY output stops for >2 seconds
    ↓
Backend emits "session-activity-change" event: Idle
    ↓
Frontend receives event
    ↓
notificationStore.startBlinking(cellId, tabId)
    ↓
Cell title bar starts blinking animation
Status dot changes to blue (idle)
    ↓
If cell is not in active tab:
    → Parent tab title starts blinking
    → Desktop notification queued (batched)
    ↓
User sees blinking tab or desktop notification
User clicks tab → switches to tab
User clicks cell → cell focused
    ↓
notificationStore.acknowledgeCell(cellId)
    ↓
Cell blinking stops
If no more blinking cells in tab → tab blinking stops
```

### Flow 3: Splitting a Cell

```
User hovers over cell title bar
    ↓
Action buttons appear (fade in)
    ↓
User clicks [Split ▼]
    ↓
Dropdown menu shows:
    - Split Horizontal
    - Split Vertical
    ↓
User selects "Split Horizontal"
    ↓
Dockview splits cell into two panels
Left panel retains existing terminal
Right panel shows "New Terminal" dialog
    ↓
User selects session from list or creates new
    ↓
Terminal loads in right panel
Layout auto-serialized to tabStore
```

---

## Accessibility

### WCAG AA Compliance

- ✅ **Color Contrast**: All text meets 4.5:1 ratio against backgrounds
- ✅ **Focus Indicators**: 2px solid accent ring on focused tabs/cells
- ✅ **Keyboard Navigation**:
  - `Ctrl+Tab` / `Ctrl+Shift+Tab`: Cycle through tabs
  - `Ctrl+1..9`: Jump to tab by index
  - `Alt+Arrow Keys`: Navigate between cells in grid
  - `Ctrl+Shift+D`: Split cell horizontal
  - `Ctrl+Shift+E`: Split cell vertical
  - `Ctrl+Shift+W`: Close active cell
  - `Esc`: Deselect/unfocus
- ✅ **Screen Reader Announcements**:
  - "Tab 1 of 5: Frontend workspace, 3 terminals, 1 needs attention"
  - "Cell claude-code, running" / "Cell cursor, idle, needs attention"
- ✅ **Reduced Motion**: All animations disabled with `prefers-reduced-motion`, replaced with static indicators

### Keyboard Shortcuts Summary

| Shortcut | Action |
|----------|--------|
| `Ctrl+T` | New tab |
| `Ctrl+W` | Close tab |
| `Ctrl+Tab` | Next tab |
| `Ctrl+Shift+Tab` | Previous tab |
| `Ctrl+1..9` | Jump to tab N |
| `Ctrl+Shift+D` | Split cell horizontal |
| `Ctrl+Shift+E` | Split cell vertical |
| `Ctrl+Shift+W` | Close cell |
| `Alt+Arrow` | Navigate cells |
| `F11` | Maximize cell |

---

## Responsive Breakpoints

Not applicable — AgentDesk is a desktop application (Tauri), no mobile views. Fixed window size constraints:

- **Minimum Window**: 1024px × 600px
- **Recommended**: 1440px × 900px+
- **Tab Bar**: Always visible, scrollable horizontally if >10 tabs

---

## Animation Guidelines

### Performance Targets
- **Animation FPS**: 60fps (16ms frame budget)
- **GPU Acceleration**: Use `transform` and `opacity` only; avoid `left`/`top`/`width`/`height`
- **Will-Change**: Add `will-change: transform, opacity` to animated elements

### Transition Timings
```css
/* Activity indicator animations */
--activity-running-duration: 2s;
--activity-blink-duration: 1.2s;
--tab-blink-duration: 1.5s;

/* UI transitions */
--tab-switch-duration: 0.15s;
--cell-focus-duration: 0.12s;
```

---

## Implementation Notes

### Dockview Integration Checklist

1. **Install**: `npm install dockview@^4.13.1`
2. **Import Styles**: `import 'dockview/dist/styles/dockview.css'` in main.tsx
3. **Wrap in Theme**: Pass custom theme object to `<DockviewReact>` component
4. **Custom Headers**: Use `headerComponent` prop to render `CellTitleBar`
5. **Panel Content**: Render `<TerminalView>` inside each panel
6. **Serialization**: Call `dockviewApi.toJSON()` on layout change, store in `tabStore`
7. **Deserialization**: Call `dockviewApi.fromJSON(layout)` on tab switch/restore

### xterm.js Fit Integration

```typescript
// Ensure terminal resizes when Dockview panel resizes
useEffect(() => {
    const disposable = dockviewApi.onDidLayoutChange(() => {
        fitAddon.fit(); // Resize xterm to fill panel
    });
    return () => disposable.dispose();
}, [dockviewApi, fitAddon]);
```

---

## Appendix: Design Inspiration

- **VS Code**: Panel management, tab overflow, focus indicators
- **Warp**: Activity animations, colored tabs, AI agent status
- **Zellij**: Status bar plugin system, alert indicators
- **Linear**: Refined dark UI, subtle animations, glassmorphism
- **Arc Browser**: Tab management, drag-to-reorder, tab grouping

---

## References

- [Dockview Theme Documentation](https://dockview.dev/docs/overview/getStarted/theme/)
- [Dockview GitHub](https://github.com/mathuo/dockview)
- [AgentDesk Existing Design System](../src/styles/index.css)

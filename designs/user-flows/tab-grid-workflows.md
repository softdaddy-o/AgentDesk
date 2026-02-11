# User Flows: Tab & Grid Workflows

**Feature**: Tab & Grid Layout System
**Version**: 1.0.0
**Date**: 2026-02-11

---

## Flow 1: First-Time User Experience

### Scenario: User opens AgentDesk for the first time after tab system is implemented

```
┌─────────────────────────────────────────┐
│ User opens AgentDesk                    │
└───────────────┬─────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│ App loads with default tab: "Workspace" │
│ - Single tab visible                    │
│ - Empty grid (no cells)                 │
│ - Message: "Add your first terminal"    │
└───────────────┬─────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│ User clicks [+ New Terminal] button     │
└───────────────┬─────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│ Session dialog appears                  │
│ - Select CLI tool (Claude Code, etc.)  │
│ - Configure session                     │
└───────────────┬─────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│ Cell created with terminal              │
│ - Fills the grid area                   │
│ - Title bar shows session name          │
│ - Status dot: Starting → Running        │
└─────────────────────────────────────────┘
```

---

## Flow 2: Creating and Organizing Tabs

### Scenario: User wants to organize terminals into separate workspaces

```
┌─────────────────────────────────────────┐
│ User has 5 terminals in one tab         │
│ Wants to separate by project area       │
└───────────────┬─────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│ User clicks [+] button in tab bar       │
└───────────────┬─────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│ Dropdown menu appears:                  │
│  ☑ Terminal Grid                        │
│  ○ Dashboard                             │
│  ○ Settings                              │
└───────────────┬─────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│ User selects "Terminal Grid"            │
└───────────────┬─────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│ New tab created: "Workspace 2"          │
│ - Tab becomes active                    │
│ - Empty grid displayed                  │
│ - Tab bar scrolls to show new tab      │
└───────────────┬─────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│ User double-clicks tab title            │
└───────────────┬─────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│ Inline edit: title becomes input        │
│ User types "Backend Services"           │
│ Presses Enter                           │
└───────────────┬─────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│ Tab renamed to "Backend Services"       │
│ Change persists to localStorage         │
└─────────────────────────────────────────┘
```

---

## Flow 3: Splitting a Cell

### Scenario: User wants to run two terminals side-by-side

```
┌─────────────────────────────────────────┐
│ User has single terminal cell           │
│ Wants to split it horizontally          │
└───────────────┬─────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│ User hovers over cell title bar         │
│ Action buttons fade in                  │
└───────────────┬─────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│ User clicks [▼ Split] button            │
└───────────────┬─────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│ Dropdown menu appears:                  │
│  ☑ Split Horizontal                     │
│  ○ Split Vertical                        │
└───────────────┬─────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│ User selects "Split Horizontal"         │
└───────────────┬─────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│ Dockview splits cell into 2 panels      │
│ ┌──────────┬──────────┐                 │
│ │ Original │ New Cell │                 │
│ │ Terminal │ (Empty)  │                 │
│ └──────────┴──────────┘                 │
└───────────────┬─────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│ New cell shows "New Terminal" dialog    │
│ User selects session or creates new     │
└───────────────┬─────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│ Both terminals now visible side-by-side │
│ Layout auto-saved to tabStore           │
└─────────────────────────────────────────┘
```

### Alternative: Keyboard Shortcut

```
┌─────────────────────────────────────────┐
│ User presses Ctrl+Shift+D               │
│ (active cell splits horizontally)       │
└───────────────┬─────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│ Same split behavior as above            │
└─────────────────────────────────────────┘
```

---

## Flow 4: Activity Detection → Notification

### Scenario: Claude Code finishes task in background tab

```
┌─────────────────────────────────────────┐
│ User is working in "Frontend" tab       │
│ Claude Code is running in "Backend" tab │
└───────────────┬─────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│ Claude Code finishes generating code    │
│ PTY output stops                        │
└───────────────┬─────────────────────────┘
                ↓ (2-3 seconds)
┌─────────────────────────────────────────┐
│ Backend detects no output for 3 seconds │
│ Emits: session-activity-change: Idle    │
└───────────────┬─────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│ Frontend receives event                 │
│ notificationStore.startBlinking()       │
└───────────────┬─────────────────────────┘
                ↓ (Parallel Actions)
┌─────────────────────────────────────────┐
│ 1. Cell title bar starts blinking       │
│    (pulsing red animation)              │
│ 2. Cell border pulses (attention glow)  │
│ 3. "Backend" tab starts blinking        │
│    (parent tab propagation)             │
│ 4. Desktop notification queued          │
└───────────────┬─────────────────────────┘
                ↓ (5 seconds later)
┌─────────────────────────────────────────┐
│ Desktop notification appears:           │
│ "AgentDesk: claude-code finished and    │
│  is waiting for input"                  │
└───────────────┬─────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│ User sees blinking "Backend" tab        │
│ OR notices desktop notification         │
└───────────────┬─────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│ User clicks "Backend" tab               │
└───────────────┬─────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│ Tab switches to Backend workspace       │
│ - Grid layout restored                  │
│ - Blinking cell visible                 │
│ - Tab blinking stops                    │
└───────────────┬─────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│ User clicks blinking cell               │
│ (or presses Alt+Arrow to navigate)     │
└───────────────┬─────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│ Cell gains focus                        │
│ notificationStore.acknowledgeCell()     │
│ - Cell blinking stops                   │
│ - Title bar returns to normal           │
│ - Border glow fades                     │
└───────────────┬─────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│ User reads output and provides input    │
│ Terminal resumes Running state          │
└─────────────────────────────────────────┘
```

---

## Flow 5: Batch Notification (Multiple Cells Finish)

### Scenario: 3 terminals finish tasks within 5 seconds

```
┌─────────────────────────────────────────┐
│ t=0s: Cell A (claude-code) → Idle       │
└───────────────┬─────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│ Notification queued: "claude-code"      │
└───────────────┬─────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│ t=2s: Cell B (cursor) → Idle            │
└───────────────┬─────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│ Notification batched with Cell A        │
└───────────────┬─────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│ t=4s: Cell C (aider) → Idle             │
└───────────────┬─────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│ Notification batched with A + B         │
└───────────────┬─────────────────────────┘
                ↓ (t=5s: batch window closes)
┌─────────────────────────────────────────┐
│ Single desktop notification:            │
│ "AgentDesk: 3 sessions need attention"  │
│ Clicking notification:                  │
│  → Switches to first blinking tab       │
└───────────────┬─────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│ All 3 cells are blinking                │
│ User acknowledges them one by one       │
└─────────────────────────────────────────┘
```

---

## Flow 6: Maximizing a Cell

### Scenario: User wants to focus on one terminal

```
┌─────────────────────────────────────────┐
│ User has 4 cells in a 2x2 grid          │
│ Wants to maximize Cell 1                │
└───────────────┬─────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│ User clicks [⛶ Maximize] button         │
│ OR presses F11                          │
└───────────────┬─────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│ Dockview maximizes Cell 1               │
│ - Cell fills entire tab area            │
│ - Other cells hidden (but not closed)   │
│ - Maximize icon → Restore icon          │
└───────────────┬─────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│ User works in full-screen terminal      │
└───────────────┬─────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│ User clicks [Restore] or presses F11    │
└───────────────┬─────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│ Grid layout restored                    │
│ All 4 cells visible again               │
└─────────────────────────────────────────┘
```

---

## Flow 7: Closing a Tab with Running Terminals

### Scenario: User accidentally closes tab with active sessions

```
┌─────────────────────────────────────────┐
│ User clicks [×] on "Backend" tab        │
│ Tab has 3 terminals, 2 are running      │
└───────────────┬─────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│ Confirmation dialog appears:            │
│                                         │
│  ╔═══════════════════════════════════╗ │
│  ║ Close Tab?                        ║ │
│  ║                                   ║ │
│  ║ This tab has 2 running terminals. ║ │
│  ║ Closing will stop all sessions.  ║ │
│  ║                                   ║ │
│  ║  [Cancel]         [Close Tab]    ║ │
│  ╚═══════════════════════════════════╝ │
└───────────────┬─────────────────────────┘
                ↓
       ┌────────┴────────┐
       ↓                 ↓
┌──────────────┐  ┌──────────────┐
│ User clicks  │  │ User clicks  │
│ [Cancel]     │  │ [Close Tab]  │
└──────┬───────┘  └──────┬───────┘
       ↓                 ↓
┌──────────────┐  ┌──────────────┐
│ Dialog       │  │ Backend tab  │
│ closes       │  │ closed       │
│ Tab remains  │  │ Sessions     │
│ open         │  │ stopped      │
└──────────────┘  │ Switch to    │
                  │ previous tab │
                  └──────────────┘
```

---

## Flow 8: Drag-Reordering Tabs

### Scenario: User wants to reorder tabs

```
┌─────────────────────────────────────────┐
│ Tab order: [Frontend] [Backend] [DevOps]│
│ User wants: [Backend] [Frontend] [DevOps]│
└───────────────┬─────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│ User starts dragging "Backend" tab      │
│ (mouse down, drag left)                 │
└───────────────┬─────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│ Tab becomes semi-transparent (0.5)      │
│ Blue indicator line shows drop position │
└───────────────┬─────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│ User drags past midpoint of "Frontend"  │
│ Indicator moves to left of "Frontend"   │
└───────────────┬─────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│ User releases mouse (drops tab)         │
└───────────────┬─────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│ Tabs reorder with smooth animation      │
│ New order: [Backend] [Frontend] [DevOps]│
│ Change persists to tabStore             │
└─────────────────────────────────────────┘
```

---

## Flow 9: Settings Persistence & Restore

### Scenario: User closes app and reopens

```
┌─────────────────────────────────────────┐
│ User has 3 tabs with complex layouts:   │
│ - Frontend: 2x2 grid (4 cells)          │
│ - Backend: 3-column layout (3 cells)    │
│ - DevOps: 1 maximized cell              │
└───────────────┬─────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│ User closes AgentDesk (Cmd+Q / Alt+F4)  │
└───────────────┬─────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│ On close:                               │
│ 1. Serialize all tab layouts → JSON     │
│ 2. Save to localStorage + SQLite        │
│ 3. Stop all PTY sessions gracefully     │
└───────────────┬─────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│ User reopens AgentDesk                  │
└───────────────┬─────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│ On startup:                             │
│ 1. Load tab configurations from DB      │
│ 2. Restore tab bar (3 tabs)             │
│ 3. Set active tab to last-active        │
└───────────────┬─────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│ User sees restore dialog:               │
│ "Restore 7 sessions from last session?" │
│  [Skip]              [Restore]          │
└───────────────┬─────────────────────────┘
                ↓
       ┌────────┴────────┐
       ↓                 ↓
┌──────────────┐  ┌──────────────┐
│ User clicks  │  │ User clicks  │
│ [Skip]       │  │ [Restore]    │
└──────┬───────┘  └──────┬───────┘
       ↓                 ↓
┌──────────────┐  ┌──────────────┐
│ Empty tabs   │  │ For each tab:│
│ with default │  │ 1. Deserial- │
│ layouts      │  │    ize layout│
└──────────────┘  │ 2. Respawn   │
                  │    sessions  │
                  │ 3. Restore   │
                  │    grid      │
                  └──────┬───────┘
                         ↓
                  ┌──────────────┐
                  │ All layouts  │
                  │ and sessions │
                  │ restored     │
                  └──────────────┘
```

---

## Edge Cases

### EC-1: Last Tab Closing
```
User tries to close the last remaining tab
    ↓
Prevent close OR auto-create new default tab
```

### EC-2: Too Many Tabs (>10)
```
Tab bar overflows
    ↓
Enable horizontal scroll
Show left/right scroll arrows on hover
Active tab auto-scrolls into view
```

### EC-3: Cell with Unsaved Work
```
User closes cell with running process
    ↓
Confirmation: "Process is still running. Close anyway?"
    ↓
User confirms → Stop process, close cell
User cancels → Cell remains open
```

### EC-4: Desktop Notification Click (App Minimized)
```
Notification appears while app is in background
    ↓
User clicks notification
    ↓
1. Bring app window to foreground
2. Switch to relevant tab
3. Focus blinking cell
4. Acknowledge blink
```

---

## Keyboard-Only Workflow

```
User navigates entirely with keyboard:

1. Ctrl+T → New tab (opens type dropdown, Arrow keys to select)
2. Ctrl+1 → Jump to Tab 1
3. Alt+Right → Navigate to next cell
4. Ctrl+Shift+D → Split cell horizontally
5. Alt+Down → Navigate to new cell
6. (Work in terminal)
7. Ctrl+Shift+W → Close cell
8. Ctrl+Tab → Next tab
9. F2 → Rename tab
10. Ctrl+W → Close tab
```

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Time to create new tab | < 2 seconds |
| Time to split cell | < 1 second |
| Tab switch latency | < 100ms |
| Blinking detection accuracy | 100% (no false positives) |
| Desktop notification delivery | < 500ms after idle transition |
| Layout restore time | < 500ms for 5 tabs with 10 cells |
| User satisfaction (tab management) | 8/10+ |

# Component: Cell Title Bar (Dockview Panel Header)

**Component Type**: Panel Header
**Parent**: Dockview Panel (custom `headerComponent`)
**Dependencies**: Dockview API, Zustand (`notificationStore`, `sessionStore`)

---

## Visual Specifications

### Dimensions
- **Height**: 32px (fixed)
- **Padding**: 0 12px
- **Min Width**: 200px (inherited from panel)

### Colors
- **Background**: `var(--bg-secondary)` with glassmorphism `backdrop-filter: blur(8px)`
- **Border Bottom**: `1px solid var(--border)`
- **Text**: `var(--text-primary)`

---

## Layout Structure

```
┌──────────────────────────────────────────────────┐
│ [●] Cell Title                   [▼] [⛶] [×]    │  32px
└──────────────────────────────────────────────────┘
 ↑   ↑                              ↑   ↑   ↑
 │   └─ Title Text                  │   │   └─ Close
 │                                  │   └─ Maximize
 └─ Status Dot                      └─ Split Menu
```

**Flexbox Layout**:
```css
.cell-title-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    height: 32px;
    padding: 0 12px;
    background: var(--bg-secondary);
    backdrop-filter: blur(8px);
    border-bottom: 1px solid var(--border);
    position: relative;
}

.cell-title-text {
    flex: 1;
    font-size: 13px;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.cell-actions {
    display: flex;
    gap: 4px;
    opacity: 0;
    transition: opacity 0.15s ease;
}

.cell-title-bar:hover .cell-actions {
    opacity: 1;
}
```

---

## Elements

### 1. Status Dot

**Visual**: 8px circle, left-aligned
**Purpose**: Indicates terminal session state
**Position**: Leftmost element, 12px from left edge

**State Mapping**:
```typescript
const statusDotColors = {
    starting: '#e0af68',   // Yellow
    running: '#bb9af7',    // Purple (animated)
    idle: '#7aa2f7',       // Blue
    working: '#bb9af7',    // Purple (animated)
    error: '#f7768e',      // Red
    stopped: '#414868',    // Gray
};
```

**Running Animation** (pulsing glow):
```css
.status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
}

.status-dot.running,
.status-dot.working {
    background: var(--activity-running);
    animation: pulse-running 2s ease-in-out infinite;
}

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

/* Reduced motion: static indicator */
@media (prefers-reduced-motion: reduce) {
    .status-dot.running,
    .status-dot.working {
        animation: none;
        box-shadow: 0 0 4px var(--activity-running-glow);
    }
}
```

### 2. Title Text

**Content Priority** (evaluated in order):
1. **Process-set title**: From terminal escape sequences `\e]0;title\a` or `\e]2;title\a`
2. **User-set title**: Manually renamed by user (double-click to edit)
3. **Default title**: Session name from config (e.g., "claude-code", "bash")

**Behavior**:
```typescript
const getDisplayTitle = (session: Session) => {
    if (session.processTitle) return session.processTitle;
    if (session.userTitle) return session.userTitle;
    return session.config.name;
};
```

**Editable** (double-click):
```tsx
const [isEditing, setIsEditing] = useState(false);
const [editValue, setEditValue] = useState(title);

<div
    className="cell-title-text"
    onDoubleClick={() => setIsEditing(true)}
>
    {isEditing ? (
        <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSaveTitle}
            onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveTitle();
                if (e.key === 'Escape') setIsEditing(false);
            }}
            autoFocus
        />
    ) : (
        <span>{title}</span>
    )}
</div>
```

### 3. Split Dropdown Button

**Icon**: ▼ (down arrow) or split icon
**Size**: 20px × 20px
**Position**: Right side, before maximize button
**Behavior**: Click shows menu with split options

```tsx
<DropdownMenu>
    <MenuTrigger>
        <button className="cell-action-button">
            <SplitIcon />
        </button>
    </MenuTrigger>
    <MenuContent>
        <MenuItem onClick={() => splitCell('horizontal')}>
            <HorizontalSplitIcon />
            Split Horizontal
        </MenuItem>
        <MenuItem onClick={() => splitCell('vertical')}>
            <VerticalSplitIcon />
            Split Vertical
        </MenuItem>
    </MenuContent>
</DropdownMenu>
```

**Keyboard Shortcut**:
- `Ctrl+Shift+D`: Split horizontal
- `Ctrl+Shift+E`: Split vertical

### 4. Maximize Button

**Icon**: ⛶ (expand icon) or 􀂓
**Size**: 20px × 20px
**Position**: Right side, before close button
**Behavior**: Toggles cell full-screen within tab

```tsx
<button
    className="cell-action-button"
    onClick={toggleMaximize}
    aria-label={isMaximized ? 'Restore' : 'Maximize'}
>
    {isMaximized ? <RestoreIcon /> : <MaximizeIcon />}
</button>
```

**Maximized State**:
- Cell fills entire tab area
- Other cells hidden (Dockview API: `panel.api.maximize()`)
- Title bar remains visible
- Maximize icon changes to restore icon

### 5. Close Button

**Icon**: × (U+00D7)
**Size**: 20px × 20px
**Position**: Rightmost element
**Color**: `var(--text-muted)`, hover → `var(--danger)`
**Behavior**: Closes cell, prompts if terminal is running

```tsx
<button
    className="cell-action-button close-button"
    onClick={handleCloseCell}
    aria-label="Close terminal"
>
    <CloseIcon />
</button>
```

```css
.close-button {
    color: var(--text-muted);
    transition: color 0.15s ease;
}

.close-button:hover {
    color: var(--danger);
}
```

---

## States

### 1. Default State
```css
.cell-title-bar {
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border);
}
```

### 2. Running State (Activity Indicator)

**Left Accent Bar** (animated sweep):
```css
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

### 3. Idle State (Static Indicator)

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

### 4. Blinking State (Needs Attention)

**Title Bar Blinking**:
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

/* Stop blinking on hover/focus */
.cell-title-bar.blinking:hover,
.cell-title-bar:focus-within {
    animation: none;
}
```

**Entire Cell Border Pulse**:
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

### 5. Focused State

```css
.cell-title-bar.focused {
    border-bottom-color: var(--accent);
    background: var(--bg-hover);
}
```

---

## Interactions

### 1. Title Rename (Double-Click)
**Trigger**: Double-click title text
**Flow**:
1. Title becomes inline input
2. Input auto-focuses, text selected
3. On Enter: save new title, exit edit mode
4. On Esc: cancel edit, restore original
5. On blur: save if changed, exit edit mode
6. Update `session.userTitle` in `sessionStore`

### 2. Split Cell (Dropdown)
**Trigger**: Click split button
**Flow**:
1. Show dropdown menu with "Split Horizontal" and "Split Vertical"
2. User selects direction
3. Call `dockviewApi.addPanel()` with direction
4. Prompt user to assign session to new panel
5. Update layout in `tabStore`

### 3. Maximize Cell
**Trigger**: Click maximize button (or `F11`)
**Flow**:
1. Call `panel.api.maximize()`
2. Cell fills tab area, other cells hidden
3. Maximize button icon changes to restore icon
4. Click again or `F11` to restore

### 4. Close Cell
**Trigger**: Click close button (or `Ctrl+Shift+W`)
**Flow**:
1. If terminal is running (status != stopped):
   - Show confirmation dialog:
     ```
     ┌────────────────────────────────────┐
     │ Close Terminal?                    │
     │                                    │
     │ "claude-code" is still running.    │
     │ Closing will stop the session.     │
     │                                    │
     │ [Cancel]         [Close]           │
     └────────────────────────────────────┘
     ```
2. If confirmed or already stopped:
   - Call `stopSession(sessionId)` via Tauri command
   - Remove panel from Dockview
   - Update `layoutStore`

### 5. Cell Focus (Click Title Bar)
**Trigger**: Click anywhere on title bar
**Flow**:
1. Focus the terminal (xterm.js)
2. If cell was blinking: call `notificationStore.acknowledgeCell(cellId)`
3. Border changes to focused state
4. Title bar shows focused background

---

## Accessibility

### ARIA Attributes
```tsx
<div
    className="cell-title-bar"
    role="banner"
    aria-label={`Terminal ${sessionName}, ${activityState}`}
    tabIndex={0}
>
    <StatusDot status={session.status} aria-hidden="true" />
    <span className="cell-title-text" aria-live="polite">
        {displayTitle}
    </span>
    {/* Action buttons */}
</div>
```

### Keyboard Shortcuts
| Key | Action |
|-----|--------|
| `Alt+Arrow` | Navigate between cells |
| `Ctrl+Shift+D` | Split horizontal |
| `Ctrl+Shift+E` | Split vertical |
| `Ctrl+Shift+W` | Close cell |
| `F11` | Maximize/restore |
| `F2` | Rename cell |

### Screen Reader Announcements
- When cell starts running: "Terminal claude-code is now running"
- When cell becomes idle: "Terminal claude-code is idle and awaiting input"
- When cell starts blinking: "Terminal cursor needs attention"
- When cell is closed: "Terminal claude-code closed"

---

## Edge Cases

### Long Titles (Overflow)
- Max width = panel width - 100px (for buttons)
- Text overflow: ellipsis
- Tooltip on hover shows full title

```css
.cell-title-text {
    max-width: calc(100% - 100px);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.cell-title-text[title]:hover::after {
    content: attr(title);
    position: absolute;
    /* Tooltip styles */
}
```

### Terminal Title Spam
- If process sets title rapidly (e.g., progress bars), debounce updates:
  ```typescript
  const debouncedSetTitle = useMemo(
      () => debounce((title: string) => setProcessTitle(title), 300),
      []
  );
  ```

### Multiple Cells Blinking
- If 3+ cells are blinking in the same tab:
  - Aggregate notification: "3 terminals need attention"
  - Click any blinking cell acknowledges only that cell

---

## Testing Checklist

- [ ] Status dot colors match session states
- [ ] Running animation is smooth (60fps)
- [ ] Title rename persists across app restart
- [ ] Split dropdown creates new panels correctly
- [ ] Maximize fills tab area, restore returns to original
- [ ] Close confirmation appears for running terminals
- [ ] Blinking starts on Running → Idle transition
- [ ] Blinking stops on cell focus
- [ ] Left accent bar animates smoothly
- [ ] Action buttons appear on hover
- [ ] Keyboard shortcuts work
- [ ] ARIA labels are correct
- [ ] Reduced motion disables animations

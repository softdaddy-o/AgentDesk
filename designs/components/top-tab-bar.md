# Component: Top Tab Bar

**Component Type**: Navigation
**Parent**: `MainContent` (replaces `TabBar.tsx`)
**Dependencies**: React, Zustand (`tabStore`), React DnD (drag-reorder)

---

## Visual Specifications

### Dimensions
- **Height**: 40px (fixed)
- **Width**: 100% of main content area (minus sidebar)
- **Tab Min Width**: 120px
- **Tab Max Width**: 200px
- **Tab Count Limit**: Unlimited (horizontal scroll if >10 tabs)

### Colors
- **Background**: `var(--bg-secondary)` (#16161e)
- **Border Bottom**: `1px solid var(--border)` (#3b4261)
- **Shadow**: `0 2px 8px rgba(0, 0, 0, 0.2)`

---

## Elements

### 1. Tab Item

**Structure**:
```tsx
<button className="tab-item" data-active={isActive} data-blinking={isBlinking}>
    <TabIcon type={tab.type} />
    <span className="tab-title">{tab.name}</span>
    {isBlinking && <BlinkIndicator />}
    <CloseButton onClose={() => closeTab(tab.id)} />
</button>
```

**States**:

#### Inactive (Default)
```css
.tab-item {
    background: transparent;
    color: var(--text-secondary);
    border: none;
    border-bottom: 2px solid transparent;
    padding: 0 16px;
    height: 40px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: var(--font-sans);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s ease, color 0.15s ease;
}
```

#### Hover
```css
.tab-item:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
}

.tab-item:hover .close-button {
    opacity: 1; /* Show close button on hover */
}
```

#### Active
```css
.tab-item[data-active="true"] {
    background: var(--bg-tertiary);
    color: var(--text-primary);
    border-bottom-color: var(--accent);
}
```

#### Blinking (Needs Attention)
```css
@keyframes tab-blink {
    0%, 100% {
        opacity: 1;
        box-shadow: 0 0 0 rgba(247, 118, 142, 0);
    }
    50% {
        opacity: 0.7;
        box-shadow: inset 0 -2px 0 var(--activity-attention),
                    0 0 8px var(--activity-attention-glow);
    }
}

.tab-item[data-blinking="true"] {
    animation: tab-blink 1.5s ease-in-out infinite;
}

/* Stop blinking on hover/focus */
.tab-item[data-blinking="true"]:hover,
.tab-item[data-blinking="true"]:focus {
    animation: none;
}
```

### 2. Tab Icon (Type Indicator)

**Icon Mapping**:
- Terminal Grid: `<TerminalIcon />` (􀙥 or Unicode)
- Dashboard: `<DashboardIcon />` (􀋲)
- Settings: `<SettingsIcon />` (􀣋)

**Size**: 16px × 16px
**Color**: Inherits from parent (text color)
**Position**: Left of title text

### 3. Blink Indicator

**Visual**: Small pulsing dot (6px circle) next to title
**Color**: `var(--activity-attention)` (#f7768e)
**Animation**: Opacity pulse 0.6s infinite

```css
.blink-indicator {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--activity-attention);
    animation: blink-dot 0.6s ease-in-out infinite;
}

@keyframes blink-dot {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
}
```

### 4. Close Button

**Icon**: × (Unicode U+00D7 or custom SVG)
**Size**: 16px × 16px
**Color**: `var(--text-muted)`, hover → `var(--danger)`
**Position**: Right edge of tab
**Visibility**: Hidden by default, visible on tab hover

```css
.close-button {
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: none;
    color: var(--text-muted);
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.15s ease, color 0.15s ease;
}

.close-button:hover {
    color: var(--danger);
}
```

### 5. Add Tab Button

**Position**: Right end of tab bar (always visible)
**Icon**: + (plus sign)
**Size**: 32px × 32px
**Behavior**: Click shows dropdown menu with tab types

```tsx
<button className="add-tab-button" onClick={showTabTypeMenu}>
    <PlusIcon />
</button>
```

**Dropdown Menu** (on click):
```
┌─────────────────────┐
│ 􀙥 Terminal Grid    │
│ 􀋲 Dashboard         │
│ 􀣋 Settings          │
└─────────────────────┘
```

---

## Interactions

### 1. Tab Selection
**Trigger**: Click tab item
**Action**:
1. `setActiveTab(tab.id)` in `tabStore`
2. Restore grid layout for that tab
3. Scroll tab into view if partially hidden
4. If tab was blinking, call `acknowledgeTab(tab.id)` to stop blinking

### 2. Tab Reordering (Drag-and-Drop)
**Trigger**: Mouse drag on tab item
**Behavior**:
1. Tab becomes semi-transparent (opacity: 0.5) while dragging
2. Other tabs shift to show drop target
3. Blue indicator line shows drop position
4. On drop: `reorderTabs([...newOrder])`
5. Reorder persists to `tabStore` and localStorage

**DnD Library**: Use `@dnd-kit/core` (lightweight, accessible) or native HTML5 drag-and-drop

### 3. Tab Closing
**Trigger**: Click close button (×)
**Action**:
1. If tab has running terminals: show confirmation dialog
   ```
   ┌───────────────────────────────────────────┐
   │ Close Tab?                                │
   │                                           │
   │ This tab has 3 running terminals.         │
   │ Closing will stop all sessions.           │
   │                                           │
   │ [Cancel]                [Close Tab]       │
   └───────────────────────────────────────────┘
   ```
2. If confirmed or no running terminals: `removeTab(tab.id)`
3. Switch to previous tab or first remaining tab
4. Update `tabStore` and serialize to localStorage

### 4. Double-Click to Rename
**Trigger**: Double-click tab title text
**Behavior**:
1. Title becomes editable inline input
2. Input width matches text width (min 60px, max 180px)
3. On Enter or blur: `renameTab(tab.id, newName)`
4. On Esc: cancel edit, restore original name

### 5. Tab Context Menu (Right-Click)
**Trigger**: Right-click tab item
**Menu**:
```
┌─────────────────────┐
│ Rename              │
│ Duplicate           │
│ ────────────────    │
│ Close               │
│ Close Others        │
│ Close to the Right  │
│ Close All           │
└─────────────────────┘
```

---

## Keyboard Navigation

| Key | Action |
|-----|--------|
| `Ctrl+T` | New tab (shows type dropdown) |
| `Ctrl+W` | Close active tab |
| `Ctrl+Tab` | Next tab |
| `Ctrl+Shift+Tab` | Previous tab |
| `Ctrl+1..9` | Jump to tab N |
| `Arrow Left/Right` | Navigate tabs (when tab bar focused) |
| `Enter` | Activate focused tab |
| `F2` | Rename active tab |

---

## Accessibility

### ARIA Attributes
```tsx
<div role="tablist" aria-label="Workspace tabs">
    <button
        role="tab"
        aria-selected={isActive}
        aria-controls={`tabpanel-${tab.id}`}
        id={`tab-${tab.id}`}
        aria-label={`${tab.name}, ${tab.type}, ${isBlinking ? 'needs attention' : ''}`}
    >
        {/* Tab content */}
    </button>
</div>
```

### Focus Indicators
```css
.tab-item:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: -2px;
    border-radius: 4px;
}
```

### Screen Reader Announcements
- When tab becomes active: "Switched to Frontend workspace tab, 3 terminals"
- When tab starts blinking: "Backend workspace needs attention"
- When tab is closed: "Frontend workspace closed, 4 tabs remaining"

---

## Edge Cases

### Too Many Tabs (Overflow)
- If tabs exceed viewport width (>10 tabs typically):
  - Enable horizontal scroll
  - Add subtle gradient fade on left/right edges
  - Show scroll arrows on hover (left/right)
  - Auto-scroll active tab into view

```css
.tab-bar-container {
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: thin;
    scrollbar-color: var(--border) transparent;
}

.tab-bar-container::-webkit-scrollbar {
    height: 4px;
}

.tab-bar-container::-webkit-scrollbar-thumb {
    background: var(--border);
    border-radius: 2px;
}
```

### Last Tab Closing
- Prevent closing the last tab (always keep at least 1)
- Or: auto-create a new default tab when last tab is closed

### Tab Name Collision
- If user creates multiple "Workspace 1" tabs, append numbers: "Workspace 1 (2)", "Workspace 1 (3)"

---

## Data Structure

### Tab Model (Zustand Store)
```typescript
interface Tab {
    id: string;                 // UUID
    name: string;               // User-editable name
    type: 'terminal-grid' | 'dashboard' | 'settings' | 'custom';
    layoutState: SerializedLayout;  // Dockview JSON
    order: number;              // Display order
    createdAt: number;          // Timestamp
    isBlinking: boolean;        // Activity notification state
    blinkingCellIds: Set<string>;  // Which cells are blinking
}

interface TabStore {
    tabs: Tab[];
    activeTabId: string;
    addTab(type: Tab['type'], name?: string): string;
    removeTab(tabId: string): void;
    setActiveTab(tabId: string): void;
    renameTab(tabId: string, name: string): void;
    reorderTabs(tabIds: string[]): void;
    updateLayout(tabId: string, layout: SerializedLayout): void;
    startTabBlinking(tabId: string, cellId: string): void;
    stopTabBlinking(tabId: string): void;
}
```

---

## Testing Checklist

- [ ] Tab selection switches layout correctly
- [ ] Tab reordering persists after app restart
- [ ] Tab closing with running terminals shows confirmation
- [ ] Double-click rename works and persists
- [ ] Blinking tab stops blinking when focused
- [ ] Overflow scroll works with 15+ tabs
- [ ] Keyboard shortcuts navigate tabs
- [ ] Context menu actions work
- [ ] ARIA labels are correct
- [ ] Focus indicators are visible
- [ ] Screen reader announces tab changes
- [ ] Reduced motion disables animations

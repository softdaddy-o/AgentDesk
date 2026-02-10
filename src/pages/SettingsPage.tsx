import { useUiStore } from '../stores/uiStore';
import { useSettingsStore } from '../stores/settingsStore';

export default function SettingsPage() {
    const theme = useUiStore((s) => s.theme);
    const setTheme = useUiStore((s) => s.setTheme);
    const { fontSize, fontFamily, defaultShell, setFontSize, setFontFamily, setDefaultShell } =
        useSettingsStore();

    return (
        <div className="settings-page">
            <h1>Settings</h1>

            <div className="settings-section">
                <h2>Appearance</h2>
                <div className="form-group">
                    <label>Theme</label>
                    <div className="tool-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                        <button
                            className={`tool-option ${theme === 'dark' ? 'selected' : ''}`}
                            onClick={() => setTheme('dark')}
                        >
                            Dark
                        </button>
                        <button
                            className={`tool-option ${theme === 'light' ? 'selected' : ''}`}
                            onClick={() => setTheme('light')}
                        >
                            Light
                        </button>
                    </div>
                </div>
                <div className="form-group">
                    <label>Font Size</label>
                    <input
                        type="number"
                        min={10}
                        max={24}
                        value={fontSize}
                        onChange={(e) => setFontSize(parseInt(e.target.value) || 14)}
                    />
                </div>
                <div className="form-group">
                    <label>Font Family</label>
                    <input
                        type="text"
                        value={fontFamily}
                        onChange={(e) => setFontFamily(e.target.value)}
                    />
                </div>
            </div>

            <div className="settings-section">
                <h2>Terminal</h2>
                <div className="form-group">
                    <label>Default Shell</label>
                    <input
                        type="text"
                        value={defaultShell}
                        onChange={(e) => setDefaultShell(e.target.value)}
                        placeholder="cmd.exe"
                    />
                </div>
            </div>

            <div className="settings-section">
                <h2>Keyboard Shortcuts</h2>
                <div className="shortcuts-list">
                    <div className="shortcut-row">
                        <span className="shortcut-keys">Ctrl+N</span>
                        <span>Dashboard (New Session)</span>
                    </div>
                    <div className="shortcut-row">
                        <span className="shortcut-keys">Ctrl+D</span>
                        <span>Dashboard</span>
                    </div>
                    <div className="shortcut-row">
                        <span className="shortcut-keys">Ctrl+Tab</span>
                        <span>Next Session</span>
                    </div>
                    <div className="shortcut-row">
                        <span className="shortcut-keys">Ctrl+Shift+Tab</span>
                        <span>Previous Session</span>
                    </div>
                    <div className="shortcut-row">
                        <span className="shortcut-keys">Ctrl+1-9</span>
                        <span>Jump to Session</span>
                    </div>
                    <div className="shortcut-row">
                        <span className="shortcut-keys">Ctrl+Shift+D</span>
                        <span>Split Horizontal</span>
                    </div>
                    <div className="shortcut-row">
                        <span className="shortcut-keys">Ctrl+Shift+E</span>
                        <span>Split Vertical</span>
                    </div>
                    <div className="shortcut-row">
                        <span className="shortcut-keys">Ctrl+Shift+W</span>
                        <span>Close Active Pane</span>
                    </div>
                </div>
            </div>

            <div className="settings-section">
                <h2>About</h2>
                <p className="about-text">
                    AgentDesk v0.1.0 - AI agent workstation
                </p>
            </div>
        </div>
    );
}

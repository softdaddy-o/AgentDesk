import { useUiStore } from '../stores/uiStore';

export default function SettingsPage() {
    const theme = useUiStore((s) => s.theme);
    const setTheme = useUiStore((s) => s.setTheme);

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
            </div>
            <div className="settings-section">
                <h2>Keyboard Shortcuts</h2>
                <div className="shortcuts-list">
                    <div className="shortcut-row">
                        <span className="shortcut-keys">Ctrl+N</span>
                        <span>New Session</span>
                    </div>
                    <div className="shortcut-row">
                        <span className="shortcut-keys">Ctrl+W</span>
                        <span>Close Session</span>
                    </div>
                    <div className="shortcut-row">
                        <span className="shortcut-keys">Ctrl+Tab</span>
                        <span>Next Session</span>
                    </div>
                    <div className="shortcut-row">
                        <span className="shortcut-keys">Ctrl+Shift+Tab</span>
                        <span>Previous Session</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

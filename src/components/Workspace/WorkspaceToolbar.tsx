import { useLayoutStore } from '../../stores/layoutStore';

export default function WorkspaceToolbar() {
    const activePaneId = useLayoutStore((s) => s.activePaneId);
    const splitPane = useLayoutStore((s) => s.splitPane);
    const resetLayout = useLayoutStore((s) => s.resetLayout);

    return (
        <div className="workspace-toolbar">
            <button
                className="pane-action-btn"
                onClick={() => splitPane(activePaneId, 'horizontal')}
                title="Split active pane left/right"
            >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <rect x="1" y="1" width="6" height="14" rx="1" stroke="currentColor" strokeWidth="1.5" />
                    <rect x="9" y="1" width="6" height="14" rx="1" stroke="currentColor" strokeWidth="1.5" />
                </svg>
            </button>
            <button
                className="pane-action-btn"
                onClick={() => splitPane(activePaneId, 'vertical')}
                title="Split active pane top/bottom"
            >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <rect x="1" y="1" width="14" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
                    <rect x="1" y="9" width="14" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
                </svg>
            </button>
            <button
                className="pane-action-btn"
                onClick={resetLayout}
                title="Reset to single pane"
            >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <rect x="1" y="1" width="14" height="14" rx="1" stroke="currentColor" strokeWidth="1.5" />
                </svg>
            </button>
        </div>
    );
}

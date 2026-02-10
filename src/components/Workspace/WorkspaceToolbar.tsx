import { useLayoutStore } from '../../stores/layoutStore';

export default function WorkspaceToolbar() {
    const splitDirection = useLayoutStore((s) => s.splitDirection);
    const splitHorizontal = useLayoutStore((s) => s.splitHorizontal);
    const splitVertical = useLayoutStore((s) => s.splitVertical);
    const splitGrid = useLayoutStore((s) => s.splitGrid);
    const closeSplit = useLayoutStore((s) => s.closeSplit);

    return (
        <div className="workspace-toolbar">
            <button
                className={`ws-tool-btn ${splitDirection === 'horizontal' ? 'active' : ''}`}
                onClick={splitHorizontal}
                title="Split left/right (Ctrl+Shift+D)"
            >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="1" y="1" width="6" height="14" rx="1" stroke="currentColor" strokeWidth="1.5" />
                    <rect x="9" y="1" width="6" height="14" rx="1" stroke="currentColor" strokeWidth="1.5" />
                </svg>
            </button>
            <button
                className={`ws-tool-btn ${splitDirection === 'vertical' ? 'active' : ''}`}
                onClick={splitVertical}
                title="Split top/bottom (Ctrl+Shift+E)"
            >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="1" y="1" width="14" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
                    <rect x="1" y="9" width="14" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
                </svg>
            </button>
            <button
                className={`ws-tool-btn ${splitDirection === 'grid' ? 'active' : ''}`}
                onClick={splitGrid}
                title="Grid 2x2 (Ctrl+Shift+G)"
            >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
                    <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
                    <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
                    <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
                </svg>
            </button>
            {splitDirection !== 'none' && (
                <button
                    className="ws-tool-btn ws-close-split"
                    onClick={closeSplit}
                    title="Close split (Ctrl+Shift+W)"
                >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <rect x="1" y="1" width="14" height="14" rx="1" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                </button>
            )}
        </div>
    );
}

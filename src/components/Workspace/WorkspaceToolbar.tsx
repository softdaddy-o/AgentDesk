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
                className={`toolbar-btn split-btn ${splitDirection === 'horizontal' ? 'active' : ''}`}
                onClick={splitHorizontal}
                title="Split horizontal (Ctrl+Shift+D)"
            >
                Split H
            </button>
            <button
                className={`toolbar-btn split-btn ${splitDirection === 'vertical' ? 'active' : ''}`}
                onClick={splitVertical}
                title="Split vertical (Ctrl+Shift+E)"
            >
                Split V
            </button>
            <button
                className={`toolbar-btn split-btn ${splitDirection === 'grid' ? 'active' : ''}`}
                onClick={splitGrid}
                title="Grid layout (Ctrl+Shift+G)"
            >
                Grid
            </button>
            {splitDirection !== 'none' && (
                <button
                    className="toolbar-btn split-btn"
                    onClick={closeSplit}
                    title="Close split (Ctrl+Shift+W)"
                >
                    Close Split
                </button>
            )}
        </div>
    );
}

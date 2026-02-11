import { useState } from 'react';
import './CellTitleBar.css';

interface CellTitleBarProps {
    title: string;
    sessionId?: string;
    onRename?: (newTitle: string) => void;
    onSplitHorizontal?: () => void;
    onSplitVertical?: () => void;
    onMaximize?: () => void;
    onClose?: () => void;
}

export function CellTitleBar({
    title,
    sessionId,
    onRename,
    onSplitHorizontal,
    onSplitVertical,
    onMaximize,
    onClose,
}: CellTitleBarProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(title);

    function handleDoubleClick() {
        if (onRename) {
            setIsEditing(true);
            setEditValue(title);
        }
    }

    function handleBlur() {
        if (editValue.trim() && editValue !== title) {
            onRename?.(editValue.trim());
        }
        setIsEditing(false);
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter') {
            handleBlur();
        } else if (e.key === 'Escape') {
            setIsEditing(false);
            setEditValue(title);
        }
    }

    return (
        <div className="cell-title-bar">
            <div className="cell-title-left">
                <span className="drag-handle" title="Drag to move or split">
                    ⋮⋮
                </span>
                {isEditing ? (
                    <input
                        type="text"
                        className="cell-title-input"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={handleBlur}
                        onKeyDown={handleKeyDown}
                        autoFocus
                    />
                ) : (
                    <span
                        className="cell-title-text"
                        onDoubleClick={handleDoubleClick}
                        title="Double-click to rename"
                    >
                        {title}
                    </span>
                )}
                {sessionId && (
                    <span className="cell-session-badge">{sessionId}</span>
                )}
            </div>

            <div className="cell-title-actions">
                {onSplitHorizontal && (
                    <button
                        className="cell-action-btn"
                        onClick={onSplitHorizontal}
                        title="Split Horizontal"
                    >
                        ⬌
                    </button>
                )}
                {onSplitVertical && (
                    <button
                        className="cell-action-btn"
                        onClick={onSplitVertical}
                        title="Split Vertical"
                    >
                        ⬍
                    </button>
                )}
                {onMaximize && (
                    <button
                        className="cell-action-btn"
                        onClick={onMaximize}
                        title="Maximize"
                    >
                        ⛶
                    </button>
                )}
                {onClose && (
                    <button
                        className="cell-action-btn cell-close-btn"
                        onClick={onClose}
                        title="Close"
                    >
                        ×
                    </button>
                )}
            </div>
        </div>
    );
}

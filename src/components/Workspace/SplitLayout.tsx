import { type ReactNode, useRef, useCallback } from 'react';
import { useLayoutStore } from '../../stores/layoutStore';

interface SplitLayoutProps {
    children: ReactNode[];
}

export default function SplitLayout({ children }: SplitLayoutProps) {
    const splitDirection = useLayoutStore((s) => s.splitDirection);
    const splitRatio = useLayoutStore((s) => s.splitRatio);
    const gridRatioH = useLayoutStore((s) => s.gridRatioH);
    const gridRatioV = useLayoutStore((s) => s.gridRatioV);
    const setSplitRatio = useLayoutStore((s) => s.setSplitRatio);
    const setGridRatioH = useLayoutStore((s) => s.setGridRatioH);
    const setGridRatioV = useLayoutStore((s) => s.setGridRatioV);
    const containerRef = useRef<HTMLDivElement>(null);

    const startDrag = useCallback(
        (axis: 'x' | 'y', setter: (ratio: number) => void) => (e: React.MouseEvent) => {
            e.preventDefault();
            const container = containerRef.current;
            if (!container) return;

            const rect = container.getBoundingClientRect();

            const onMove = (e: MouseEvent) => {
                const ratio = axis === 'x'
                    ? (e.clientX - rect.left) / rect.width
                    : (e.clientY - rect.top) / rect.height;
                setter(ratio);
            };

            const onUp = () => {
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
            };

            document.body.style.cursor = axis === 'x' ? 'col-resize' : 'row-resize';
            document.body.style.userSelect = 'none';
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        },
        [],
    );

    if (splitDirection === 'none') {
        return (
            <div ref={containerRef} className="split-layout split-none">
                {children[0]}
            </div>
        );
    }

    if (splitDirection === 'horizontal') {
        const pct = splitRatio * 100;
        return (
            <div ref={containerRef} className="split-layout split-horizontal">
                <div className="split-pane" style={{ width: `calc(${pct}% - 2px)` }}>
                    {children[0]}
                </div>
                <div
                    className="resize-handle resize-handle-h"
                    onMouseDown={startDrag('x', setSplitRatio)}
                />
                <div className="split-pane" style={{ width: `calc(${100 - pct}% - 2px)` }}>
                    {children[1]}
                </div>
            </div>
        );
    }

    if (splitDirection === 'vertical') {
        const pct = splitRatio * 100;
        return (
            <div ref={containerRef} className="split-layout split-vertical">
                <div className="split-pane" style={{ height: `calc(${pct}% - 2px)` }}>
                    {children[0]}
                </div>
                <div
                    className="resize-handle resize-handle-v"
                    onMouseDown={startDrag('y', setSplitRatio)}
                />
                <div className="split-pane" style={{ height: `calc(${100 - pct}% - 2px)` }}>
                    {children[1]}
                </div>
            </div>
        );
    }

    // Grid: 2x2
    const hPct = gridRatioH * 100;
    const vPct = gridRatioV * 100;
    return (
        <div ref={containerRef} className="split-layout split-grid-layout">
            {/* Top row */}
            <div className="split-grid-row" style={{ height: `calc(${vPct}% - 2px)` }}>
                <div className="split-pane" style={{ width: `calc(${hPct}% - 2px)` }}>
                    {children[0]}
                </div>
                <div
                    className="resize-handle resize-handle-h"
                    onMouseDown={startDrag('x', setGridRatioH)}
                />
                <div className="split-pane" style={{ width: `calc(${100 - hPct}% - 2px)` }}>
                    {children[1]}
                </div>
            </div>
            {/* Horizontal divider */}
            <div
                className="resize-handle resize-handle-v"
                onMouseDown={startDrag('y', setGridRatioV)}
            />
            {/* Bottom row */}
            <div className="split-grid-row" style={{ height: `calc(${100 - vPct}% - 2px)` }}>
                <div className="split-pane" style={{ width: `calc(${hPct}% - 2px)` }}>
                    {children[2]}
                </div>
                <div
                    className="resize-handle resize-handle-h"
                    onMouseDown={startDrag('x', setGridRatioH)}
                />
                <div className="split-pane" style={{ width: `calc(${100 - hPct}% - 2px)` }}>
                    {children[3]}
                </div>
            </div>
        </div>
    );
}

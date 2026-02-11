import { useRef, useCallback, useEffect } from 'react';
import { useLayoutStore, type PaneNode } from '../../stores/layoutStore';
import PaneView from './PaneView';

export default function PaneTree({ node }: { node: PaneNode }) {
    if (node.type === 'leaf') {
        return <PaneView paneId={node.id} sessionId={node.sessionId} />;
    }

    return (
        <SplitContainer
            key={node.id}
            splitId={node.id}
            direction={node.direction}
            ratio={node.ratio}
            left={node.children[0]}
            right={node.children[1]}
        />
    );
}

function SplitContainer({
    splitId,
    direction,
    ratio,
    left,
    right,
}: {
    splitId: string;
    direction: 'horizontal' | 'vertical';
    ratio: number;
    left: PaneNode;
    right: PaneNode;
}) {
    const setSplitRatio = useLayoutStore((s) => s.setSplitRatio);
    const containerRef = useRef<HTMLDivElement>(null);
    const dragCleanupRef = useRef<(() => void) | null>(null);

    // Cleanup drag listeners if component unmounts mid-drag
    useEffect(() => {
        return () => {
            dragCleanupRef.current?.();
        };
    }, []);

    const startDrag = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault();
            const container = containerRef.current;
            if (!container) return;
            const rect = container.getBoundingClientRect();
            const isH = direction === 'horizontal';

            const onMove = (e: MouseEvent) => {
                const pos = isH
                    ? (e.clientX - rect.left) / rect.width
                    : (e.clientY - rect.top) / rect.height;
                setSplitRatio(splitId, pos);
            };

            const cleanup = () => {
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
                dragCleanupRef.current = null;
            };

            const onUp = () => cleanup();

            dragCleanupRef.current = cleanup;
            document.body.style.cursor = isH ? 'col-resize' : 'row-resize';
            document.body.style.userSelect = 'none';
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        },
        [direction, splitId, setSplitRatio],
    );

    const isH = direction === 'horizontal';
    const firstSize = `calc(${ratio * 100}% - 2px)`;
    const secondSize = `calc(${(1 - ratio) * 100}% - 2px)`;

    return (
        <div
            ref={containerRef}
            className={`split-container ${isH ? 'split-h' : 'split-v'}`}
        >
            <div className="split-child" style={isH ? { width: firstSize } : { height: firstSize }}>
                <PaneTree key={left.id} node={left} />
            </div>
            <div
                className={`resize-handle ${isH ? 'resize-handle-h' : 'resize-handle-v'}`}
                onMouseDown={startDrag}
            />
            <div className="split-child" style={isH ? { width: secondSize } : { height: secondSize }}>
                <PaneTree key={right.id} node={right} />
            </div>
        </div>
    );
}

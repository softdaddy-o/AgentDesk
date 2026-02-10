import type { ReactNode } from 'react';
import { useLayoutStore, type SplitDirection } from '../../stores/layoutStore';

interface SplitLayoutProps {
    children: ReactNode[];
}

const LAYOUT_CLASS: Record<SplitDirection, string> = {
    none: 'split-none',
    horizontal: 'split-horizontal',
    vertical: 'split-vertical',
    grid: 'split-grid',
};

export default function SplitLayout({ children }: SplitLayoutProps) {
    const splitDirection = useLayoutStore((s) => s.splitDirection);

    return (
        <div className={`split-layout ${LAYOUT_CLASS[splitDirection]}`}>
            {children}
        </div>
    );
}

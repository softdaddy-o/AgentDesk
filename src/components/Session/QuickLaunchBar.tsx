import { TOOL_LABELS } from '../../lib/constants';
import type { CliTool } from '../../lib/types';

interface QuickLaunchBarProps {
    onLaunch: (tool: CliTool) => void;
}

const QUICK_TOOLS: CliTool[] = ['ClaudeCode', 'Codex', 'Aider', 'Cline'];

export default function QuickLaunchBar({ onLaunch }: QuickLaunchBarProps) {
    return (
        <div className="quick-launch-bar">
            <span className="quick-launch-label">Quick Launch:</span>
            {QUICK_TOOLS.map((tool) => (
                <button
                    key={tool}
                    className="quick-launch-btn"
                    onClick={() => onLaunch(tool)}
                >
                    {TOOL_LABELS[tool]}
                </button>
            ))}
        </div>
    );
}

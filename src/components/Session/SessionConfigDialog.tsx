import { useState } from 'react';
import { TOOL_LABELS } from '../../lib/constants';
import type { CliTool } from '../../lib/types';

interface SessionConfigDialogProps {
    onClose: () => void;
    onCreate: (tool: CliTool, name: string, workingDir: string) => void;
}

export default function SessionConfigDialog({ onClose, onCreate }: SessionConfigDialogProps) {
    const [tool, setTool] = useState<CliTool>('ClaudeCode');
    const [name, setName] = useState('');
    const [workingDir, setWorkingDir] = useState('');

    const tools: CliTool[] = ['ClaudeCode', 'Codex', 'Aider', 'Cline', 'Custom'];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onCreate(tool, name, workingDir);
    };

    return (
        <div className="dialog-overlay" onClick={onClose}>
            <form className="dialog" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
                <h2>New Session</h2>
                <div className="form-group">
                    <label>Tool</label>
                    <div className="tool-grid">
                        {tools.map((t) => (
                            <button
                                type="button"
                                key={t}
                                className={`tool-option ${tool === t ? 'selected' : ''}`}
                                onClick={() => setTool(t)}
                            >
                                {TOOL_LABELS[t] ?? t}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="form-group">
                    <label>Session Name</label>
                    <input
                        type="text"
                        placeholder="My Session"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoFocus
                    />
                </div>
                <div className="form-group">
                    <label>Working Directory</label>
                    <input
                        type="text"
                        placeholder="C:\projects\my-app"
                        value={workingDir}
                        onChange={(e) => setWorkingDir(e.target.value)}
                    />
                </div>
                <div className="dialog-actions">
                    <button type="button" className="btn-secondary" onClick={onClose}>
                        Cancel
                    </button>
                    <button type="submit" className="btn-primary">
                        Create
                    </button>
                </div>
            </form>
        </div>
    );
}

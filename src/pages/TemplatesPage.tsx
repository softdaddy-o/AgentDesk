import { useEffect, useState } from 'react';
import { useTemplateStore } from '../stores/templateStore';
import { TOOL_LABELS } from '../lib/constants';
import type { CliTool, CreateTemplate, PromptTemplate } from '../lib/types';

export default function TemplatesPage() {
    const { templates, loading, fetchTemplates, createTemplate, deleteTemplate } = useTemplateStore();
    const [showEditor, setShowEditor] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<PromptTemplate | null>(null);

    useEffect(() => {
        fetchTemplates();
    }, [fetchTemplates]);

    const handleCreate = async (input: CreateTemplate) => {
        await createTemplate(input);
        setShowEditor(false);
    };

    const handleEdit = (template: PromptTemplate) => {
        setEditingTemplate(template);
        setShowEditor(true);
    };

    const handleDelete = async (id: string) => {
        await deleteTemplate(id);
    };

    return (
        <div className="templates-page">
            <div className="dashboard-header">
                <h1>Templates</h1>
                <button className="btn-primary" onClick={() => { setEditingTemplate(null); setShowEditor(true); }}>
                    + New Template
                </button>
            </div>

            {loading && templates.length === 0 ? (
                <div className="empty-state">
                    <p>Loading templates...</p>
                </div>
            ) : templates.length === 0 ? (
                <div className="empty-state">
                    <h2>No templates yet</h2>
                    <p>Create reusable prompt templates for your AI agent sessions.</p>
                    <button className="btn-primary" onClick={() => setShowEditor(true)}>
                        + Create First Template
                    </button>
                </div>
            ) : (
                <div className="template-list">
                    {templates.map((t) => (
                        <div key={t.id} className="template-card">
                            <div className="template-card-header">
                                <span className="template-name">{t.name}</span>
                                <span className="session-tool">{TOOL_LABELS[t.tool] ?? t.tool}</span>
                            </div>
                            {t.description && (
                                <p className="template-desc">{t.description}</p>
                            )}
                            <pre className="template-prompt">{t.prompt}</pre>
                            {t.tags.length > 0 && (
                                <div className="template-tags">
                                    {t.tags.map((tag) => (
                                        <span key={tag} className="tag">{tag}</span>
                                    ))}
                                </div>
                            )}
                            <div className="template-actions">
                                <button className="toolbar-btn" onClick={() => handleEdit(t)}>Edit</button>
                                <button className="toolbar-btn stop-btn" onClick={() => handleDelete(t.id)}>Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showEditor && (
                <TemplateEditor
                    template={editingTemplate}
                    onSave={handleCreate}
                    onClose={() => setShowEditor(false)}
                />
            )}
        </div>
    );
}

function TemplateEditor({
    template,
    onSave,
    onClose,
}: {
    template: PromptTemplate | null;
    onSave: (input: CreateTemplate) => void;
    onClose: () => void;
}) {
    const [name, setName] = useState(template?.name ?? '');
    const [tool, setTool] = useState<string>(template?.tool ?? 'ClaudeCode');
    const [prompt, setPrompt] = useState(template?.prompt ?? '');
    const [description, setDescription] = useState(template?.description ?? '');
    const [tagsStr, setTagsStr] = useState(template?.tags.join(', ') ?? '');

    const updateTemplate = useTemplateStore((s) => s.updateTemplate);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const tags = tagsStr.split(',').map((s) => s.trim()).filter(Boolean);
        if (template) {
            await updateTemplate(template.id, { name, tool, prompt, description, tags });
            onClose();
        } else {
            onSave({ name, tool, prompt, description, tags });
        }
    };

    const tools: CliTool[] = ['ClaudeCode', 'Codex', 'Aider', 'Cline', 'Custom'];

    return (
        <div className="dialog-overlay" onClick={onClose}>
            <form className="dialog template-editor-dialog" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
                <h2>{template ? 'Edit Template' : 'New Template'}</h2>
                <div className="form-group">
                    <label>Name</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Template name" autoFocus />
                </div>
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
                    <label>Description</label>
                    <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What this template does" />
                </div>
                <div className="form-group">
                    <label>Prompt</label>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Enter your prompt template..."
                        rows={8}
                    />
                </div>
                <div className="form-group">
                    <label>Tags (comma-separated)</label>
                    <input value={tagsStr} onChange={(e) => setTagsStr(e.target.value)} placeholder="coding, debug, review" />
                </div>
                <div className="dialog-actions">
                    <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                    <button type="submit" className="btn-primary">{template ? 'Update' : 'Create'}</button>
                </div>
            </form>
        </div>
    );
}

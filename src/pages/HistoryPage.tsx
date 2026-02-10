import { useState, useCallback } from 'react';
import { useHistoryStore } from '../stores/historyStore';

export default function HistoryPage() {
    const { entries, total, loading, search, loadMore } = useHistoryStore();
    const [searchInput, setSearchInput] = useState('');

    const handleSearch = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            search(searchInput);
        },
        [searchInput, search],
    );

    const handleExport = useCallback(() => {
        const content = entries.map((e) => `[${e.createdAt}] ${e.sessionId}\n${e.content}`).join('\n---\n');
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `agentdesk-history-${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    }, [entries]);

    return (
        <div className="history-page">
            <div className="dashboard-header">
                <h1>History</h1>
                {entries.length > 0 && (
                    <button className="btn-secondary" onClick={handleExport}>
                        Export
                    </button>
                )}
            </div>

            <form className="history-search-bar" onSubmit={handleSearch}>
                <input
                    type="text"
                    className="history-search-input"
                    placeholder="Search across all sessions..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                />
                <button type="submit" className="btn-primary">
                    Search
                </button>
            </form>

            {loading && entries.length === 0 ? (
                <div className="empty-state">
                    <p>Searching...</p>
                </div>
            ) : entries.length === 0 ? (
                <div className="empty-state">
                    <h2>No history found</h2>
                    <p>Session output will appear here after running commands.</p>
                </div>
            ) : (
                <>
                    <div className="history-results-info">
                        Showing {entries.length} of {total} results
                    </div>
                    <div className="history-entries">
                        {entries.map((entry) => (
                            <div key={entry.id} className="history-entry">
                                <div className="history-entry-header">
                                    <span className="history-session-id">{entry.sessionId.slice(0, 8)}</span>
                                    <span className="history-timestamp">{entry.createdAt}</span>
                                </div>
                                <pre
                                    className="history-content"
                                    dangerouslySetInnerHTML={{ __html: entry.content }}
                                />
                            </div>
                        ))}
                    </div>
                    {entries.length < total && (
                        <button className="btn-secondary load-more" onClick={loadMore} disabled={loading}>
                            {loading ? 'Loading...' : 'Load More'}
                        </button>
                    )}
                </>
            )}
        </div>
    );
}

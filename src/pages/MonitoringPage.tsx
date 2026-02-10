import { useEffect } from 'react';
import { useMonitoringStore } from '../stores/monitoringStore';
import { formatCost, formatTokens } from '../lib/cost-calculator';

export default function MonitoringPage() {
    const { summary, loading, fetchSummary } = useMonitoringStore();

    useEffect(() => {
        fetchSummary();
    }, [fetchSummary]);

    return (
        <div className="monitoring-page">
            <div className="dashboard-header">
                <h1>Monitoring</h1>
                <button className="btn-secondary" onClick={fetchSummary} disabled={loading}>
                    {loading ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>

            {!summary ? (
                <div className="empty-state">
                    <p>{loading ? 'Loading...' : 'No usage data yet.'}</p>
                </div>
            ) : (
                <>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <span className="stat-label">Total Cost</span>
                            <span className="stat-value cost">{formatCost(summary.totalCostUsd)}</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-label">Input Tokens</span>
                            <span className="stat-value">{formatTokens(summary.totalInputTokens)}</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-label">Output Tokens</span>
                            <span className="stat-value">{formatTokens(summary.totalOutputTokens)}</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-label">Sessions Tracked</span>
                            <span className="stat-value">{summary.sessionCount}</span>
                        </div>
                    </div>

                    {summary.perSession.length > 0 && (
                        <div className="cost-breakdown">
                            <h2>Cost by Session</h2>
                            <table className="cost-table">
                                <thead>
                                    <tr>
                                        <th>Session</th>
                                        <th>Input</th>
                                        <th>Output</th>
                                        <th>Cost</th>
                                        <th>Records</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {summary.perSession.map((s) => (
                                        <tr key={s.sessionId}>
                                            <td className="session-id-cell">{s.sessionId.slice(0, 8)}</td>
                                            <td>{formatTokens(s.totalInputTokens)}</td>
                                            <td>{formatTokens(s.totalOutputTokens)}</td>
                                            <td className="cost-cell">{formatCost(s.totalCostUsd)}</td>
                                            <td>{s.recordCount}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

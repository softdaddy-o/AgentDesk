// Token-to-USD pricing per model (per 1M tokens)
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
    // Claude
    'claude-opus-4-6': { input: 15.0, output: 75.0 },
    'claude-sonnet-4-5': { input: 3.0, output: 15.0 },
    'claude-haiku-4-5': { input: 0.8, output: 4.0 },
    // OpenAI
    'gpt-4o': { input: 2.5, output: 10.0 },
    'gpt-4o-mini': { input: 0.15, output: 0.6 },
    'o1': { input: 15.0, output: 60.0 },
    'o3-mini': { input: 1.1, output: 4.4 },
    // Default fallback
    default: { input: 3.0, output: 15.0 },
};

export function calculateCost(
    inputTokens: number,
    outputTokens: number,
    model: string,
): number {
    const pricing = MODEL_PRICING[model] ?? MODEL_PRICING.default;
    return (
        (inputTokens / 1_000_000) * pricing.input +
        (outputTokens / 1_000_000) * pricing.output
    );
}

export function formatCost(usd: number): string {
    if (usd < 0.01) return `$${(usd * 100).toFixed(2)}c`;
    return `$${usd.toFixed(4)}`;
}

export function formatTokens(count: number): string {
    if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
    if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
    return count.toString();
}

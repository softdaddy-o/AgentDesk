// Strip ANSI escape codes and convert to plain text/markdown
const ANSI_REGEX = /\x1B\[[0-9;]*[A-Za-z]|\x1B\].*?(?:\x07|\x1B\\)|\x1B[()][AB012]|\x1B\[[\?]?[0-9;]*[hl]/g;

export function stripAnsi(text: string): string {
    return text.replace(ANSI_REGEX, '');
}

export function ansiToMarkdown(text: string): string {
    // Strip ANSI codes
    let clean = stripAnsi(text);

    // Collapse excessive blank lines
    clean = clean.replace(/\n{4,}/g, '\n\n\n');

    // Trim trailing whitespace per line
    clean = clean
        .split('\n')
        .map((line) => line.trimEnd())
        .join('\n');

    return clean;
}

use crate::models::monitoring::RecordTokenUsage;

/// Scans text output for token usage patterns from various AI CLI tools.
/// Returns extracted token records when patterns are detected.
pub fn extract_token_usage(text: &str, session_id: &str) -> Vec<RecordTokenUsage> {
    let mut results = Vec::new();

    // Claude Code patterns:
    //   "Total cost: $0.1234"
    //   "Total input tokens: 12345" / "Total output tokens: 6789"
    //   "Session cost: $0.12 (12K input, 6K output)"
    if let Some(record) = parse_claude_code(text, session_id) {
        results.push(record);
    }

    // Aider pattern:
    //   "Tokens: 12.3k sent, 4.5k received. Cost: $0.04"
    if let Some(record) = parse_aider(text, session_id) {
        results.push(record);
    }

    results
}

fn parse_claude_code(text: &str, session_id: &str) -> Option<RecordTokenUsage> {
    // Pattern: "Total cost: $X.XX" with nearby token counts
    let cost = extract_dollar_amount(text, "total cost")?;

    let input_tokens = extract_token_count(text, &["input tokens", "input"])
        .unwrap_or(0);
    let output_tokens = extract_token_count(text, &["output tokens", "output"])
        .unwrap_or(0);

    Some(RecordTokenUsage {
        session_id: session_id.to_string(),
        input_tokens,
        output_tokens,
        model: "claude".to_string(),
        cost_usd: cost,
    })
}

fn parse_aider(text: &str, session_id: &str) -> Option<RecordTokenUsage> {
    // Pattern: "Tokens: 12.3k sent, 4.5k received. Cost: $0.04"
    let lower = text.to_lowercase();
    if !lower.contains("tokens:") || !lower.contains("sent") || !lower.contains("cost:") {
        return None;
    }

    let cost = extract_dollar_amount(text, "cost")?;

    // Parse "12.3k sent"
    let input_tokens = parse_k_number(&lower, "sent").unwrap_or(0);
    // Parse "4.5k received"
    let output_tokens = parse_k_number(&lower, "received").unwrap_or(0);

    Some(RecordTokenUsage {
        session_id: session_id.to_string(),
        input_tokens,
        output_tokens,
        model: "aider".to_string(),
        cost_usd: cost,
    })
}

/// Extract a dollar amount after a keyword, e.g., "total cost: $1.23"
fn extract_dollar_amount(text: &str, keyword: &str) -> Option<f64> {
    let lower = text.to_lowercase();
    let pos = lower.find(keyword)?;
    let after = &text[pos + keyword.len()..];
    // Find the $ sign
    let dollar_pos = after.find('$')?;
    let number_start = dollar_pos + 1;
    let number_str: String = after[number_start..]
        .chars()
        .take_while(|c| c.is_ascii_digit() || *c == '.')
        .collect();
    number_str.parse::<f64>().ok()
}

/// Extract token count near a keyword. Handles "12,345" and "12345" and "12K" and "12.3K"
fn extract_token_count(text: &str, keywords: &[&str]) -> Option<i64> {
    let lower = text.to_lowercase();
    for keyword in keywords {
        if let Some(pos) = lower.find(keyword) {
            // Look before the keyword for a number
            let before = &text[..pos];
            if let Some(n) = parse_nearby_number(before, true) {
                return Some(n);
            }
            // Look after the keyword for a number
            let after = &text[pos + keyword.len()..];
            if let Some(n) = parse_nearby_number(after, false) {
                return Some(n);
            }
        }
    }
    None
}

/// Parse a number near the boundary of a string (before keyword or after keyword)
fn parse_nearby_number(text: &str, look_backwards: bool) -> Option<i64> {
    let trimmed = text.trim().trim_matches(':').trim();
    if look_backwards {
        // Get the last number-like sequence
        let num_str: String = trimmed
            .chars()
            .rev()
            .take_while(|c| c.is_ascii_digit() || *c == ',' || *c == '.' || *c == 'k' || *c == 'K')
            .collect::<String>()
            .chars()
            .rev()
            .collect();
        parse_token_number(&num_str)
    } else {
        // Get the first number-like sequence
        let start = trimmed.find(|c: char| c.is_ascii_digit())?;
        let num_str: String = trimmed[start..]
            .chars()
            .take_while(|c| c.is_ascii_digit() || *c == ',' || *c == '.' || *c == 'k' || *c == 'K')
            .collect();
        parse_token_number(&num_str)
    }
}

/// Parse numbers like "12345", "12,345", "12K", "12.3k"
fn parse_token_number(s: &str) -> Option<i64> {
    let s = s.trim();
    if s.is_empty() {
        return None;
    }
    let lower = s.to_lowercase();
    if lower.ends_with('k') {
        let num_part = &lower[..lower.len() - 1].replace(',', "");
        let val: f64 = num_part.parse().ok()?;
        Some((val * 1000.0) as i64)
    } else {
        let cleaned = s.replace(',', "");
        // If it has a decimal, parse as float first
        if cleaned.contains('.') {
            let val: f64 = cleaned.parse().ok()?;
            Some(val as i64)
        } else {
            cleaned.parse::<i64>().ok()
        }
    }
}

/// Parse "12.3k" before a keyword like "sent" or "received"
fn parse_k_number(text: &str, keyword: &str) -> Option<i64> {
    let pos = text.find(keyword)?;
    let before = text[..pos].trim();
    // Get the number right before the keyword
    let parts: Vec<&str> = before.split_whitespace().collect();
    let num_str = parts.last()?;
    parse_token_number(num_str)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_claude_code_cost() {
        let text = "Total cost: $1.23\nTotal input tokens: 12345\nTotal output tokens: 6789";
        let results = extract_token_usage(text, "test-session");
        assert_eq!(results.len(), 1);
        assert_eq!(results[0].cost_usd, 1.23);
        assert_eq!(results[0].input_tokens, 12345);
        assert_eq!(results[0].output_tokens, 6789);
    }

    #[test]
    fn test_aider_pattern() {
        let text = "Tokens: 12.3k sent, 4.5k received. Cost: $0.04";
        let results = extract_token_usage(text, "test-session");
        assert!(!results.is_empty());
        let aider = results.iter().find(|r| r.model == "aider").unwrap();
        assert_eq!(aider.cost_usd, 0.04);
        assert_eq!(aider.input_tokens, 12300);
        assert_eq!(aider.output_tokens, 4500);
    }

    #[test]
    fn test_no_match() {
        let text = "Hello world, this is normal output";
        let results = extract_token_usage(text, "test-session");
        assert!(results.is_empty());
    }

    #[test]
    fn test_parse_k_numbers() {
        assert_eq!(parse_token_number("12.3k"), Some(12300));
        assert_eq!(parse_token_number("12K"), Some(12000));
        assert_eq!(parse_token_number("12,345"), Some(12345));
        assert_eq!(parse_token_number("12345"), Some(12345));
    }
}

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

interface MarkdownViewProps {
    content: string;
}

export default function MarkdownView({ content }: MarkdownViewProps) {
    return (
        <div className="markdown-view">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}

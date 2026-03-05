import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer = ({ content }: MarkdownRendererProps) => {
  return (
    <div className="prose prose-invert max-w-none prose-slate prose-headings:text-accent prose-a:text-accent hover:prose-a:text-indigo-300">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { DocsLayout } from '../components/Docs/DocsLayout';
import { MarkdownRenderer } from '../components/Docs/MarkdownRenderer';

export const DocsPage = () => {
  const [content, setContent] = useState('');

  useEffect(() => {
    // Basic loading logic for Phase 1
    import('../data/doc/welcome.md?raw').then(module => {
      setContent(module.default);
    });
  }, []);
  
  return (
    <DocsLayout>
      <MarkdownRenderer content={content} />
    </DocsLayout>
  );
};

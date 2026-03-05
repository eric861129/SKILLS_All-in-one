import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DocsLayout } from '../components/Docs/DocsLayout';
import { MarkdownRenderer } from '../components/Docs/MarkdownRenderer';

export const DocsPage = () => {
  const { slug } = useParams();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const fileName = slug || 'welcome';
    
    // Use dynamic import with raw loader if available or standard fetch/import
    // Vite supports ?raw for importing files as strings
    const loadContent = async () => {
      try {
        let module;
        switch(fileName) {
          case 'welcome':
            module = await import('../data/doc/welcome.md?raw');
            break;
          case 'what-is-a-skill':
            module = await import('../data/doc/what-is-a-skill.md?raw');
            break;
          case 'supported-agents':
            module = await import('../data/doc/supported-agents.md?raw');
            break;
          case 'security':
            module = await import('../data/doc/security.md?raw');
            break;
          default:
            module = await import('../data/doc/welcome.md?raw');
        }
        setContent(module.default);
      } catch (error) {
        console.error('Failed to load doc:', error);
        setContent('# Error\nFailed to load documentation page.');
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [slug]);
  
  return (
    <DocsLayout>
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
        </div>
      ) : (
        <MarkdownRenderer content={content} />
      )}
    </DocsLayout>
  );
};

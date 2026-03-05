import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useLanguage } from '../hooks/useLanguage';

export const DocsPage = () => {
  const { t } = useLanguage();
  const [content, setContent] = useState('');

  useEffect(() => {
    // Basic loading logic for Phase 1
    import('../data/doc/welcome.md?raw').then(module => {
      setContent(prev => module.default);
    });
  }, []);
  
  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-black tracking-tighter mb-8 text-accent">
          {t('docsTitle') || 'Documentation'}
        </h1>
        <div className="prose prose-invert max-w-none prose-slate">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

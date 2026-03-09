import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { List } from 'lucide-react';
import { DocsLayout } from '../components/Docs/DocsLayout';
import { MarkdownRenderer } from '../components/Docs/MarkdownRenderer';
import { AgentWizard } from '../components/AgentWizard';
import { SeoHead } from '../components/SeoHead';
import { getDocPageBySlug, loadDocContent } from '../data/docs';
import { useLanguage } from '../hooks/useLanguage';
import { buildDocsSeo } from '../seo/metadata';

interface Heading {
  id: string;
  text: string;
  level: number;
}

export const DocsPage = () => {
  const { slug } = useParams();
  const { language } = useLanguage();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [headings, setHeadings] = useState<Heading[]>([]);
  const docPage = getDocPageBySlug(slug);

  useEffect(() => {
    setLoading(true);
    
    const loadContent = async () => {
      try {
        const text = await loadDocContent(slug);
        setContent(text);
        
        // Extract headings for TOC
        const extractedHeadings: Heading[] = [];
        // Use a global regex to find all headings
        const headingRegex = /^(#{1,3})\s+(.+)$/gm;
        let match;
        while ((match = headingRegex.exec(text)) !== null) {
          const level = match[1].length;
          const textContent = match[2].trim();
          const id = textContent.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
          extractedHeadings.push({ id, text: textContent, level });
        }
        setHeadings(extractedHeadings);
      } catch (error) {
        console.error('Failed to load doc:', error);
        setContent('# Error\nFailed to load documentation page.');
        setHeadings([]);
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [slug]);
  
  return (
    <DocsLayout>
      <SeoHead meta={buildDocsSeo(docPage, language)} />
      <div className="flex flex-col lg:flex-row gap-12">
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
            </div>
          ) : (
            <>
              <MarkdownRenderer content={content} />
              
              {/* Show AgentWizard on the welcome page */}
              {(!slug || slug === 'welcome') && (
                <div className="mt-16 pt-16 border-t border-slate-800">
                  <h2 className="text-3xl font-black text-white tracking-tight mb-8">Setup Wizard</h2>
                  <AgentWizard />
                </div>
              )}
            </>
          )}
        </div>
        
        {/* TOC Sidebar */}
        {!loading && headings.length > 0 && (
          <aside className="lg:w-64 flex-shrink-0">
            <div className="sticky top-12 p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-4 text-accent">
                <List size={18} />
                <span className="font-bold text-sm tracking-widest uppercase">Content</span>
              </div>
              <ul className="space-y-3">
                {headings.map((heading) => (
                  <li 
                    key={heading.id} 
                    style={{ paddingLeft: `${(heading.level - 1) * 16}px` }}
                  >
                    <a 
                      href={`#${heading.id}`}
                      className="text-sm text-slate-400 hover:text-accent transition-colors block"
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById(heading.id)?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      {heading.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        )}
      </div>
    </DocsLayout>
  );
};

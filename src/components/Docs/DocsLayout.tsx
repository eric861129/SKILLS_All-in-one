import React from 'react';
import { NavLink } from 'react-router-dom';
import { Book, ChevronRight, Menu, X } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';

interface DocsLayoutProps {
  children: React.ReactNode;
}

export const DocsLayout = ({ children }: DocsLayoutProps) => {
  const { t } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navItems = [
    { path: '/docs', label: 'Welcome', id: 'welcome' },
    { path: '/docs/what-is-a-skill', label: 'What is a Skill?', id: 'what-is-a-skill' },
    { path: '/docs/supported-agents', label: 'Supported Agents', id: 'supported-agents' },
    { path: '/docs/security', label: 'Security', id: 'security' },
  ];

  const sidebarContent = (
    <nav 
      className="flex flex-col gap-1 py-4 px-2" 
      role="navigation"
      data-testid="docs-nav"
    >
      <div className="flex items-center gap-2 px-4 mb-6 text-accent">
        <Book size={20} />
        <span className="font-black tracking-tight text-lg uppercase">{t('docsTitle') || 'Docs'}</span>
      </div>
      
      {navItems.map((item) => (
        <NavLink
          key={item.id}
          to={item.path}
          end
          className={({ isActive }) => `
            flex items-center justify-between px-4 py-2 rounded-xl transition-all duration-200
            ${isActive 
              ? 'bg-accent/10 text-accent font-bold border border-accent/20' 
              : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }
          `}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <span>{item.label}</span>
          <ChevronRight size={14} className="opacity-50" />
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-72 border-r border-slate-800 bg-slate-900/30 backdrop-blur-xl sticky top-0 h-screen overflow-y-auto">
        {sidebarContent}
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 inset-x-0 h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-2 text-accent">
          <Book size={20} />
          <span className="font-black tracking-tight">{t('docsTitle') || 'Docs'}</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-slate-400 hover:text-white transition-colors"
          aria-label="Toggle Menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-slate-950 pt-16">
          {sidebarContent}
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 w-full md:pt-0 pt-16 h-screen overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6 md:p-12">
          {children}
        </div>
      </main>
    </div>
  );
};

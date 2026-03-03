import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export const ScrollToTop = () => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const onScroll = () => setVisible(window.scrollY > 600);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <button
            onClick={scrollToTop}
            aria-label="Scroll to top"
            className={`fixed bottom-6 left-6 z-40 bg-slate-900/90 backdrop-blur-md border border-slate-800 p-3 rounded-xl shadow-2xl text-slate-400 hover:text-blue-400 hover:border-slate-700 hover:-translate-y-0.5 active:scale-95 transition-all duration-[var(--duration-normal)] ${visible
                    ? 'opacity-100 scale-100 pointer-events-auto'
                    : 'opacity-0 scale-90 pointer-events-none'
                }`}
        >
            <ArrowUp className="w-5 h-5" />
        </button>
    );
};

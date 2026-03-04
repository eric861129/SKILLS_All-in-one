import { useState, useEffect } from 'react';
import Giscus from '@giscus/react';
import { useLanguage } from '../hooks/useLanguage';
import { MessageSquare } from 'lucide-react';

interface GiscusCommentsProps {
    skillId: number;
    skillName: string;
}

export const GiscusComments = ({ skillId, skillName }: GiscusCommentsProps) => {
    const { language } = useLanguage();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="w-full mt-16 pt-8 border-t border-slate-900 animate-pulse">
                <div className="h-8 w-48 bg-slate-800 rounded mb-8"></div>
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl h-64 w-full"></div>
            </div>
        );
    }

    // Mapping term ensures comments are isolated per skill
    const term = `[Skill ${skillId}] ${skillName}`;

    return (
        <section className="mt-16 pt-10 border-t border-slate-900/50">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-8 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                {language === 'zh' ? '開發者討論' : 'Developer Discussions'}
            </h2>

            <div className="bg-slate-950 rounded-2xl">
                <Giscus
                    repo="eric861129/SKILLS_All-in-one"
                    repoId="R_kgDON2P3xw"
                    category="Announcements"
                    categoryId="DIC_kwDON2P3x84Cm6-u"
                    mapping="specific"
                    term={term}
                    reactionsEnabled="1"
                    emitMetadata="0"
                    inputPosition="top"
                    theme="transparent_dark"
                    lang={language === 'zh' ? 'zh-TW' : 'en'}
                    loading="lazy"
                    strict="0"
                />
            </div>
        </section>
    );
};

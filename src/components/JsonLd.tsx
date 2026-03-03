// ─── JSON-LD 結構化資料 ─────────────────────────
export const JsonLd = () => (
    <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
            __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebApplication",
                "name": "SKILLS All-in-one",
                "url": "https://huangchiyu.com/SKILLS_All-in-one",
                "description": "A curated collection of 100+ professional AI Agent skills for Claude, ChatGPT, and other AI assistants.",
                "applicationCategory": "DeveloperApplication",
                "operatingSystem": "Web",
                "offers": {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "USD"
                },
                "author": {
                    "@type": "Person",
                    "name": "Eric Huang",
                    "url": "https://huangchiyu.com"
                }
            })
        }}
    />
);

const LINKS = [
    { label: 'Come funziona', href: '#process' },
    { label: 'Strutture', href: '#properties' },
    { label: 'Community', href: '#community' },
    { label: 'Contatto', href: '#waitlist' },
    { label: 'Privacy', href: '#' },
];

function IconInstagram() {
    return (
        <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
            <rect x="2" y="2" width="20" height="20" rx="5.5" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
        </svg>
    );
}

function IconLinkedIn() {
    return (
        <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
            <rect x="2" y="2" width="20" height="20" rx="4" stroke="currentColor" strokeWidth="1.5" />
            <path d="M7 10v7M7 7.5v.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M12 17v-4a2.5 2.5 0 015 0v4M12 10v2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    );
}

export default function Footer() {
    return (
        <footer
            className="px-6 md:px-10 pt-10 pb-8"
            style={{ borderTop: '1px solid var(--border)' }}
        >
            <div className="max-w-content mx-auto">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-8">

                    {/* Left: wordmark + copyright */}
                    <div>
                        <a href="#" className="font-sans font-medium text-textPrimary text-base flex items-center gap-1">
                            <span className="text-accent">·</span>Digitalands
                        </a>
                        <p className="text-xs text-textMuted mt-1 font-mono">
                            © 2025 Digitalands · Marina di Ragusa, Sicilia
                        </p>
                    </div>

                    {/* Right: links + socials */}
                    <div className="flex flex-wrap items-center gap-6">
                        {LINKS.map(l => (
                            <a
                                key={l.href + l.label}
                                href={l.href}
                                className="text-xs text-textMuted hover:text-textPrimary transition-colors duration-200 font-mono tracking-wider uppercase"
                            >
                                {l.label}
                            </a>
                        ))}
                        <div className="flex items-center gap-3 ml-2">
                            {[
                                { Icon: IconInstagram, label: 'Instagram' },
                                { Icon: IconLinkedIn, label: 'LinkedIn' },
                            ].map(({ Icon, label }) => (
                                <a
                                    key={label}
                                    href="#"
                                    aria-label={label}
                                    className="text-textMuted hover:text-accent transition-colors duration-200"
                                >
                                    <Icon />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Tagline */}
                <div className="text-center pt-6" style={{ borderTop: '1px solid var(--border)' }}>
                    <p className="text-xs italic" style={{ color: 'var(--text-subtle)' }}>
                        Your office is anywhere. Your home is Sicily.
                    </p>
                </div>
            </div>
        </footer>
    );
}

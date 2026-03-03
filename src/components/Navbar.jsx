import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useI18n, LANGS } from '../context/I18nContext';
import { useTheme } from '../context/ThemeContext';

function LangSwitcher() {
    const { lang, changeLang } = useI18n();
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const current = LANGS.find(l => l.code === lang) || LANGS[0];

    useEffect(() => {
        function handleClick(e) { if (!ref.current?.contains(e.target)) setOpen(false); }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            <button
                onClick={() => setOpen(o => !o)}
                style={{
                    display: 'flex', alignItems: 'center', gap: '5px',
                    background: 'none', border: '1px solid var(--border-light)',
                    borderRadius: '6px', padding: '4px 8px',
                    cursor: 'pointer', color: 'var(--text-muted)',
                    fontSize: '0.72rem', fontFamily: 'monospace',
                    transition: 'border-color 0.2s, color 0.2s',
                    whiteSpace: 'nowrap'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
            >
                {current.flag} {current.code.toUpperCase()} ▾
            </button>
            {open && (
                <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                    background: 'var(--surface)', border: '1px solid var(--border-light)',
                    borderRadius: '8px', overflow: 'hidden', minWidth: '140px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)', zIndex: 200,
                }}>
                    {LANGS.map(l => (
                        <button key={l.code} onClick={() => { changeLang(l.code); setOpen(false); }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                width: '100%', padding: '9px 14px',
                                border: 'none', cursor: 'pointer', textAlign: 'left',
                                fontSize: '0.82rem', fontFamily: 'monospace',
                                color: lang === l.code ? 'var(--accent)' : 'var(--text-muted)',
                                background: lang === l.code ? 'var(--accent-dim)' : 'transparent',
                                transition: 'background 0.15s',
                            }}
                            onMouseEnter={e => { if (lang !== l.code) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                            onMouseLeave={e => { if (lang !== l.code) e.currentTarget.style.background = 'transparent'; }}
                        >
                            <span>{l.flag}</span>
                            <span>{l.label}</span>
                            {lang === l.code && <span style={{ marginLeft: 'auto', color: 'var(--accent)' }}>✓</span>}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <button
            onClick={toggleTheme}
            style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'none', border: '1px solid var(--border-light)',
                borderRadius: '6px', width: '30px', height: '30px',
                cursor: 'pointer', color: 'var(--text-muted)',
                transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
            aria-label="Toggle theme"
        >
            {isDark ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
            ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
            )}
        </button>
    );
}

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const { user, logout } = useAuth();
    const { t } = useI18n();
    const navigate = useNavigate();

    const managerPath = user?.role === 'activity_manager'
        ? '/manager/activities'
        : user?.role === 'property_manager'
            ? '/manager/properties'
            : null;

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 60);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    function handleLogout() {
        logout();
        navigate('/');
        setMenuOpen(false);
    }

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'navbar-scroll' : 'bg-transparent'}`}>
            <div className="max-w-content mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
                {/* Wordmark */}
                <Link to="/" className="flex items-center gap-1.5 font-sans font-medium text-textPrimary text-lg tracking-tight">
                    <span className="text-accent">·</span>Digitalands
                </Link>

                {/* Desktop links */}
                <ul className="hidden md:flex items-center gap-6">
                    {[
                        { to: '/#process', label: t('nav_how'), isHash: true },
                        { to: '/strutture', label: t('nav_properties') },
                        { to: '/#community', label: t('nav_community'), isHash: true },
                        { to: '/activities', label: t('nav_activities') },
                        { to: '/mappa', label: t('nav_map') },
                        { to: '/blog', label: 'Blog' },
                        { to: '/#partners', label: t('nav_partners'), isHash: true },
                    ].map(link => (
                        <li key={link.label}>
                            {link.isHash ? (
                                <a href={link.to} className="text-sm text-textPrimary hover:text-accent transition-colors duration-200">
                                    {link.label}
                                </a>
                            ) : (
                                <Link to={link.to} className="text-sm text-textPrimary hover:text-accent transition-colors duration-200">
                                    {link.label}
                                </Link>
                            )}
                        </li>
                    ))}
                </ul>

                {/* CTA / User area */}
                <div className="hidden md:flex items-center gap-4">
                    <ThemeToggle />
                    <LangSwitcher />

                    {user ? (
                        <div className="flex items-center gap-3">
                            <div className="flex flex-col items-end gap-0">
                                <Link to="/dashboard" className="text-[12px] font-medium text-textMuted hover:text-textPrimary transition-colors">
                                    {t('nav_dashboard')}
                                </Link>
                                {managerPath && (
                                    <Link to={managerPath}
                                        className="text-[11px] font-mono font-bold text-accent hover:underline underline-offset-4">
                                        {t('nav_manager')} ↗
                                    </Link>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-bg"
                                    style={{ background: 'var(--accent)' }}>
                                    {user.name?.charAt(0).toUpperCase()}
                                </div>
                                <button onClick={handleLogout}
                                    className="text-xs text-textMuted hover:text-textPrimary transition-colors font-mono">
                                    {t('nav_logout')}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link to="/auth" className="text-sm text-textMuted hover:text-textPrimary transition-colors">
                                {t('nav_login')}
                            </Link>
                            <Link to="/auth?tab=register" className="btn-ghost !py-2 !px-4 !text-[13px]">
                                {t('nav_register')}
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile toggle */}
                <button
                    className="md:hidden flex flex-col gap-1.5 p-2 mr-[-8px]"
                    onClick={() => setMenuOpen(o => !o)}
                    aria-label="Toggle menu"
                >
                    <span className={`block w-5 h-px bg-textPrimary transition-all duration-200 ${menuOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
                    <span className={`block w-5 h-px bg-textPrimary transition-all duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
                    <span className={`block w-5 h-px bg-textPrimary transition-all duration-200 ${menuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
                </button>
            </div>

            {/* Mobile menu */}
            {menuOpen && (
                <div className="md:hidden bg-surface border-t border-border px-6 py-8 flex flex-col gap-6 overflow-y-auto max-h-[85vh] animate-fade-in shadow-2xl">
                    <nav className="flex flex-col gap-5">
                        <a href="/#process" onClick={() => setMenuOpen(false)} className="text-lg font-serif text-textPrimary hover:text-accent transition-colors">
                            {t('nav_how')}
                        </a>
                        <Link to="/strutture" onClick={() => setMenuOpen(false)} className="text-lg font-serif text-textPrimary hover:text-accent transition-colors">
                            {t('nav_properties')}
                        </Link>
                        <a href="/#community" onClick={() => setMenuOpen(false)} className="text-lg font-serif text-textPrimary hover:text-accent transition-colors">
                            {t('nav_community')}
                        </a>
                        <Link to="/activities" onClick={() => setMenuOpen(false)} className="text-lg font-serif text-textPrimary hover:text-accent transition-colors">
                            {t('nav_activities')}
                        </Link>
                        <Link to="/mappa" onClick={() => setMenuOpen(false)} className="text-lg font-serif text-textPrimary hover:text-accent transition-colors">
                            {t('nav_map')}
                        </Link>
                        <Link to="/blog" onClick={() => setMenuOpen(false)} className="text-lg font-serif text-textPrimary hover:text-accent transition-colors">
                            Blog
                        </Link>
                        <a href="/#partners" onClick={() => setMenuOpen(false)} className="text-lg font-serif text-textPrimary hover:text-accent transition-colors">
                            {t('nav_partners')}
                        </a>
                    </nav>

                    <div className="pt-5 border-t border-border-light flex flex-col gap-4">
                        {user ? (
                            <>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-bg"
                                            style={{ background: 'var(--accent)' }}>
                                            {user.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-sm font-medium text-textPrimary">{user.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <ThemeToggle />
                                        <LangSwitcher />
                                    </div>
                                </div>
                                {managerPath && (
                                    <Link to={managerPath} className="text-sm font-mono" style={{ color: 'var(--accent)' }} onClick={() => setMenuOpen(false)}>
                                        {t('nav_manager')} ↗
                                    </Link>
                                )}
                                <Link to="/dashboard" className="text-sm text-textMuted" onClick={() => setMenuOpen(false)}>{t('nav_dashboard')}</Link>
                                <button onClick={handleLogout} className="text-sm text-left text-textMuted font-mono hover:text-accent transition-colors">{t('nav_logout')}</button>
                            </>
                        ) : (
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-mono text-textSubtle tracking-widest uppercase">Language</span>
                                    <LangSwitcher />
                                </div>
                                <Link to="/auth" className="btn-gold text-center py-3" onClick={() => setMenuOpen(false)}>
                                    {t('nav_login')} / {t('nav_register')}
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}

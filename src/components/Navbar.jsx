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
                    <li>
                        <a href="/#process" className="text-sm text-white hover:text-accent transition-colors duration-200">
                            {t('nav_how')}
                        </a>
                    </li>
                    <li>
                        <Link to="/strutture" className="text-sm text-white hover:text-accent transition-colors duration-200">
                            {t('nav_properties')}
                        </Link>
                    </li>
                    <li>
                        <a href="/#community" className="text-sm text-white hover:text-accent transition-colors duration-200">
                            {t('nav_community')}
                        </a>
                    </li>
                    <li>
                        <Link to="/activities" className="text-sm text-white hover:text-accent transition-colors duration-200">
                            {t('nav_activities')}
                        </Link>
                    </li>
                    <li>
                        <Link to="/mappa" className="text-sm text-white hover:text-accent transition-colors duration-200">
                            {t('nav_map')}
                        </Link>
                    </li>
                    <li>
                        <Link to="/blog" className="text-sm text-white hover:text-accent transition-colors duration-200">
                            Blog
                        </Link>
                    </li>
                    <li>
                        <a href="/#partners" className="text-sm text-white hover:text-accent transition-colors duration-200">
                            {t('nav_partners')}
                        </a>
                    </li>
                </ul>

                {/* CTA / User area */}
                <div className="hidden md:flex items-center gap-3">
                    <ThemeToggle />
                    <LangSwitcher />

                    {user ? (
                        <>
                            {managerPath && (
                                <Link to={managerPath}
                                    className="text-sm font-mono transition-colors"
                                    style={{ color: 'var(--accent)', fontSize: '0.8rem' }}>
                                    {t('nav_manager')} ↗
                                </Link>
                            )}
                            <Link to="/dashboard" className="text-sm text-textMuted hover:text-textPrimary transition-colors">
                                {t('nav_dashboard')}
                            </Link>
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
                        </>
                    ) : (
                        <>
                            <Link to="/auth" className="text-sm text-textMuted hover:text-textPrimary transition-colors">
                                {t('nav_login')}
                            </Link>
                            <Link to="/auth?tab=register" className="btn-ghost text-sm">
                                {t('nav_register')}
                            </Link>
                        </>
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
                <div className="md:hidden bg-surface border-t border-border px-6 py-6 flex flex-col gap-5 overflow-y-auto max-h-[calc(100vh-64px)]">
                    <div className="flex flex-col gap-4">
                        <a href="/#process" className="text-sm font-medium text-textMuted hover:text-accent transition-colors" onClick={() => setMenuOpen(false)}>{t('nav_how')}</a>
                        <Link to="/strutture" className="text-sm font-medium text-textMuted hover:text-accent transition-colors" onClick={() => setMenuOpen(false)}>{t('nav_properties')}</Link>
                        <a href="/#community" className="text-sm font-medium text-textMuted hover:text-accent transition-colors" onClick={() => setMenuOpen(false)}>{t('nav_community')}</a>
                        <Link to="/activities" className="text-sm font-medium text-textMuted hover:text-accent transition-colors" onClick={() => setMenuOpen(false)}>{t('nav_activities')}</Link>
                        <Link to="/blog" className="text-sm font-medium text-textMuted hover:text-accent transition-colors" onClick={() => setMenuOpen(false)}>Blog</Link>
                        <Link to="/mappa" className="text-sm font-medium text-textMuted hover:text-accent transition-colors" onClick={() => setMenuOpen(false)}>{t('nav_map')}</Link>
                        <a href="/#partners" className="text-sm font-medium text-textMuted hover:text-accent transition-colors" onClick={() => setMenuOpen(false)}>{t('nav_partners')}</a>
                    </div>

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

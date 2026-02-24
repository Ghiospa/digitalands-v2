import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useI18n, LANGS } from '../context/I18nContext';

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
                    borderRadius: '6px', padding: '5px 10px',
                    cursor: 'pointer', color: 'var(--text-muted)',
                    fontSize: '0.78rem', fontFamily: 'monospace',
                    transition: 'border-color 0.2s, color 0.2s',
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
                                width: '100%', padding: '9px 14px', background: 'none',
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
                        <a href="/#partners" className="text-sm text-white hover:text-accent transition-colors duration-200">
                            {t('nav_partners')}
                        </a>
                    </li>
                </ul>

                {/* CTA / User area */}
                <div className="hidden md:flex items-center gap-3">
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
                    className="md:hidden flex flex-col gap-1.5 p-2"
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
                <div className="md:hidden bg-surface border-t border-border px-6 py-5 flex flex-col gap-4">
                    <a href="/#process" className="text-base text-textMuted" onClick={() => setMenuOpen(false)}>{t('nav_how')}</a>
                    <Link to="/strutture" className="text-base text-textMuted" onClick={() => setMenuOpen(false)}>{t('nav_properties')}</Link>
                    <a href="/#community" className="text-base text-textMuted" onClick={() => setMenuOpen(false)}>{t('nav_community')}</a>
                    <Link to="/activities" className="text-base text-textMuted" onClick={() => setMenuOpen(false)}>{t('nav_activities')}</Link>
                    <Link to="/mappa" className="text-base text-textMuted" onClick={() => setMenuOpen(false)}>{t('nav_map')}</Link>
                    <a href="/#partners" className="text-base text-textMuted" onClick={() => setMenuOpen(false)}>{t('nav_partners')}</a>
                    {user ? (
                        <>
                            {managerPath && (
                                <Link to={managerPath} className="text-base" style={{ color: 'var(--accent)' }} onClick={() => setMenuOpen(false)}>
                                    {t('nav_manager')} ↗
                                </Link>
                            )}
                            <Link to="/dashboard" className="text-base text-textMuted" onClick={() => setMenuOpen(false)}>{t('nav_dashboard')}</Link>
                            <div className="pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-bg"
                                        style={{ background: 'var(--accent)' }}>
                                        {user.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-sm text-textPrimary">{user.name}</span>
                                </div>
                                <LangSwitcher />
                                <button onClick={handleLogout} className="btn-ghost mt-3 text-left w-full" style={{ fontSize: '0.9rem' }}>{t('nav_logout')}</button>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col gap-3">
                            <LangSwitcher />
                            <Link to="/auth" className="btn-gold mt-2 text-center" onClick={() => setMenuOpen(false)}>
                                {t('nav_login')} / {t('nav_register')}
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
}

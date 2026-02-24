import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';

function InputField({ label, id, type = 'text', value, onChange, error, placeholder }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor={id} className="text-xs font-mono tracking-widest uppercase text-textMuted">
                {label}
            </label>
            <input
                id={id}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                autoComplete={type === 'password' ? 'current-password' : id}
                className="waitlist-input"
                style={error ? { borderColor: 'var(--accent)', background: 'rgba(212,168,83,0.04)' } : {}}
            />
            {error && (
                <span className="text-xs font-mono" style={{ color: 'var(--accent)' }}>
                    ↳ {error}
                </span>
            )}
        </div>
    );
}

function LoginForm({ onSuccess }) {
    const { login } = useAuth();
    const { t } = useI18n();
    const [form, setForm] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({});
    const [globalError, setGlobalError] = useState('');
    const [loading, setLoading] = useState(false);

    function validate() {
        const e = {};
        if (!form.email.includes('@')) e.email = 'Inserisci un\'email valida.';
        if (form.password.length < 6) e.password = 'La password deve essere di almeno 6 caratteri.';
        return e;
    }

    function handleSubmit(ev) {
        ev.preventDefault();
        const e = validate();
        if (Object.keys(e).length) { setErrors(e); return; }
        setLoading(true);
        setTimeout(() => {
            const res = login(form);
            setLoading(false);
            if (res.error) { setGlobalError(res.error); return; }
            onSuccess();
        }, 600);
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {globalError && (
                <div className="text-sm p-3 rounded" style={{ background: 'rgba(212,168,83,0.08)', border: '1px solid rgba(212,168,83,0.2)', color: 'var(--accent)' }}>
                    {globalError}
                </div>
            )}
            <InputField label="Email" id="email" type="email" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                error={errors.email} placeholder="la-tua@email.com" />
            <InputField label="Password" id="password" type="password" value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                error={errors.password} placeholder="••••••••" />
            <button type="submit" className="btn-gold mt-2" disabled={loading} style={{ padding: '14px', fontSize: '0.9rem' }}>
                {loading ? t('auth_loading_login') : t('auth_login_btn')}
            </button>
        </form>
    );
}

function RegisterForm({ onSuccess }) {
    const { register } = useAuth();
    const { t } = useI18n();
    const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', role: 'guest' });
    const [errors, setErrors] = useState({});
    const [globalError, setGlobalError] = useState('');
    const [loading, setLoading] = useState(false);

    const roles = [
        { value: 'guest', label: t('auth_role_guest'), icon: '🏖️' },
        { value: 'activity_manager', label: t('auth_role_activity'), icon: '🏄' },
        { value: 'property_manager', label: t('auth_role_property'), icon: '🏡' },
    ];

    function validate() {
        const e = {};
        if (!form.name.trim()) e.name = 'Inserisci il tuo nome.';
        if (!form.email.includes('@')) e.email = "Inserisci un'email valida.";
        if (form.password.length < 6) e.password = 'Almeno 6 caratteri.';
        if (form.password !== form.confirm) e.confirm = 'Le password non coincidono.';
        return e;
    }

    function handleSubmit(ev) {
        ev.preventDefault();
        const e = validate();
        if (Object.keys(e).length) { setErrors(e); return; }
        setLoading(true);
        setTimeout(() => {
            const res = register({ name: form.name, email: form.email, password: form.password, role: form.role });
            setLoading(false);
            if (res.error) { setGlobalError(res.error); return; }
            onSuccess();
        }, 600);
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {globalError && (
                <div className="text-sm p-3 rounded" style={{ background: 'rgba(212,168,83,0.08)', border: '1px solid rgba(212,168,83,0.2)', color: 'var(--accent)' }}>
                    {globalError}
                </div>
            )}

            {/* Role selector */}
            <div className="flex flex-col gap-2">
                <label className="text-xs font-mono tracking-widest uppercase text-textMuted">{t('auth_role_label')}</label>
                <div className="grid grid-cols-3 gap-2">
                    {roles.map(r => (
                        <button
                            key={r.value}
                            type="button"
                            onClick={() => setForm(f => ({ ...f, role: r.value }))}
                            style={{
                                padding: '10px 6px',
                                borderRadius: '8px',
                                border: form.role === r.value ? '1px solid var(--accent)' : '1px solid var(--border-light)',
                                background: form.role === r.value ? 'var(--accent-dim)' : 'transparent',
                                color: form.role === r.value ? 'var(--accent)' : 'var(--text-muted)',
                                cursor: 'pointer',
                                fontSize: '11px',
                                fontFamily: 'monospace',
                                textAlign: 'center',
                                transition: 'all 0.15s',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '4px',
                            }}
                        >
                            <span style={{ fontSize: '1.2rem' }}>{r.icon}</span>
                            <span style={{ lineHeight: 1.2 }}>{r.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <InputField label="Nome completo" id="name" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                error={errors.name} placeholder="Marco Rossi" />
            <InputField label="Email" id="reg-email" type="email" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                error={errors.email} placeholder="la-tua@email.com" />
            <InputField label="Password" id="reg-password" type="password" value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                error={errors.password} placeholder="Min. 6 caratteri" />
            <InputField label="Conferma Password" id="confirm" type="password" value={form.confirm}
                onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                error={errors.confirm} placeholder="Ripeti la password" />
            <button type="submit" className="btn-gold mt-2" disabled={loading} style={{ padding: '14px', fontSize: '0.9rem' }}>
                {loading ? t('auth_loading_register') : t('auth_register_btn')}
            </button>
        </form>
    );
}

export default function AuthPage() {
    const [tab, setTab] = useState('login');
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { t } = useI18n();
    const redirect = searchParams.get('redirect') || '/dashboard';

    const initTab = searchParams.get('tab');
    useState(() => { if (initTab === 'register') setTab('register'); }, []);

    function onSuccess() {
        navigate(redirect);
    }

    const tabStyle = (t2) => ({
        padding: '10px 24px',
        fontSize: '0.85rem',
        fontWeight: 500,
        fontFamily: 'monospace',
        letterSpacing: '0.04em',
        cursor: 'pointer',
        color: tab === t2 ? 'var(--text-primary)' : 'var(--text-muted)',
        background: 'none',
        border: 'none',
        borderBottom: tab === t2 ? '2px solid var(--accent)' : '2px solid transparent',
        transition: 'color 0.2s, border-color 0.2s',
    });

    return (
        <div className="min-h-screen grid-bg flex items-center justify-center px-4 pt-20 pb-12">
            <div className="fixed inset-0 pointer-events-none" style={{
                background: 'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(212,168,83,0.04) 0%, transparent 70%)'
            }} />

            <div className="relative z-10 w-full max-w-md">
                <Link to="/" className="flex items-center gap-1 mb-8 text-textMuted hover:text-textPrimary transition-colors text-sm font-mono">
                    ← Torna alla home
                </Link>

                <div className="rounded-lg overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border-light)' }}>
                    <div className="flex border-b" style={{ borderColor: 'var(--border)' }}>
                        <button style={tabStyle('login')} onClick={() => setTab('login')}>{t('nav_login')}</button>
                        <button style={tabStyle('register')} onClick={() => setTab('register')}>{t('nav_register')}</button>
                    </div>

                    <div className="p-8">
                        <div className="mb-8">
                            <div className="flex items-center gap-1.5 mb-3">
                                <span className="text-accent font-sans font-medium">·</span>
                                <span className="font-sans font-medium text-textPrimary">Digitalands</span>
                            </div>
                            <h1 className="font-serif text-2xl text-textPrimary mb-1">
                                {tab === 'login' ? t('auth_welcome_back') : t('auth_create_account')}
                            </h1>
                            <p className="text-sm text-textMuted">
                                {tab === 'login' ? t('auth_login_sub') : t('auth_register_sub')}
                            </p>
                        </div>

                        {tab === 'login'
                            ? <LoginForm onSuccess={onSuccess} />
                            : <RegisterForm onSuccess={onSuccess} />
                        }

                        {/* ── Social login divider ── */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0 16px' }}>
                            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                            <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>oppure continua con</span>
                            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {[
                                { icon: '🔵', label: 'Google', onClick: () => alert('Google login simulato — in una versione con backend questo aprirebbe il flusso OAuth Google.') },
                                { icon: '', label: 'Apple', onClick: () => alert('Apple login simulato — in una versione con backend questo aprirebbe il flusso OAuth Apple.') },
                            ].map(btn => (
                                <button key={btn.label} onClick={btn.onClick}
                                    style={{
                                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        gap: '8px', padding: '11px 16px',
                                        background: 'transparent', border: '1px solid var(--border-light)',
                                        borderRadius: '8px', cursor: 'pointer',
                                        fontSize: '13px', fontFamily: 'monospace',
                                        color: 'var(--text-muted)',
                                        transition: 'border-color 0.2s, color 0.2s',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                                >
                                    <span>{btn.icon}</span>
                                    <span>{btn.label}</span>
                                </button>
                            ))}
                        </div>

                        <p className="text-xs text-textMuted mt-6 text-center">
                            {tab === 'login'
                                ? <>{t('auth_no_account')}{' '}
                                    <button onClick={() => setTab('register')} className="text-accent hover:underline">{t('nav_register')}</button>
                                </>
                                : <>{t('auth_have_account')}{' '}
                                    <button onClick={() => setTab('login')} className="text-accent hover:underline">{t('nav_login')}</button>
                                </>
                            }
                        </p>
                    </div>
                </div>

                <p className="text-center text-xs text-textMuted mt-6 font-mono">
                    Nessuno spam. Solo le strutture più belle di Sicilia.
                </p>
            </div>
        </div>
    );
}

import { useState } from 'react';

export default function WaitlistCTA() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // idle | loading | success | error

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!email || !email.includes('@')) return;

        setStatus('loading');
        setTimeout(() => {
            setStatus('success');
        }, 900);
    };

    return (
        <section
            className="py-28 px-6 md:px-10"
            id="waitlist"
            style={{ background: 'var(--surface)' }}
        >
            <div className="max-w-content mx-auto">
                <div className="max-w-[560px] mx-auto text-center">

                    <div data-reveal className="reveal">
                        <div className="section-chip mx-auto" style={{ display: 'inline-flex' }}>EARLY ACCESS</div>
                    </div>

                    <h2
                        data-reveal
                        className="reveal font-serif text-textPrimary mt-4 mb-5"
                        style={{ fontSize: 'clamp(36px, 5vw, 48px)', lineHeight: '1.1', transitionDelay: '80ms' }}
                    >
                        La tua prossima base ti{' '}
                        <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>sta aspettando.</em>
                    </h2>

                    <p
                        data-reveal
                        className="reveal text-textMuted leading-relaxed mb-10"
                        style={{ fontSize: '16px', transitionDelay: '160ms' }}
                    >
                        Iscriviti alla waitlist. Accesso prioritario + 20% di sconto sul primo mese.
                        Zero spam, mai.
                    </p>

                    {status === 'success' ? (
                        <div
                            data-reveal
                            className="reveal"
                            style={{
                                background: 'var(--bg)',
                                border: '1px solid rgba(212,168,83,0.25)',
                                borderRadius: '8px',
                                padding: '32px',
                            }}
                        >
                            {/* Animated checkmark */}
                            <div className="flex items-center justify-center mb-4">
                                <div
                                    className="w-12 h-12 rounded-full flex items-center justify-center"
                                    style={{ background: 'rgba(212,168,83,0.12)', border: '1px solid rgba(212,168,83,0.3)' }}
                                >
                                    <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
                                        <path d="M5 13l4 4L19 7" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </div>
                            <div className="text-textPrimary font-medium mb-1">Sei in lista.</div>
                            <div className="text-textMuted text-sm">Ti contatteremo non appena siamo pronti. Benvenuto in Digitalands.</div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} data-reveal className="reveal" style={{ transitionDelay: '240ms' }}>
                            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                                <input
                                    type="email"
                                    className="waitlist-input flex-1"
                                    placeholder="la-tua@email.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                />
                                <button
                                    type="submit"
                                    className="btn-gold whitespace-nowrap"
                                    disabled={status === 'loading'}
                                    style={{ padding: '14px 28px' }}
                                >
                                    {status === 'loading' ? (
                                        <span className="inline-flex items-center gap-2">
                                            <svg className="animate-spin" viewBox="0 0 24 24" fill="none" width="14" height="14">
                                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.25" />
                                                <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                            </svg>
                                            Invio…
                                        </span>
                                    ) : 'Entra in lista →'}
                                </button>
                            </div>
                            <p className="text-xs text-textMuted font-mono">
                                🏡 17 founding spot rimanenti · Nessuna carta di credito richiesta
                            </p>
                        </form>
                    )}
                </div>
            </div>
        </section>
    );
}

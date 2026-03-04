import { useState, useEffect } from 'react';
import { checkConnectStatus, createConnectAccount } from '../lib/stripe';

export default function StripeConnectButton() {
    const [status, setStatus] = useState({ hasAccount: false, onboardingComplete: false, chargesEnabled: false });
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        checkConnectStatus()
            .then(setStatus)
            .finally(() => setLoading(false));
    }, []);

    async function handleSetup() {
        setActionLoading(true);
        setError('');
        try {
            const { url } = await createConnectAccount();
            window.location.href = url;
        } catch (err) {
            setError(err.message);
            setActionLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center gap-2 text-xs text-textMuted font-mono">
                <div className="animate-spin rounded-full h-3 w-3 border-t border-accent"></div>
                Verifica pagamenti...
            </div>
        );
    }

    if (status.chargesEnabled) {
        return (
            <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded"
                    style={{
                        color: '#4ade80',
                        background: 'rgba(74,222,128,0.08)',
                        border: '1px solid rgba(74,222,128,0.2)',
                    }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Pagamenti attivi
                </span>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {status.hasAccount && !status.chargesEnabled && (
                <div className="text-xs font-mono px-3 py-1.5 rounded inline-flex items-center gap-1.5"
                    style={{
                        color: 'var(--accent)',
                        background: 'var(--accent-dim)',
                        border: '1px solid rgba(212,168,83,0.2)',
                    }}>
                    Onboarding incompleto
                </div>
            )}
            <button
                onClick={handleSetup}
                disabled={actionLoading}
                className="btn-gold text-sm"
                style={{ padding: '10px 20px' }}
            >
                {actionLoading ? (
                    <span className="inline-flex items-center gap-2">
                        <svg className="animate-spin" viewBox="0 0 24 24" fill="none" width="14" height="14">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.25" />
                            <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        Configurazione...
                    </span>
                ) : status.hasAccount ? 'Completa configurazione' : 'Configura pagamenti Stripe'}
            </button>
            {error && <p className="text-xs text-red-400 font-mono">{error}</p>}
        </div>
    );
}

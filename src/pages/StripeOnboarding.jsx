import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createConnectAccount } from '../lib/stripe';

export default function StripeOnboarding() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const isSuccess = searchParams.get('success') === 'true';
    const isRefresh = searchParams.get('refresh') === 'true';
    const [retrying, setRetrying] = useState(false);

    useEffect(() => {
        if (isSuccess) {
            const timer = setTimeout(() => {
                const dest = user?.role === 'activity_manager'
                    ? '/manager/activities'
                    : '/manager/properties';
                navigate(dest);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isSuccess, navigate, user]);

    async function handleRetry() {
        setRetrying(true);
        try {
            const { url } = await createConnectAccount();
            window.location.href = url;
        } catch {
            setRetrying(false);
        }
    }

    const dashboardPath = user?.role === 'activity_manager'
        ? '/manager/activities'
        : '/manager/properties';

    return (
        <div className="min-h-screen flex items-center justify-center px-6"
            style={{ background: 'var(--bg)' }}>
            <div className="max-w-md w-full text-center">
                {isSuccess && (
                    <>
                        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                            style={{ background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.3)' }}>
                            <svg viewBox="0 0 24 24" fill="none" width="28" height="28">
                                <path d="M5 13l4 4L19 7" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <h1 className="font-serif text-2xl text-textPrimary mb-3">Account Stripe configurato!</h1>
                        <p className="text-sm text-textMuted mb-6">
                            Ora puoi ricevere pagamenti dalle prenotazioni. Verrai reindirizzato alla tua dashboard.
                        </p>
                        <Link to={dashboardPath} className="btn-gold inline-block" style={{ padding: '12px 28px' }}>
                            Vai alla dashboard
                        </Link>
                    </>
                )}

                {isRefresh && (
                    <>
                        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                            style={{ background: 'var(--accent-dim)', border: '1px solid rgba(212,168,83,0.3)' }}>
                            <svg viewBox="0 0 24 24" fill="none" width="28" height="28">
                                <path d="M1 4v6h6M23 20v-6h-6" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M20.49 9A9 9 0 105.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <h1 className="font-serif text-2xl text-textPrimary mb-3">Configurazione incompleta</h1>
                        <p className="text-sm text-textMuted mb-6">
                            L'onboarding Stripe deve essere completato per poter ricevere pagamenti. Riprova per continuare.
                        </p>
                        <button
                            onClick={handleRetry}
                            disabled={retrying}
                            className="btn-gold"
                            style={{ padding: '12px 28px' }}
                        >
                            {retrying ? 'Reindirizzamento...' : 'Riprova configurazione'}
                        </button>
                    </>
                )}

                {!isSuccess && !isRefresh && (
                    <>
                        <h1 className="font-serif text-2xl text-textPrimary mb-3">Configurazione pagamenti</h1>
                        <p className="text-sm text-textMuted mb-6">
                            Pagina non valida. Torna alla tua dashboard per configurare i pagamenti.
                        </p>
                        <Link to={dashboardPath} className="btn-ghost text-sm">
                            Torna alla dashboard
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}

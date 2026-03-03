import { supabase } from './supabase';

async function getToken() {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
}

export async function createCheckoutSession(bookingData) {
    const token = await getToken();
    const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(bookingData),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Errore nella creazione del pagamento.');
    }
    return res.json();
}

export async function createConnectAccount() {
    const token = await getToken();
    const res = await fetch('/api/create-connect-account', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Errore nella configurazione pagamenti.');
    }
    return res.json();
}

export async function checkConnectStatus() {
    const token = await getToken();
    const res = await fetch('/api/check-connect-status', {
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) return { hasAccount: false, onboardingComplete: false, chargesEnabled: false };
    return res.json();
}

export async function refundBooking(bookingId) {
    const token = await getToken();
    const res = await fetch('/api/refund-booking', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ bookingId }),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Errore nel rimborso.');
    }
    return res.json();
}

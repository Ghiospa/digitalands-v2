import { supabaseAdmin } from './_lib/supabase-admin.js';
import { getAuthUser } from './_lib/auth.js';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const user = await getAuthUser(req);
        if (!user) {
            return res.status(401).json({ error: 'Non autenticato.' });
        }

        const { data: profile, error } = await supabaseAdmin
            .from('profiles')
            .select('stripe_account_id, stripe_onboarding_complete, stripe_charges_enabled')
            .eq('id', user.id)
            .single();

        if (error || !profile) {
            return res.status(200).json({
                hasAccount: false,
                onboardingComplete: false,
                chargesEnabled: false,
            });
        }

        return res.status(200).json({
            hasAccount: !!profile.stripe_account_id,
            onboardingComplete: profile.stripe_onboarding_complete || false,
            chargesEnabled: profile.stripe_charges_enabled || false,
        });
    } catch (err) {
        console.error('Connect status error:', err);
        return res.status(500).json({ error: 'Errore nel controllo dello stato.' });
    }
}

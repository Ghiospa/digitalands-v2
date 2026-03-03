import { stripe } from './_lib/stripe.js';
import { supabaseAdmin } from './_lib/supabase-admin.js';
import { getAuthUser } from './_lib/auth.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const user = await getAuthUser(req);
        if (!user) {
            return res.status(401).json({ error: 'Non autenticato.' });
        }

        // Verify user is a manager
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('role, stripe_account_id, name')
            .eq('id', user.id)
            .single();

        if (profileError || !profile) {
            return res.status(404).json({ error: 'Profilo non trovato.' });
        }

        if (profile.role !== 'property_manager' && profile.role !== 'activity_manager') {
            return res.status(403).json({ error: 'Solo i manager possono configurare i pagamenti.' });
        }

        const siteUrl = process.env.VITE_SITE_URL || 'https://digitalands-v2.vercel.app';
        let stripeAccountId = profile.stripe_account_id;

        // Create new Connect account if not exists
        if (!stripeAccountId) {
            const account = await stripe.accounts.create({
                type: 'standard',
                country: 'IT',
                email: user.email,
                metadata: { user_id: user.id },
            });

            stripeAccountId = account.id;

            await supabaseAdmin
                .from('profiles')
                .update({ stripe_account_id: stripeAccountId })
                .eq('id', user.id);
        }

        // Create onboarding link
        const accountLink = await stripe.accountLinks.create({
            account: stripeAccountId,
            refresh_url: `${siteUrl}/manager/stripe-onboarding?refresh=true`,
            return_url: `${siteUrl}/manager/stripe-onboarding?success=true`,
            type: 'account_onboarding',
        });

        return res.status(200).json({ url: accountLink.url });
    } catch (err) {
        console.error('Connect account error:', err);
        return res.status(500).json({ error: 'Errore nella configurazione dei pagamenti.' });
    }
}

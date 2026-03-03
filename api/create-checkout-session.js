import { stripe } from './_lib/stripe.js';
import { supabaseAdmin } from './_lib/supabase-admin.js';
import { getAuthUser } from './_lib/auth.js';

const PLATFORM_FEE_PERCENT = 0.07;

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const user = await getAuthUser(req);
        if (!user) {
            return res.status(401).json({ error: 'Non autenticato.' });
        }

        const {
            propertyId,
            activityId,
            propertyName,
            activityName,
            checkIn,
            checkOut,
            guests,
            months,
            totalPrice,
            category,
            emoji,
        } = req.body;

        if (!totalPrice || totalPrice <= 0) {
            return res.status(400).json({ error: 'Importo non valido.' });
        }

        const isProperty = !!propertyId;
        const itemId = propertyId || activityId;
        const itemName = propertyName || activityName;
        const table = isProperty ? 'properties' : 'activities';

        // Look up owner's Stripe account
        const { data: item, error: itemError } = await supabaseAdmin
            .from(table)
            .select('owner_id')
            .eq('id', itemId)
            .single();

        if (itemError || !item) {
            return res.status(404).json({ error: 'Struttura o attività non trovata.' });
        }

        const { data: ownerProfile, error: ownerError } = await supabaseAdmin
            .from('profiles')
            .select('stripe_account_id, stripe_charges_enabled')
            .eq('id', item.owner_id)
            .single();

        if (ownerError || !ownerProfile?.stripe_account_id) {
            return res.status(400).json({ error: 'Il gestore non ha ancora configurato i pagamenti.' });
        }

        if (!ownerProfile.stripe_charges_enabled) {
            return res.status(400).json({ error: 'Il gestore non ha completato la configurazione dei pagamenti.' });
        }

        // Calculate fees in cents
        const totalAmountCents = Math.round(totalPrice * 100);
        const platformFeeCents = Math.round(totalAmountCents * PLATFORM_FEE_PERCENT);
        const managerPayoutCents = totalAmountCents - platformFeeCents;

        // Create pending booking
        const bookingData = {
            user_id: user.id,
            property_id: propertyId || null,
            activity_id: activityId || null,
            property_name: propertyName || null,
            activity_name: activityName || null,
            check_in: checkIn,
            check_out: checkOut || null,
            total_price: totalPrice,
            status: 'in-attesa',
            payment_status: 'pending',
            platform_fee: platformFeeCents,
            manager_payout: managerPayoutCents,
        };

        const { data: booking, error: bookingError } = await supabaseAdmin
            .from('bookings')
            .insert([bookingData])
            .select()
            .single();

        if (bookingError) {
            console.error('Booking insert error:', bookingError);
            return res.status(500).json({ error: 'Errore nella creazione della prenotazione.' });
        }

        // Create Stripe Checkout Session
        const siteUrl = process.env.VITE_SITE_URL || 'https://digitalands-v2.vercel.app';

        const description = isProperty
            ? `Soggiorno: ${checkIn?.slice(0, 10)} → ${checkOut?.slice(0, 10)}`
            : `Attività: ${checkIn?.slice(0, 10)}`;

        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: itemName || 'Prenotazione Digitalands',
                        description,
                    },
                    unit_amount: totalAmountCents,
                },
                quantity: 1,
            }],
            payment_intent_data: {
                application_fee_amount: platformFeeCents,
                transfer_data: {
                    destination: ownerProfile.stripe_account_id,
                },
            },
            metadata: {
                booking_id: booking.id,
                user_id: user.id,
                owner_id: item.owner_id,
                type: isProperty ? 'property' : 'activity',
            },
            success_url: `${siteUrl}/dashboard?payment=success&booking_id=${booking.id}`,
            cancel_url: `${siteUrl}/dashboard?payment=cancelled&booking_id=${booking.id}`,
            locale: 'it',
        });

        // Link checkout session to booking
        await supabaseAdmin
            .from('bookings')
            .update({ stripe_checkout_session_id: session.id })
            .eq('id', booking.id);

        return res.status(200).json({ sessionUrl: session.url });
    } catch (err) {
        console.error('Checkout session error:', err);
        return res.status(500).json({ error: 'Errore nella creazione del pagamento.' });
    }
}

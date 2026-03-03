import { stripe } from './_lib/stripe.js';
import { supabaseAdmin } from './_lib/supabase-admin.js';

export const config = {
    api: { bodyParser: false },
};

async function buffer(readable) {
    const chunks = [];
    for await (const chunk of readable) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks);
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const sig = req.headers['stripe-signature'];
    const buf = await buffer(req);

    let event;
    try {
        event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).json({ error: 'Webhook signature non valida.' });
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object;
                const bookingId = session.metadata?.booking_id;
                const ownerId = session.metadata?.owner_id;

                if (!bookingId) break;

                // Update booking to confirmed + paid
                await supabaseAdmin
                    .from('bookings')
                    .update({
                        status: 'confermata',
                        payment_status: 'paid',
                        stripe_payment_intent_id: session.payment_intent,
                    })
                    .eq('id', bookingId);

                // Fetch booking for audit record
                const { data: booking } = await supabaseAdmin
                    .from('bookings')
                    .select('*')
                    .eq('id', bookingId)
                    .single();

                if (booking) {
                    await supabaseAdmin.from('payments').insert([{
                        booking_id: bookingId,
                        stripe_payment_intent_id: session.payment_intent,
                        amount: booking.platform_fee + booking.manager_payout,
                        platform_fee: booking.platform_fee,
                        manager_payout: booking.manager_payout,
                        currency: 'eur',
                        status: 'completed',
                        manager_stripe_account_id: session.transfer_data?.destination || null,
                        guest_user_id: booking.user_id,
                        manager_user_id: ownerId || null,
                    }]);
                }
                break;
            }

            case 'checkout.session.expired': {
                const session = event.data.object;
                const bookingId = session.metadata?.booking_id;

                if (!bookingId) break;

                await supabaseAdmin
                    .from('bookings')
                    .update({
                        status: 'cancellata',
                        payment_status: 'failed',
                    })
                    .eq('id', bookingId);
                break;
            }

            case 'account.updated': {
                const account = event.data.object;

                await supabaseAdmin
                    .from('profiles')
                    .update({
                        stripe_onboarding_complete: account.details_submitted,
                        stripe_charges_enabled: account.charges_enabled,
                    })
                    .eq('stripe_account_id', account.id);
                break;
            }

            case 'charge.refunded': {
                const charge = event.data.object;
                const paymentIntentId = charge.payment_intent;

                if (!paymentIntentId) break;

                await supabaseAdmin
                    .from('bookings')
                    .update({
                        status: 'cancellata',
                        payment_status: 'refunded',
                    })
                    .eq('stripe_payment_intent_id', paymentIntentId);

                await supabaseAdmin
                    .from('payments')
                    .update({ status: 'refunded' })
                    .eq('stripe_payment_intent_id', paymentIntentId);
                break;
            }
        }

        return res.status(200).json({ received: true });
    } catch (err) {
        console.error('Webhook handler error:', err);
        return res.status(500).json({ error: 'Webhook processing failed.' });
    }
}

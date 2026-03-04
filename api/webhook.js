import { stripe } from './_lib/stripe.js';
import { supabaseAdmin } from './_lib/supabase-admin.js';
import { readRawBody } from './_lib/body.js';

// NOTE: No `export const config = { api: { bodyParser: false } }` here.
// That pattern is Next.js-only and has NO effect on plain Vercel Serverless Functions.
// readRawBody() reads directly from the request stream, which is the correct
// approach for Stripe signature verification in non-Next.js Vercel functions.

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const sig = req.headers['stripe-signature'];
    if (!sig) {
        return res.status(400).json({ error: 'Missing stripe-signature header.' });
    }

    // Read raw bytes before any parsing — required for Stripe HMAC signature verification
    const buf = await readRawBody(req);

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

                if (!bookingId) {
                    console.warn('checkout.session.completed: missing booking_id in metadata');
                    break;
                }

                await supabaseAdmin
                    .from('bookings')
                    .update({
                        status: 'confermata',
                        payment_status: 'paid',
                        stripe_payment_intent_id: session.payment_intent,
                    })
                    .eq('id', bookingId);

                // Fetch minimal booking data for the audit record
                const { data: booking } = await supabaseAdmin
                    .from('bookings')
                    .select('user_id, platform_fee, manager_payout')
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
                        // transfer_data is on the payment_intent, not the checkout session object
                        manager_stripe_account_id: null,
                        guest_user_id: booking.user_id,
                        manager_user_id: ownerId || null,
                    }]);
                }
                console.log(`Booking ${bookingId} confirmed (PI: ${session.payment_intent})`);
                break;
            }

            case 'checkout.session.expired': {
                const session = event.data.object;
                const bookingId = session.metadata?.booking_id;
                if (!bookingId) break;

                await supabaseAdmin
                    .from('bookings')
                    .update({ status: 'cancellata', payment_status: 'failed' })
                    .eq('id', bookingId);

                console.log(`Booking ${bookingId} expired`);
                break;
            }

            case 'account.updated': {
                const account = event.data.object;

                const { error } = await supabaseAdmin
                    .from('profiles')
                    .update({
                        stripe_onboarding_complete: account.details_submitted,
                        stripe_charges_enabled: account.charges_enabled,
                    })
                    .eq('stripe_account_id', account.id);

                if (error) {
                    console.error('account.updated profile sync error:', error);
                } else {
                    console.log(`Stripe account ${account.id} synced — charges_enabled: ${account.charges_enabled}`);
                }
                break;
            }

            case 'charge.refunded': {
                const charge = event.data.object;
                const paymentIntentId = charge.payment_intent;
                if (!paymentIntentId) break;

                await supabaseAdmin
                    .from('bookings')
                    .update({ status: 'cancellata', payment_status: 'refunded' })
                    .eq('stripe_payment_intent_id', paymentIntentId);

                await supabaseAdmin
                    .from('payments')
                    .update({ status: 'refunded' })
                    .eq('stripe_payment_intent_id', paymentIntentId);

                console.log(`Refund processed for PI: ${paymentIntentId}`);
                break;
            }

            default:
                // Return 200 for unhandled events so Stripe doesn't retry indefinitely
                console.log(`Unhandled webhook event type: ${event.type}`);
        }

        return res.status(200).json({ received: true });
    } catch (err) {
        console.error('Webhook handler error:', err);
        return res.status(500).json({ error: 'Webhook processing failed.' });
    }
}

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

        const { bookingId } = req.body;
        if (!bookingId) {
            return res.status(400).json({ error: 'ID prenotazione mancante.' });
        }

        // Fetch booking and verify ownership
        const { data: booking, error: bookingError } = await supabaseAdmin
            .from('bookings')
            .select('*')
            .eq('id', bookingId)
            .single();

        if (bookingError || !booking) {
            return res.status(404).json({ error: 'Prenotazione non trovata.' });
        }

        if (booking.user_id !== user.id) {
            return res.status(403).json({ error: 'Non autorizzato.' });
        }

        if (booking.payment_status !== 'paid') {
            return res.status(400).json({ error: 'Questa prenotazione non ha un pagamento attivo.' });
        }

        if (!booking.stripe_payment_intent_id) {
            return res.status(400).json({ error: 'Nessun pagamento trovato per questa prenotazione.' });
        }

        // Check refund window (48h for properties, 24h for activities)
        const checkInDate = new Date(booking.check_in);
        const now = new Date();
        const hoursUntilCheckIn = (checkInDate - now) / (1000 * 60 * 60);
        const refundWindowHours = booking.property_id ? 48 : 24;

        if (hoursUntilCheckIn < refundWindowHours) {
            return res.status(400).json({
                error: `La cancellazione gratuita non è più disponibile (limite: ${refundWindowHours}h prima del check-in).`
            });
        }

        // Process refund via Stripe
        await stripe.refunds.create({
            payment_intent: booking.stripe_payment_intent_id,
            reverse_transfer: true,
            refund_application_fee: true,
        });

        // Update booking status
        await supabaseAdmin
            .from('bookings')
            .update({
                status: 'cancellata',
                payment_status: 'refunded',
            })
            .eq('id', bookingId);

        // Update payments audit
        await supabaseAdmin
            .from('payments')
            .update({ status: 'refunded' })
            .eq('booking_id', bookingId);

        return res.status(200).json({ success: true });
    } catch (err) {
        console.error('Refund error:', err);
        return res.status(500).json({ error: 'Errore nell\'elaborazione del rimborso.' });
    }
}

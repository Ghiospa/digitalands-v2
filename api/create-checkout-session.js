import { stripe } from './_lib/stripe.js';
import { supabaseAdmin } from './_lib/supabase-admin.js';
import { getAuthUser } from './_lib/auth.js';
import { parseBody } from './_lib/body.js';

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

        const body = await parseBody(req);
        const { items, totals } = body;

        if (!items || !items.length) {
            return res.status(400).json({ error: 'Il carrello è vuoto.' });
        }

        // 1. Create Line Items for Stripe
        const line_items = items.map(item => {
            const isProperty = !!item.propertyId;
            const description = isProperty
                ? `Soggiorno: ${item.checkIn?.slice(0, 10)} → ${item.checkOut?.slice(0, 10)}`
                : `Attività: ${item.checkIn?.slice(0, 10)}`;

            return {
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: item.propertyName || item.activityName || 'Prenotazione Digitalands',
                        description,
                    },
                    unit_amount: Math.round(item.totalPrice * 100),
                },
                quantity: 1,
            };
        });

        // 2. Add Platform Service Fee (10%)
        if (totals.platformFee > 0) {
            line_items.push({
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: 'Costi di servizio piattaforma (10%)',
                        description: 'Commissione per la gestione della prenotazione e supporto 24/7',
                    },
                    unit_amount: Math.round(totals.platformFee * 100),
                },
                quantity: 1,
            });
        }

        // 3. Add Digital Membership Card if needed
        if (totals.membershipFee > 0) {
            line_items.push({
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: 'Digital Membership Card',
                        description: 'Accesso esclusivo ai vantaggi per Nomadi Digitali in Sicilia',
                    },
                    unit_amount: Math.round(totals.membershipFee * 100),
                },
                quantity: 1,
            });
        }

        // 4. Create Bookings in Supabase (Pending)
        const bookingIds = [];
        for (const item of items) {
            const bookingData = {
                user_id: user.id,
                property_id: item.propertyId || null,
                activity_id: item.activityId || null,
                property_name: item.propertyName || null,
                activity_name: item.activityName || null,
                check_in: item.checkIn,
                check_out: item.checkOut || null,
                guests: item.guests ? Number(item.guests) : null,
                months: item.months ? Number(item.months) : null,
                total_price: item.totalPrice,
                status: 'in-attesa',
                payment_status: 'pending',
                platform_fee: Math.round(item.totalPrice * PLATFORM_FEE_PERCENT * 100),
                manager_payout: Math.round(item.totalPrice * (1 - PLATFORM_FEE_PERCENT) * 100),
                category: item.category || null,
                emoji: item.emoji || null,
                time_slot: item.timeSlot || null,
            };

            const { data: booking, error: bookingError } = await supabaseAdmin
                .from('bookings')
                .insert([bookingData])
                .select()
                .single();

            if (!bookingError) {
                bookingIds.push(booking.id);
            } else {
                console.error('Booking insert error:', bookingError);
            }
        }

        if (bookingIds.length === 0) {
            return res.status(500).json({ error: 'Errore nella creazione delle prenotazioni.' });
        }

        // 5. Create Stripe Checkout Session
        const siteUrl = process.env.VITE_SITE_URL || 'https://digitalands-v2.vercel.app';

        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            payment_method_types: ['card'],
            line_items,
            metadata: {
                booking_ids: bookingIds.join(','),
                user_id: user.id,
                has_membership: totals.membershipFee > 0 ? 'true' : 'false',
            },
            success_url: `${siteUrl}/dashboard?payment=success&bookings=${bookingIds.join(',')}`,
            cancel_url: `${siteUrl}/dashboard?payment=cancelled`,
            locale: 'it',
        });

        // 6. Link session to all created bookings
        if (bookingIds.length > 0) {
            await supabaseAdmin
                .from('bookings')
                .update({ stripe_checkout_session_id: session.id })
                .in('id', bookingIds);
        }

        return res.status(200).json({ sessionUrl: session.url });
    } catch (err) {
        console.error('Checkout session error:', err);
        return res.status(500).json({ error: 'Errore nella creazione del pagamento.' });
    }
}

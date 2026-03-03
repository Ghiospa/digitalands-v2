import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import { createCheckoutSession, refundBooking as refundBookingApi } from '../lib/stripe';

const BookingContext = createContext(null);

export function BookingProvider({ children }) {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [paymentLoading, setPaymentLoading] = useState(false);

    useEffect(() => {
        if (user) {
            fetchUserBookings();
        } else {
            setBookings([]);
        }
    }, [user]);

    async function fetchUserBookings() {
        setLoading(true);
        const { data, error } = await supabase
            .from('bookings')
            .select('id, user_id, property_id, activity_id, property_name, activity_name, check_in, check_out, total_price, status, payment_status, platform_fee, manager_payout, created_at, category, emoji')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (!error && data) {
            setBookings(data);
        }
        setLoading(false);
    }

    async function addBooking(booking) {
        if (!user) return { error: 'Devi essere loggato per prenotare.' };

        setPaymentLoading(true);
        try {
            const { sessionUrl } = await createCheckoutSession({
                propertyId: booking.propertyId || null,
                activityId: booking.activityId || null,
                propertyName: booking.propertyName || null,
                activityName: booking.activityName || null,
                checkIn: booking.checkIn,
                checkOut: booking.checkOut || null,
                guests: booking.guests,
                months: booking.months,
                totalPrice: Number(booking.totalPrice || booking.price),
                category: booking.category || null,
                emoji: booking.emoji || null,
            });

            // Redirect to Stripe Checkout
            window.location.href = sessionUrl;
            return { redirecting: true };
        } catch (err) {
            setPaymentLoading(false);
            return { error: err.message };
        }
    }

    async function cancelBooking(bookingId) {
        const booking = bookings.find(b => b.id === bookingId);

        // If paid, process refund via Stripe
        if (booking?.payment_status === 'paid') {
            try {
                await refundBookingApi(bookingId);
                setBookings(prev =>
                    prev.map(b => b.id === bookingId
                        ? { ...b, status: 'cancellata', payment_status: 'refunded' }
                        : b
                    )
                );
                return { success: true };
            } catch (err) {
                return { error: err.message };
            }
        }

        // If pending/no payment, just cancel directly
        const { error } = await supabase
            .from('bookings')
            .update({ status: 'cancellata' })
            .eq('id', bookingId);

        if (!error) {
            setBookings(prev =>
                prev.map(b => b.id === bookingId ? { ...b, status: 'cancellata' } : b)
            );
        }
        return { error };
    }

    function getUserBookings() {
        return bookings;
    }

    const value = useMemo(() => ({
        bookings,
        addBooking,
        cancelBooking,
        getUserBookings,
        loading,
        paymentLoading
    }), [bookings, loading, paymentLoading]);

    return (
        <BookingContext.Provider value={value}>
            {children}
        </BookingContext.Provider>
    );
}

export function useBookings() {
    const ctx = useContext(BookingContext);
    if (!ctx) throw new Error('useBookings must be used inside BookingProvider');
    return ctx;
}

import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import { createCheckoutSession, refundBooking as refundBookingApi } from '../lib/stripe';

const BookingContext = createContext(null);

export function BookingProvider({ children }) {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [cart, setCart] = useState(() => {
        const saved = localStorage.getItem('digitalands_cart');
        return saved ? JSON.parse(saved) : [];
    });
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [paymentLoading, setPaymentLoading] = useState(false);

    useEffect(() => {
        if (user) {
            fetchUserBookings();
        } else {
            setBookings([]);
        }
    }, [user]);

    useEffect(() => {
        localStorage.setItem('digitalands_cart', JSON.stringify(cart));
    }, [cart]);

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

    const cartTotals = useMemo(() => {
        const itemsTotal = cart.reduce((acc, item) => acc + (Number(item.totalPrice) || 0), 0);
        const platformFee = itemsTotal * 0.10; // 10% Platform fee
        const needsMembership = user && !user.is_premium;
        const membershipFee = needsMembership ? 9.90 : 0;

        return {
            itemsTotal,
            platformFee,
            membershipFee,
            total: itemsTotal + platformFee + membershipFee
        };
    }, [cart, user]);

    function addToCart(item) {
        // Prevent duplicates for the same property stay if needed, 
        // but for now we just append.
        setCart(prev => [...prev, { ...item, cartId: Math.random().toString(36).substr(2, 9) }]);
        setIsCartOpen(true);
    }

    function removeFromCart(cartId) {
        setCart(prev => prev.filter(item => item.cartId !== cartId));
    }

    function clearCart() {
        setCart([]);
    }

    async function processCheckout() {
        if (!user) return { error: 'Devi essere loggato per procedere.' };
        if (cart.length === 0) return { error: 'Il carrello è vuoto.' };

        setPaymentLoading(true);
        try {
            // prepare items for the backend
            const { sessionUrl } = await createCheckoutSession({
                items: cart,
                totals: cartTotals
            });

            // Redirect to Stripe Checkout
            window.location.href = sessionUrl;
            return { redirecting: true };
        } catch (err) {
            setPaymentLoading(false);
            console.error('Checkout error:', err);
            return { error: err.message || 'Errore nel processare il pagamento.' };
        }
    }

    async function cancelBooking(bookingId) {
        const booking = bookings.find(b => b.id === bookingId);
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

    const value = useMemo(() => ({
        bookings,
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        cartTotals,
        isCartOpen,
        setIsCartOpen,
        processCheckout,
        cancelBooking,
        loading,
        paymentLoading
    }), [bookings, cart, isCartOpen, cartTotals, loading, paymentLoading]);

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

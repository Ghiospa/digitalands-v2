import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

const BookingContext = createContext(null);

export function BookingProvider({ children }) {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);

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
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (!error && data) {
            setBookings(data);
        }
        setLoading(false);
    }

    async function addBooking(booking) {
        if (!user) return { error: 'Devi essere loggato per prenotare.' };

        const bookingData = {
            user_id: user.id,
            property_id: booking.propertyId,
            activity_id: booking.activityId,
            property_name: booking.propertyName,
            activity_name: booking.activityName,
            check_in: booking.checkIn,
            check_out: booking.checkOut,
            total_price: Number(booking.totalPrice || booking.price),
            status: 'confermata',
        };

        const { data, error } = await supabase
            .from('bookings')
            .insert([bookingData])
            .select()
            .single();

        if (error) {
            console.error('Booking error:', error);
            return { error: error.message };
        }

        setBookings(prev => [data, ...prev]);
        return data;
    }

    async function cancelBooking(bookingId) {
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

    return (
        <BookingContext.Provider value={{ bookings, addBooking, cancelBooking, getUserBookings, loading }}>
            {children}
        </BookingContext.Provider>
    );
}

export function useBookings() {
    const ctx = useContext(BookingContext);
    if (!ctx) throw new Error('useBookings must be used inside BookingProvider');
    return ctx;
}

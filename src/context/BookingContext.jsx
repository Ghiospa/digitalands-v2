import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const BookingContext = createContext(null);

export function BookingProvider({ children }) {
    const { user } = useAuth();

    const [bookings, setBookings] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('digitalands_bookings') || '[]');
        } catch {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem('digitalands_bookings', JSON.stringify(bookings));
    }, [bookings]);

    function addBooking(booking) {
        const newBooking = {
            id: Date.now().toString(),
            userId: user?.id,
            createdAt: new Date().toISOString(),
            status: 'confermata', // confermata | cancellata | in-attesa
            ...booking,
        };
        setBookings(prev => [newBooking, ...prev]);
        return newBooking;
    }

    function cancelBooking(bookingId) {
        setBookings(prev =>
            prev.map(b => b.id === bookingId ? { ...b, status: 'cancellata' } : b)
        );
    }

    function getUserBookings() {
        if (!user) return [];
        return bookings.filter(b => b.userId === user.id);
    }

    return (
        <BookingContext.Provider value={{ bookings, addBooking, cancelBooking, getUserBookings }}>
            {children}
        </BookingContext.Provider>
    );
}

export function useBookings() {
    const ctx = useContext(BookingContext);
    if (!ctx) throw new Error('useBookings must be used inside BookingProvider');
    return ctx;
}

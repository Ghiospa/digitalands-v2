import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBookings } from '../context/BookingContext';
import { supabase } from '../lib/supabase';
import StarRating from '../components/StarRating';
import ReviewSection from '../components/ReviewSection';
import ImageGallery from '../components/ImageGallery';
import { useI18n } from '../context/I18nContext';

export default function ActivityDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { addBooking } = useBookings();
    const { t } = useI18n();

    const [activity, setActivity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [ratingData, setRatingData] = useState({ avg: 0, count: 0 });
    const [bookingDate, setBookingDate] = useState('');
    const [bookingStatus, setBookingStatus] = useState('idle'); // idle | loading | success | error
    const [bookingError, setBookingError] = useState(null);

    useEffect(() => {
        async function fetchActivity() {
            setLoading(true);
            const { data, error } = await supabase
                .from('activities')
                .select(`
                    *,
                    owner:profiles!activities_owner_id_fkey(name, stripe_charges_enabled)
                `)
                .eq('id', id)
                .single();

            if (!error && data) {
                setActivity(data);
            }
            setLoading(false);
        }

        async function fetchRating() {
            const { data, error } = await supabase
                .from('reviews')
                .select('rating')
                .eq('entity_type', 'activity')
                .eq('entity_id', id);

            if (!error && data && data.length > 0) {
                const avg = data.reduce((acc, r) => acc + r.rating, 0) / data.length;
                setRatingData({ avg, count: data.length });
            }
        }

        fetchActivity();
        fetchRating();
    }, [id]);

    const [guests, setGuests] = useState(1);
    const totalPrice = activity ? activity.price * guests : 0;

    async function handleBook(e) {
        e.preventDefault();
        if (!user) {
            navigate(`/auth?redirect=/activity/${id}`);
            return;
        }
        if (!bookingDate) return;

        setBookingStatus('loading');
        const res = await addBooking({
            activityId: activity.id,
            activityName: activity.name,
            checkIn: bookingDate,
            guests: guests,
            price: totalPrice,
            status: 'confermata',
        });

        if (res.error) {
            setBookingStatus('error');
            setBookingError(res.error);
        } else {
            setBookingStatus('success');
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-accent"></div>
            </div>
        );
    }

    if (!activity) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-textMuted">
                <p className="text-sm font-mono mb-4">Attività non trovata.</p>
                <button onClick={() => navigate(-1)} className="btn-ghost text-sm">← Torna indietro</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-20 px-6 md:px-10">
            <div className="max-w-content mx-auto">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 mb-8 text-xs font-mono text-textMuted">
                    <Link to="/" className="hover:text-accent transition-colors">Home</Link>
                    <span>›</span>
                    <Link to="/activities" className="hover:text-accent transition-colors">Attività</Link>
                    <span>›</span>
                    <span className="text-textPrimary">{activity.name}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-12">
                    {/* LEFT — Activity info */}
                    <div>
                        {/* Image Gallery */}
                        <div className="mb-12">
                            <ImageGallery
                                images={activity.images?.length > 0 ? activity.images : [activity.image_url]}
                                alt={activity.name}
                            />
                        </div>

                        <div className="flex items-center gap-2 mb-4">
                            <span style={{ fontSize: '2rem' }}>{activity.emoji}</span>
                            <div className="section-chip">{activity.category.toUpperCase()}</div>
                        </div>

                        <h1 className="font-serif text-textPrimary mb-4" style={{ fontSize: '2.5rem', lineHeight: 1.1 }}>
                            {activity.name}
                        </h1>

                        <div className="flex items-center gap-4 mb-8">
                            <div className="flex items-center gap-2">
                                <StarRating rating={Math.round(ratingData.avg)} size={20} />
                                {ratingData.count > 0 && (
                                    <span className="text-sm font-bold text-accent">{ratingData.avg.toFixed(1)}</span>
                                )}
                            </div>
                            <span className="text-textMuted text-sm">| {activity.duration}</span>
                        </div>

                        <div className="prose prose-invert mb-10">
                            <p className="text-lg text-textPrimary leading-relaxed opacity-90">{activity.description}</p>
                        </div>

                        {activity.meeting_point && (
                            <div className="p-6 rounded-xl mb-10" style={{ background: 'var(--surface)', border: '1px solid var(--border-light)' }}>
                                <h3 className="text-xs font-mono tracking-widest uppercase text-accent mb-4">Punto di Incontro</h3>
                                <div className="flex items-start gap-4">
                                    <div className="mt-1 text-xl">📍</div>
                                    <div>
                                        <p className="text-textPrimary font-medium mb-1">{activity.meeting_point}</p>
                                        {activity.meeting_point_url && (
                                            <a href={activity.meeting_point_url} target="_blank" rel="noopener noreferrer" className="text-xs text-accent underline">
                                                Apri su Google Maps
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div id="reviews">
                            <ReviewSection entityType="activity" entityId={activity.id} />
                        </div>
                    </div>

                    {/* RIGHT — Booking Sidebar */}
                    <div className="relative">
                        <div className="sticky top-24 p-8 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border-light)' }}>
                            <div className="mb-6">
                                <span className="text-xs text-textMuted">prezzo per persona</span>
                                <div className="text-3xl font-serif text-textPrimary">€{activity.price}</div>
                            </div>

                            {bookingStatus === 'success' ? (
                                <div className="text-center py-6">
                                    <div className="text-4xl mb-4">✅</div>
                                    <h4 className="font-serif text-xl mb-2">Prenotazione confermata!</h4>
                                    <p className="text-sm text-textMuted mb-6">Controlla la tua dashboard per i dettagli.</p>
                                    <Link to="/dashboard" className="btn-gold w-full text-center py-3 block">Vai alla Dashboard</Link>
                                </div>
                            ) : (
                                <form onSubmit={handleBook}>
                                    <div className="mb-6">
                                        <label className="text-xs font-mono tracking-widest uppercase text-textMuted block mb-2">Seleziona Data</label>
                                        <input
                                            type="date"
                                            className="waitlist-input mb-4"
                                            value={bookingDate}
                                            onChange={(e) => setBookingDate(e.target.value)}
                                            required
                                            min={new Date().toISOString().split('T')[0]}
                                        />

                                        <label className="text-xs font-mono tracking-widest uppercase text-textMuted block mb-2">Partecipanti</label>
                                        <div className="flex items-center gap-4 p-2 bg-var(--surface-2) rounded border border-var(--border-light)">
                                            <button type="button" onClick={() => setGuests(g => Math.max(1, g - 1))} className="w-8 h-8 rounded-full border border-var(--border) text-textPrimary flex items-center justify-center hover:border-accent transition-colors">−</button>
                                            <span className="font-mono text-lg">{guests}</span>
                                            <button type="button" onClick={() => setGuests(g => g + 1)} className="w-8 h-8 rounded-full border border-var(--border) text-textPrimary flex items-center justify-center hover:border-accent transition-colors">+</button>
                                        </div>
                                    </div>

                                    <div className="border-t pt-4 mb-6" style={{ borderColor: 'var(--border)' }}>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm text-textMuted">{guests}x Partecipanti</span>
                                            <span className="text-sm text-textPrimary">€{totalPrice}</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                                            <span className="font-medium">Totale</span>
                                            <span className="font-bold text-accent text-lg">€{totalPrice}</span>
                                        </div>
                                    </div>

                                    {bookingStatus === 'error' && (
                                        <div className="text-xs text-red-400 mb-4">❌ {bookingError}</div>
                                    )}

                                    <button
                                        type="submit"
                                        className="btn-gold w-full py-4 text-sm font-bold tracking-widest uppercase"
                                        disabled={bookingStatus === 'loading'}
                                    >
                                        {bookingStatus === 'loading' ? 'ELABORAZIONE...' : 'PRENOTA ORA →'}
                                    </button>

                                    <p className="text-[10px] text-textMuted text-center mt-4 font-mono">
                                        PAGAMENTO SICURO · CANCELLAZIONE ENTRO 24H
                                    </p>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

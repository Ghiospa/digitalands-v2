import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

function Stars({ rating, interactive = false, onSelect }) {
    const [hovered, setHovered] = useState(0);
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(n => (
                <button
                    key={n}
                    type={interactive ? 'button' : undefined}
                    disabled={!interactive}
                    onClick={() => interactive && onSelect?.(n)}
                    onMouseEnter={() => interactive && setHovered(n)}
                    onMouseLeave={() => interactive && setHovered(0)}
                    style={{
                        background: 'none',
                        border: 'none',
                        padding: '1px',
                        cursor: interactive ? 'pointer' : 'default',
                        fontSize: '16px',
                        color: n <= (hovered || rating) ? '#D4A853' : 'var(--border)',
                        transition: 'color 0.1s',
                    }}
                >
                    ★
                </button>
            ))}
        </div>
    );
}

function ReviewCard({ review }) {
    const initial = review.user_name?.charAt(0).toUpperCase() || '?';
    const date = new Date(review.created_at).toLocaleDateString('it-IT', {
        day: '2-digit', month: 'long', year: 'numeric'
    });

    return (
        <div style={{
            padding: '20px',
            borderRadius: '10px',
            background: 'var(--surface)',
            border: '1px solid var(--border-light)',
        }}>
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                    <div style={{
                        width: '36px', height: '36px',
                        borderRadius: '50%',
                        background: 'var(--accent)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '14px', fontWeight: 700, color: '#0A0A0A',
                        flexShrink: 0,
                    }}>
                        {initial}
                    </div>
                    <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {review.user_name || 'Utente anonimo'}
                        </div>
                        <div style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                            {date}
                        </div>
                    </div>
                </div>
                <Stars rating={review.rating} />
            </div>
            {review.comment && (
                <p style={{ fontSize: '0.87rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                    {review.comment}
                </p>
            )}
        </div>
    );
}

function ReviewForm({ propertyId, activityId, onSubmitted }) {
    const { user } = useAuth();
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(e) {
        e.preventDefault();
        if (rating === 0) { setError('Seleziona una valutazione.'); return; }
        setLoading(true);
        setError('');

        const { error: insertError } = await supabase.from('reviews').insert([{
            property_id: propertyId || null,
            activity_id: activityId || null,
            user_id: user.id,
            user_name: user.name || user.email?.split('@')[0],
            rating,
            comment: comment.trim() || null,
        }]);

        setLoading(false);
        if (insertError) {
            setError('Errore nel salvataggio. Riprova.');
            console.error('Review insert error:', insertError);
        } else {
            setRating(0);
            setComment('');
            onSubmitted?.();
        }
    }

    return (
        <form onSubmit={handleSubmit} style={{
            padding: '20px',
            borderRadius: '10px',
            background: 'var(--surface)',
            border: '1px solid rgba(212,168,83,0.2)',
        }}>
            <div style={{ fontSize: '11px', fontFamily: 'monospace', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '14px' }}>
                Lascia una recensione
            </div>
            <div style={{ marginBottom: '14px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>La tua valutazione</div>
                <Stars rating={rating} interactive onSelect={setRating} />
            </div>
            <div style={{ marginBottom: '14px' }}>
                <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="Racconta la tua esperienza... (opzionale)"
                    maxLength={500}
                    rows={3}
                    style={{
                        width: '100%', padding: '10px 14px',
                        background: 'var(--surface-2)', border: '1px solid var(--border)',
                        borderRadius: '8px', color: 'var(--text-primary)',
                        fontSize: '0.87rem', fontFamily: 'inherit', outline: 'none',
                        resize: 'vertical',
                    }}
                />
            </div>
            {error && (
                <div style={{ fontSize: '12px', color: '#f87171', marginBottom: '10px' }}>{error}</div>
            )}
            <button type="submit" className="btn-gold" disabled={loading}
                style={{ padding: '10px 24px', fontSize: '0.85rem' }}>
                {loading ? 'Invio...' : 'Pubblica recensione →'}
            </button>
        </form>
    );
}

export default function ReviewsSection({ propertyId, activityId }) {
    const { user } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hasBooking, setHasBooking] = useState(false);
    const [hasReviewed, setHasReviewed] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const targetId = propertyId || activityId;
    const targetColumn = propertyId ? 'property_id' : 'activity_id';

    useEffect(() => {
        async function fetchReviews() {
            setLoading(true);
            const { data, error } = await supabase
                .from('reviews')
                .select('*')
                .eq(targetColumn, targetId)
                .order('created_at', { ascending: false });

            if (!error && data) {
                setReviews(data);
                if (user) {
                    setHasReviewed(data.some(r => r.user_id === user.id));
                }
            }
            setLoading(false);
        }
        fetchReviews();
    }, [targetId, targetColumn, user, refreshKey]);

    // Check if logged-in user has a completed booking for this item
    useEffect(() => {
        if (!user) return;
        async function checkBooking() {
            const column = propertyId ? 'property_id' : 'activity_id';
            const { data } = await supabase
                .from('bookings')
                .select('id')
                .eq('user_id', user.id)
                .eq(column, targetId)
                .eq('status', 'confermata')
                .limit(1);

            setHasBooking(data && data.length > 0);
        }
        checkBooking();
    }, [user, targetId, propertyId]);

    // Average rating
    const avgRating = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : null;

    const canReview = user && hasBooking && !hasReviewed;

    return (
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '32px', marginTop: '32px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '11px', fontFamily: 'monospace', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', margin: 0 }}>
                    Recensioni
                </h3>
                {avgRating && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: '#D4A853', fontSize: '14px' }}>★</span>
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>{avgRating}</span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                            ({reviews.length} {reviews.length === 1 ? 'recensione' : 'recensioni'})
                        </span>
                    </div>
                )}
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '12px', fontFamily: 'monospace' }}>
                    Caricamento...
                </div>
            ) : (
                <>
                    {/* Review list */}
                    {reviews.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                            {reviews.map(r => <ReviewCard key={r.id} review={r} />)}
                        </div>
                    ) : (
                        <div style={{
                            padding: '24px', textAlign: 'center',
                            border: '1px dashed var(--border)', borderRadius: '10px',
                            marginBottom: '24px',
                        }}>
                            <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>⭐</div>
                            <div style={{ fontSize: '0.87rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                                Ancora nessuna recensione.
                            </div>
                        </div>
                    )}

                    {/* Review form */}
                    {canReview && (
                        <ReviewForm
                            propertyId={propertyId}
                            activityId={activityId}
                            onSubmitted={() => setRefreshKey(k => k + 1)}
                        />
                    )}
                    {user && hasBooking && hasReviewed && (
                        <div style={{ fontSize: '12px', color: 'var(--accent)', fontFamily: 'monospace', textAlign: 'center', padding: '12px' }}>
                            ✓ Hai già lasciato una recensione
                        </div>
                    )}
                    {user && !hasBooking && (
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace', textAlign: 'center', padding: '12px' }}>
                            Solo gli ospiti con un soggiorno confermato possono recensire.
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

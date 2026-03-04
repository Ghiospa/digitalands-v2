import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import StarRating from './StarRating';

export default function ReviewSection({ entityType, entityId }) {
    const { user } = useAuth();
    const { t } = useI18n();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [newReview, setNewReview] = useState({ rating: 0, comment: '' });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        fetchReviews();
    }, [entityType, entityId]);

    async function fetchReviews() {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('reviews')
                .select('*, profiles(name)')
                .eq('entity_type', entityType)
                .eq('entity_id', entityId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setReviews(data || []);
        } catch (err) {
            console.error('Error fetching reviews:', err);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!user) return;
        if (newReview.rating === 0) {
            setError('Please select a rating');
            return;
        }

        setSubmitting(true);
        setError(null);
        try {
            const { error } = await supabase
                .from('reviews')
                .insert({
                    user_id: user.id,
                    entity_type: entityType,
                    entity_id: entityId.toString(),
                    rating: newReview.rating,
                    comment: newReview.comment,
                });

            if (error) throw error;

            setSuccess(true);
            setNewReview({ rating: 0, comment: '' });
            fetchReviews();
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    const averageRating = reviews.length > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : 0;

    return (
        <div style={{ marginTop: '40px', borderTop: '1px solid var(--border)', paddingTop: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h3 style={{ fontFamily: 'serif', fontSize: '1.5rem', color: 'var(--text-primary)' }}>
                    {t('rev_title')} ({reviews.length})
                </h3>
                {reviews.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <StarRating rating={Math.round(averageRating)} size={20} />
                        <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent)' }}>{averageRating}</span>
                    </div>
                )}
            </div>

            {/* List of Reviews */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '40px' }}>
                {loading ? (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading reviews...</div>
                ) : reviews.length === 0 ? (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>
                        {t('rev_empty')}
                    </div>
                ) : (
                    reviews.map(review => (
                        <div key={review.id} style={{ padding: '16px', background: 'var(--surface-2)', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                                    {review.profiles?.name || 'Anonymous User'}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    {new Date(review.created_at).toLocaleDateString()}
                                </div>
                            </div>
                            <StarRating rating={review.rating} size={14} />
                            {review.comment && (
                                <p style={{ marginTop: '10px', fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.5, opacity: 0.9 }}>
                                    {review.comment}
                                </p>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Submit Form */}
            <div style={{ padding: '24px', background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '20px', color: 'var(--text-primary)' }}>
                    {t('rev_add')}
                </h4>

                {!user ? (
                    <div style={{ textAlign: 'center', padding: '10px' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '12px' }}>{t('rev_login')}</p>
                        <a href="/auth" className="btn-ghost" style={{ fontSize: '0.8rem' }}>{t('nav_login')}</a>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '8px' }}>
                                {t('rev_rating')}
                            </label>
                            <StarRating
                                rating={newReview.rating}
                                interactive={true}
                                onRate={(r) => setNewReview(prev => ({ ...prev, rating: r }))}
                                size={24}
                            />
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label htmlFor="comment" style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '8px' }}>
                                {t('rev_comment')}
                            </label>
                            <textarea
                                id="comment"
                                className="waitlist-input"
                                value={newReview.comment}
                                onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                                rows="3"
                                style={{ resize: 'none' }}
                                placeholder="Scrivi qui la tua esperienza..."
                            />
                        </div>

                        {error && (
                            <div style={{ color: '#f87171', fontSize: '0.85rem', marginBottom: '16px' }}>
                                ⚠️ {error}
                            </div>
                        )}

                        {success && (
                            <div style={{ color: '#4ade80', fontSize: '0.85rem', marginBottom: '16px' }}>
                                ✅ {t('rev_success')}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn-gold"
                            disabled={submitting}
                            style={{ width: '100%', padding: '12px' }}
                        >
                            {submitting ? '...' : t('rev_submit')}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

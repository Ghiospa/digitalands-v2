import { useState, memo, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBookings } from '../context/BookingContext';
import { CATEGORIES, CAT_COLORS } from '../data/categories';

/* ─── Data ─── */
const ACTIVITIES = [
    {
        id: 'surf-mondello',
        name: 'Surf — Mondello Beach',
        category: 'Surf',
        description: 'Lezione di surf per principianti e intermedi con istruttori certificati. Tavola e muta incluse.',
        price: 65,
        duration: '2h',
        emoji: '🏄',
        image: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800&q=75&auto=format',
    },
    {
        id: 'kite-surf',
        name: 'Kite Surf Experience',
        category: 'Kite Surf',
        description: 'Scopri il kite surf sul Mar Tirreno. Attrezzatura professionale e istruttore dedicato.',
        price: 90,
        duration: '3h',
        emoji: '🪁',
        image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=75&auto=format',
    },
    {
        id: 'yoga-cliff',
        name: 'Sunrise Yoga on the Cliff',
        category: 'Yoga',
        description: "Sessione di yoga all'alba sulla scogliera con vista mozzafiato sul Mediterraneo.",
        price: 35,
        duration: '1h 30min',
        emoji: '🧘',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=75&auto=format',
    },
    {
        id: 'etna-trekking',
        name: 'Trekking Etna',
        category: 'Escursioni',
        description: "Escursione guidata sul vulcano attivo piu alto d'Europa. Equipaggiamento e guida inclusi.",
        price: 55,
        duration: '6h',
        emoji: '🌋',
        image: 'https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=800&q=75&auto=format',
    },
    {
        id: 'snorkeling-zingaro',
        name: 'Snorkeling — Riserva Zingaro',
        category: 'Snorkeling',
        description: 'Immersioni guidate nella riserva naturale dello Zingaro. Maschera, pinne e boccaglio inclusi.',
        price: 45,
        duration: '3h',
        emoji: '🤿',
        image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=75&auto=format',
    },
    {
        id: 'street-food-palermo',
        name: 'Street Food Tour — Palermo',
        category: 'Food & Wine',
        description: 'Tour gastronomico nei mercati storici di Palermo: Ballarò, Vucciria e Capo. Guida e degustazioni incluse.',
        price: 40,
        duration: '2h 30min',
        emoji: '🍋',
        image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=75&auto=format',
    },
    {
        id: 'wine-etna',
        name: 'Degustazione Vini Etna DOC',
        category: 'Food & Wine',
        description: "Visita a un antico palmento e degustazione di 5 etichette DOC dell'Etna con abbinamento tipico.",
        price: 50,
        duration: '2h',
        emoji: '🍷',
        image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=75&auto=format',
    },
    {
        id: 'kayak-isola-bella',
        name: 'Sea Kayak — Isola Bella',
        category: 'Escursioni',
        description: "Giro in kayak attorno all'Isola Bella di Taormina. Grotte marine, acque cristalline e panorami unici.",
        price: 55,
        duration: '4h',
        emoji: '🛶',
        image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=75&auto=format',
    },
    {
        id: 'yoga-tramonto',
        name: 'Yoga al Tramonto',
        category: 'Yoga',
        description: 'Sessione di Hatha yoga al tramonto sulla terrazza con vista sulle Eolie.',
        price: 30,
        duration: '1h 30min',
        emoji: '🌅',
        image: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=800&q=75&auto=format',
    },
    {
        id: 'windsurf-avanzato',
        name: 'Wind Surf Avanzato',
        category: 'Surf',
        description: 'Sessione avanzata di windsurf per chi ha già esperienza. Vento garantito e istruttore a bordo.',
        price: 80,
        duration: '3h',
        emoji: '🌊',
        image: 'https://images.unsplash.com/photo-1489107879168-8e3f4c4a4c2a?w=800&q=75&auto=format',
    },
];


/* ─── Badge ─── */
const CategoryBadge = memo(function CategoryBadge({ cat }) {
    const c = CAT_COLORS[cat] || { color: 'var(--accent)', bg: 'var(--accent-dim)' };
    return (
        <span style={{
            fontSize: '10px', fontFamily: 'monospace', letterSpacing: '0.08em',
            textTransform: 'uppercase', fontWeight: 600,
            color: c.color, background: c.bg,
            padding: '3px 9px', borderRadius: '4px',
            border: `1px solid ${c.color}33`,
        }}>{cat}</span>
    );
});

/* ─── Activity Card ─── */
const ActivityCard = memo(function ActivityCard({ activity, onBook }) {
    return (
        <div className="card-hover" style={{ background: 'var(--surface)', overflow: 'hidden' }}>
            {/* Image */}
            <div style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
                <img
                    src={activity.image + (activity.image.includes('?') ? '&' : '?') + 'w=800&q=75&auto=format'}
                    alt={activity.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    loading="lazy"
                />
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 60%)',
                }} />
                <div style={{ position: 'absolute', bottom: 12, left: 14 }}>
                    <CategoryBadge cat={activity.category} />
                </div>
            </div>

            {/* Body */}
            <div style={{ padding: '18px 20px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: '1.4rem', lineHeight: 1, marginTop: 2 }}>{activity.emoji}</span>
                    <div>
                        <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.3 }}>
                            {activity.name}
                        </div>
                        <div style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-muted)', marginTop: 3 }}>
                            ⏱ {activity.duration}
                        </div>
                    </div>
                </div>
                <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', lineHeight: 1.55, marginBottom: 16 }}>
                    {activity.description}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <span style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--accent)' }}>€{activity.price}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace', marginLeft: 4 }}>/ persona</span>
                    </div>
                    <button
                        className="btn-gold"
                        style={{ padding: '9px 20px', fontSize: '0.82rem' }}
                        onClick={() => onBook(activity)}
                    >
                        Prenota
                    </button>
                </div>
            </div>
        </div>
    );
});

/* ─── Booking Modal ─── */
const BookingModal = memo(function BookingModal({ activity, onClose, onConfirm }) {
    const today = new Date().toISOString().split('T')[0];
    const [date, setDate] = useState('');
    const [timeSlot, setTimeSlot] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [done, setDone] = useState(false);

    const slots = activity.slots || ['09:00', '11:00', '14:00', '16:00'];
    const canConfirm = date && (slots.length === 0 || timeSlot);

    async function handleConfirm() {
        if (!canConfirm) return;
        setLoading(true);
        setError(null);
        try {
            const res = await onConfirm({ activity, date, timeSlot });
            if (res?.error) {
                setError(res.error);
            } else {
                setDone(true);
            }
        } catch (err) {
            setError(err.message || 'Errore durante la prenotazione. Riprova più tardi.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div
            style={{
                position: 'fixed', inset: 0, zIndex: 200,
                background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '24px',
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: 'var(--surface)', border: '1px solid var(--border-light)',
                    borderRadius: '12px', padding: '32px', maxWidth: '420px', width: '100%',
                    position: 'relative',
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Close */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute', top: 16, right: 16,
                        background: 'none', border: 'none', color: 'var(--text-muted)',
                        fontSize: '1.3rem', cursor: 'pointer', lineHeight: 1,
                    }}
                >×</button>

                {!done ? (
                    <>
                        {/* Header */}
                        <div style={{ marginBottom: 24 }}>
                            <div style={{ fontSize: '1.6rem', marginBottom: 8 }}>{activity.emoji}</div>
                            <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                                {activity.name}
                            </div>
                            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                                <CategoryBadge cat={activity.category} />
                                <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                                    ⏱ {activity.duration}
                                </span>
                                {activity.location && (
                                    <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                                        📍 {activity.location}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Date picker */}
                        <div style={{ marginBottom: 20 }}>
                            <label style={{
                                display: 'block', fontSize: '11px', fontFamily: 'monospace',
                                letterSpacing: '0.1em', textTransform: 'uppercase',
                                color: 'var(--text-muted)', marginBottom: 8,
                            }}>
                                Data preferita
                            </label>
                            <input
                                type="date"
                                className="waitlist-input"
                                min={today}
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                style={{ colorScheme: 'dark' }}
                            />
                        </div>

                        {/* Time slot picker */}
                        <div style={{ marginBottom: 24 }}>
                            <label style={{
                                display: 'block', fontSize: '11px', fontFamily: 'monospace',
                                letterSpacing: '0.1em', textTransform: 'uppercase',
                                color: 'var(--text-muted)', marginBottom: 10,
                            }}>
                                Orario ⏱
                            </label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {slots.map(s => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => setTimeSlot(s)}
                                        style={{
                                            padding: '7px 16px', borderRadius: '8px',
                                            fontSize: '13px', fontFamily: 'monospace',
                                            cursor: 'pointer',
                                            border: timeSlot === s ? '1px solid var(--accent)' : '1px solid var(--border-light)',
                                            background: timeSlot === s ? 'var(--accent-dim)' : 'transparent',
                                            color: timeSlot === s ? 'var(--accent)' : 'var(--text-muted)',
                                            transition: 'all 0.15s',
                                        }}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Price summary */}
                        <div style={{
                            background: 'var(--surface-2)', borderRadius: '8px',
                            padding: '14px 16px', marginBottom: 24,
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Totale (1 persona)</span>
                            <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent)' }}>€{activity.price}</span>
                        </div>

                        <button
                            className="btn-gold"
                            style={{ width: '100%', padding: '13px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                            onClick={handleConfirm}
                            disabled={!canConfirm || loading}
                        >
                            {loading && <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>}
                            {loading ? 'Elaborazione...' : 'Conferma prenotazione'}
                        </button>
                        {error && (
                            <div style={{
                                marginTop: '12px', padding: '10px', borderRadius: '6px',
                                background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)',
                                color: '#f87171', fontSize: '12px', textAlign: 'center'
                            }}>
                                ⚠️ {error}
                            </div>
                        )}
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', marginTop: 12, fontFamily: 'monospace' }}>
                            Riceverai una conferma via email entro 24h
                        </p>
                    </>
                ) : (
                    /* Success state */
                    <div style={{ textAlign: 'center', padding: '12px 0' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>✅</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
                            Prenotazione confermata!
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 24 }}>
                            <strong style={{ color: 'var(--accent)' }}>{activity.name}</strong>
                            {timeSlot && <> — <span style={{ color: 'var(--accent)' }}>ore {timeSlot}</span></>}
                            <br />{new Date(date + 'T12:00:00').toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </div>
                        <button className="btn-ghost" style={{ width: '100%' }} onClick={onClose}>
                            Chiudi
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
});

/* ─── Main Page ─── */
export default function ActivitiesPage() {
    const { user } = useAuth();
    const { addBooking } = useBookings();
    const navigate = useNavigate();
    const [activeCategory, setActiveCategory] = useState('Tutto');
    const [bookingActivity, setBookingActivity] = useState(null);

    const filtered = useMemo(() => activeCategory === 'Tutto'
        ? ACTIVITIES
        : ACTIVITIES.filter(a => a.category === activeCategory), [activeCategory]);

    function handleBook(activity) {
        if (!user) {
            navigate('/auth?redirect=/activities');
            return;
        }
        setBookingActivity(activity);
    }

    async function handleConfirm({ activity, date }) {
        const result = await addBooking({
            activityId: activity.id,
            activityName: activity.name,
            category: activity.category,
            emoji: activity.emoji,
            checkIn: date,
            totalPrice: activity.price,
        });
        if (result?.error) {
            alert(result.error);
        }
        // If redirecting to Stripe, the page navigates away
        setBookingActivity(null);
    }

    return (
        <div style={{ minHeight: '100vh', paddingTop: '80px', paddingBottom: '80px' }}>

            {/* ── Hero ── */}
            <div style={{
                padding: '56px 24px 52px',
                textAlign: 'center',
                borderBottom: '1px solid var(--border)',
                background: 'linear-gradient(160deg, var(--surface) 0%, var(--bg) 100%)',
                position: 'relative',
                overflow: 'hidden',
            }}>
                {/* Ambient circle */}
                <div style={{
                    position: 'absolute', top: '-80px', left: '50%', transform: 'translateX(-50%)',
                    width: '480px', height: '480px', borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(212,168,83,0.07) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }} />

                <div className="section-chip" style={{ margin: '0 auto 20px' }}>
                    ✦ Esperienze Siciliane
                </div>
                <h1 style={{
                    fontFamily: "'Unbounded', sans-serif",
                    fontSize: 'clamp(2rem, 5vw, 3rem)',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    marginBottom: 16,
                    lineHeight: 1.1,
                }}>
                    Vivi la Sicilia<br />
                    <span style={{ color: 'var(--accent)' }}>come un locale</span>
                </h1>
                <p style={{
                    fontSize: '1rem', color: 'var(--text-muted)', maxWidth: '520px',
                    margin: '0 auto', lineHeight: 1.65,
                }}>
                    Surf, yoga, escursioni sull'Etna, street food a Palermo e molto altro.
                    Prenota la tua esperienza e porta a casa un ricordo indimenticabile.
                </p>
            </div>

            {/* ── Category filters ── */}
            <div style={{
                display: 'flex', gap: '10px', flexWrap: 'wrap',
                justifyContent: 'center', padding: '32px 24px 0',
            }}>
                {CATEGORIES.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        style={{
                            padding: '8px 20px',
                            borderRadius: '100px',
                            border: activeCategory === cat
                                ? '1px solid var(--accent)'
                                : '1px solid var(--border-light)',
                            background: activeCategory === cat ? 'var(--accent-dim)' : 'transparent',
                            color: activeCategory === cat ? 'var(--accent)' : 'var(--text-muted)',
                            fontSize: '0.82rem',
                            fontFamily: 'monospace',
                            cursor: 'pointer',
                            transition: 'all 0.18s ease',
                            letterSpacing: '0.03em',
                        }}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* ── Grid ── */}
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '36px 24px 0',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '24px',
            }}>
                {filtered.map(activity => (
                    <ActivityCard key={activity.id} activity={activity} onBook={handleBook} />
                ))}
            </div>

            {/* ── Not logged in nudge ── */}
            {!user && (
                <div style={{
                    textAlign: 'center', marginTop: '48px',
                    padding: '24px',
                    color: 'var(--text-muted)', fontSize: '0.9rem',
                }}>
                    <span>Hai già un account? </span>
                    <button
                        onClick={() => navigate('/auth?redirect=/activities')}
                        style={{
                            background: 'none', border: 'none',
                            color: 'var(--accent)', cursor: 'pointer',
                            fontSize: '0.9rem', textDecoration: 'underline',
                        }}
                    >
                        Accedi per prenotare
                    </button>
                </div>
            )}

            {/* ── Booking modal ── */}
            {bookingActivity && (
                <BookingModal
                    activity={bookingActivity}
                    onClose={() => setBookingActivity(null)}
                    onConfirm={handleConfirm}
                />
            )}
        </div>
    );
}

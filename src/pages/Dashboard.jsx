import { useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBookings } from '../context/BookingContext';
import DigitalCard from '../components/DigitalCard';

function StatusBadge({ status }) {
    const map = {
        confermata: { label: 'Confermata', color: '#4ade80', bg: 'rgba(74,222,128,0.08)', border: 'rgba(74,222,128,0.2)' },
        cancellata: { label: 'Cancellata', color: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.2)' },
        'in-attesa': { label: 'In attesa', color: 'var(--accent)', bg: 'var(--accent-dim)', border: 'rgba(212,168,83,0.2)' },
    };
    const s = map[status] || map['in-attesa'];
    return (
        <span className="font-mono text-[10px] tracking-widest uppercase px-2.5 py-1 rounded"
            style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}>
            {s.label}
        </span>
    );
}

function BookingCard({ booking, onCancel }) {
    const checkIn = new Date(booking.checkIn);
    const checkOut = new Date(booking.checkOut);
    const isUpcoming = checkIn > new Date();

    return (
        <div className="rounded-lg p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border-light)' }}>
            <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                    <div className="font-medium text-textPrimary mb-0.5">{booking.propertyName}</div>
                    <div className="text-xs text-textMuted font-mono">{booking.location}</div>
                </div>
                <StatusBadge status={booking.status} />
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
                <div>
                    <div className="text-[10px] font-mono tracking-widest uppercase text-textMuted mb-1">Check-in</div>
                    <div className="text-sm text-textPrimary">{checkIn.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: '2-digit' })}</div>
                </div>
                <div>
                    <div className="text-[10px] font-mono tracking-widest uppercase text-textMuted mb-1">Check-out</div>
                    <div className="text-sm text-textPrimary">{checkOut.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: '2-digit' })}</div>
                </div>
                <div>
                    <div className="text-[10px] font-mono tracking-widest uppercase text-textMuted mb-1">Totale</div>
                    <div className="text-sm" style={{ color: 'var(--accent)' }}>€{booking.totalPrice}</div>
                </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                <Link to={`/property/${booking.propertyId}`}
                    className="text-xs text-textMuted hover:text-accent transition-colors font-mono">
                    Rivedi struttura →
                </Link>
                {booking.status === 'confermata' && isUpcoming && (
                    <button onClick={() => onCancel(booking.id)}
                        className="text-xs text-textMuted hover:text-red-400 transition-colors font-mono">
                        Cancella
                    </button>
                )}
            </div>
        </div>
    );
}

function ProfileSection({ user, onUpdate }) {
    const [form, setForm] = useState({ name: user.name, email: user.email });
    const [saved, setSaved] = useState(false);

    function handleSave(e) {
        e.preventDefault();
        onUpdate(form);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    }

    return (
        <form onSubmit={handleSave} className="space-y-4 max-w-sm">
            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono tracking-widest uppercase text-textMuted">Nome</label>
                <input className="waitlist-input" value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono tracking-widest uppercase text-textMuted">Email</label>
                <input className="waitlist-input" type="email" value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <button type="submit" className="btn-gold" style={{ padding: '11px 24px', fontSize: '0.85rem' }}>
                {saved ? '✓ Salvato' : 'Salva modifiche'}
            </button>
        </form>
    );
}

const CAT_COLORS = {
    'Surf': '#60a5fa',
    'Kite Surf': '#a78bfa',
    'Yoga': '#4ade80',
    'Escursioni': '#fb923c',
    'Snorkeling': '#22d3ee',
    'Food & Wine': '#D4A853',
};

function ActivityBookingsTab({ userId }) {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState(() => {
        try {
            const all = JSON.parse(localStorage.getItem('digitalands_activity_bookings') || '[]');
            return all.filter(b => b.userId === userId);
        } catch { return []; }
    });

    function cancelBooking(id) {
        try {
            const all = JSON.parse(localStorage.getItem('digitalands_activity_bookings') || '[]');
            const updated = all.map(b => b.id === id ? { ...b, status: 'cancellata' } : b);
            localStorage.setItem('digitalands_activity_bookings', JSON.stringify(updated));
            setBookings(updated.filter(b => b.userId === userId));
        } catch { /* ignore */ }
    }

    if (bookings.length === 0) {
        return (
            <div className="text-center py-20 text-textMuted">
                <div className="text-4xl mb-4">🏄</div>
                <p className="text-sm font-mono mb-6">Non hai ancora prenotato nessuna attività.</p>
                <button className="btn-ghost text-sm" onClick={() => navigate('/activities')}>
                    Scopri le attività →
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {bookings.map(b => {
                const catColor = CAT_COLORS[b.category] || 'var(--accent)';
                const isPast = new Date(b.date) < new Date();
                return (
                    <div key={b.id} className="rounded-lg p-5"
                        style={{ background: 'var(--surface)', border: '1px solid var(--border-light)' }}>
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="flex items-center gap-3">
                                <span style={{ fontSize: '1.5rem' }}>{b.emoji}</span>
                                <div>
                                    <div className="font-medium text-textPrimary mb-0.5">{b.activityName}</div>
                                    <span style={{
                                        fontSize: '10px', fontFamily: 'monospace', letterSpacing: '0.08em',
                                        textTransform: 'uppercase', fontWeight: 600,
                                        color: catColor, background: `${catColor}18`,
                                        padding: '2px 8px', borderRadius: '4px',
                                        border: `1px solid ${catColor}33`,
                                    }}>{b.category}</span>
                                </div>
                            </div>
                            <span className="font-mono text-[10px] tracking-widest uppercase px-2.5 py-1 rounded"
                                style={{
                                    color: b.status === 'cancellata' ? '#f87171' : '#4ade80',
                                    background: b.status === 'cancellata' ? 'rgba(248,113,113,0.08)' : 'rgba(74,222,128,0.08)',
                                    border: `1px solid ${b.status === 'cancellata' ? 'rgba(248,113,113,0.2)' : 'rgba(74,222,128,0.2)'}`,
                                }}>
                                {b.status === 'cancellata' ? 'Cancellata' : 'Confermata'}
                            </span>
                        </div>
                        <div className="grid grid-cols-3 gap-3 mb-4">
                            <div>
                                <div className="text-[10px] font-mono tracking-widest uppercase text-textMuted mb-1">Data</div>
                                <div className="text-sm text-textPrimary">
                                    {new Date(b.date + 'T12:00:00').toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: '2-digit' })}
                                </div>
                            </div>
                            <div>
                                <div className="text-[10px] font-mono tracking-widest uppercase text-textMuted mb-1">Durata</div>
                                <div className="text-sm text-textPrimary">{b.duration}</div>
                            </div>
                            <div>
                                <div className="text-[10px] font-mono tracking-widest uppercase text-textMuted mb-1">Totale</div>
                                <div className="text-sm" style={{ color: 'var(--accent)' }}>€{b.price}</div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                            <Link to="/activities" className="text-xs text-textMuted hover:text-accent transition-colors font-mono">
                                Vedi tutte le attività →
                            </Link>
                            {b.status === 'confermata' && !isPast && (
                                <button onClick={() => cancelBooking(b.id)}
                                    className="text-xs text-textMuted hover:text-red-400 transition-colors font-mono">
                                    Cancella
                                </button>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default function Dashboard() {
    const { user, logout, updateProfile } = useAuth();
    const { getUserBookings, cancelBooking } = useBookings();
    const [activeTab, setActiveTab] = useState('bookings');

    if (!user) return <Navigate to="/auth?redirect=/dashboard" replace />;

    const bookings = getUserBookings();
    const upcoming = bookings.filter(b => b.status !== 'cancellata' && new Date(b.checkIn) > new Date());
    const past = bookings.filter(b => b.status === 'cancellata' || new Date(b.checkOut) <= new Date());

    const tabs = [
        { id: 'bookings', label: 'Prenotazioni' },
        { id: 'activities', label: 'Attività' },
        { id: 'profile', label: 'Profilo' },
    ];

    const tabStyle = (t) => ({
        padding: '8px 20px',
        fontSize: '0.82rem',
        fontFamily: 'monospace',
        letterSpacing: '0.04em',
        cursor: 'pointer',
        background: 'none',
        border: 'none',
        borderBottom: activeTab === t ? '2px solid var(--accent)' : '2px solid transparent',
        color: activeTab === t ? 'var(--text-primary)' : 'var(--text-muted)',
        transition: 'color 0.2s, border-color 0.2s',
    });

    return (
        <div className="min-h-screen pt-20 pb-20 px-6 md:px-10">
            <div className="max-w-content mx-auto">
                {/* Header */}
                <div className="flex items-start justify-between mb-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-[#0A0A0A] text-lg flex-shrink-0"
                            style={{ background: 'var(--accent)' }}>
                            {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div className="text-xs font-mono tracking-widest uppercase text-textMuted mb-0.5">Benvenuto</div>
                            <div className="font-serif text-2xl text-textPrimary">{user.name}</div>
                            <div className="text-sm text-textMuted">{user.email}</div>
                        </div>
                    </div>
                    <button onClick={logout} className="btn-ghost text-sm" style={{ padding: '8px 18px', fontSize: '0.8rem' }}>
                        Logout
                    </button>
                </div>

                {/* Stats bar */}
                <div className="grid grid-cols-3 gap-4 mb-10">
                    {[
                        { label: 'Prenotazioni', value: bookings.length },
                        { label: 'In arrivo', value: upcoming.length },
                        { label: 'Completate/ann.', value: past.length },
                    ].map(s => (
                        <div key={s.label} className="rounded-lg p-4"
                            style={{ background: 'var(--surface)', border: '1px solid var(--border-light)' }}>
                            <div className="font-serif text-2xl" style={{ color: 'var(--accent)' }}>{s.value}</div>
                            <div className="text-xs font-mono tracking-wider text-textMuted uppercase mt-0.5">{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="flex border-b mb-8" style={{ borderColor: 'var(--border)' }}>
                    {tabs.map(t => (
                        <button key={t.id} style={tabStyle(t.id)} onClick={() => setActiveTab(t.id)}>
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Tab: Activities */}
                {activeTab === 'activities' && (
                    <ActivityBookingsTab userId={user.id} />
                )}

                {/* Tab: Bookings */}
                {activeTab === 'bookings' && (
                    <div>
                        {bookings.length === 0 ? (
                            <div className="text-center py-20 text-textMuted">
                                <div className="text-4xl mb-4">🏡</div>
                                <p className="text-sm font-mono mb-6">Non hai ancora prenotazioni.</p>
                                <Link to="/#properties" className="btn-ghost text-sm">Esplora le strutture →</Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {upcoming.length > 0 && (
                                    <>
                                        <div className="text-xs font-mono tracking-widest uppercase text-textMuted mb-3">In arrivo</div>
                                        {upcoming.map(b => (
                                            <BookingCard key={b.id} booking={b} onCancel={cancelBooking} />
                                        ))}
                                    </>
                                )}
                                {past.length > 0 && (
                                    <>
                                        <div className="text-xs font-mono tracking-widest uppercase text-textMuted mt-8 mb-3">Passate / Cancellate</div>
                                        {past.map(b => (
                                            <BookingCard key={b.id} booking={b} onCancel={cancelBooking} />
                                        ))}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Tab: Profile */}
                {activeTab === 'profile' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '40px', alignItems: 'start' }}>
                        <DigitalCard />
                        <div>
                            <div className="text-sm text-textMuted mb-6">Modifica le informazioni del tuo profilo Digitalands.</div>
                            <ProfileSection user={user} onUpdate={updateProfile} />
                            {(user.role === 'activity_manager' || user.role === 'property_manager') && (
                                <div style={{ marginTop: '24px', padding: '16px', borderRadius: '8px', border: '1px solid rgba(212,168,83,0.2)', background: 'var(--accent-dim)' }}>
                                    <div style={{ fontSize: '11px', fontFamily: 'monospace', letterSpacing: '0.08em', color: 'var(--accent)', marginBottom: '8px' }}>AREA MANAGER</div>
                                    <Link
                                        to={user.role === 'activity_manager' ? '/manager/activities' : '/manager/properties'}
                                        className="btn-gold"
                                        style={{ display: 'inline-block', padding: '10px 20px', fontSize: '0.85rem' }}>
                                        Vai alla tua dashboard →
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

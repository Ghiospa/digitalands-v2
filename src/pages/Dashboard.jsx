import { useState, memo, useMemo } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBookings } from '../context/BookingContext';
import { useI18n } from '../context/I18nContext';
import DigitalCard from '../components/DigitalCard';
import { CAT_COLORS } from '../data/categories';

const StatusBadge = memo(function StatusBadge({ status }) {
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
});

const BookingCard = memo(function BookingCard({ booking, onCancel }) {
    const checkIn = new Date(booking.checkIn || booking.check_in);
    const checkOut = new Date(booking.checkOut || booking.check_out);
    const isUpcoming = checkIn > new Date();

    return (
        <div className="rounded-lg p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border-light)' }}>
            <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                    <div className="font-medium text-textPrimary mb-0.5">{booking.propertyName || booking.property_name}</div>
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
                    <div className="text-sm" style={{ color: 'var(--accent)' }}>€{booking.totalPrice || booking.total_price}</div>
                </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                <Link to={`/property/${booking.propertyId || booking.property_id}`}
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
});

const ProfileSection = memo(function ProfileSection({ user, onUpdate }) {
    const { t } = useI18n();
    const [form, setForm] = useState({
        name: user.name,
        email: user.email,
        employment_type: user.employment_type || 'freelance',
        profession: user.profession || '',
        vat_number: user.vat_number || '',
        company_name: user.company_name || '',
        company_role: user.company_role || ''
    });
    const [saved, setSaved] = useState(false);

    function handleSave(e) {
        e.preventDefault();
        onUpdate(form);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    }

    return (
        <form onSubmit={handleSave} className="space-y-4 max-w-md">
            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono tracking-widest uppercase text-textMuted">Nome</label>
                <input className="waitlist-input" value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>

            {/* Employment Type Selector */}
            <div className="flex flex-col gap-2">
                <label className="text-xs font-mono tracking-widest uppercase text-textMuted">{t('auth_employment_type')}</label>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => setForm(f => ({ ...f, employment_type: 'freelance' }))}
                        className={`flex-1 py-2 text-[11px] font-mono rounded border transition-all ${form.employment_type === 'freelance' ? 'border-accent bg-accent-dim text-accent' : 'border-border-light text-textMuted'}`}
                    >
                        {t('auth_freelance')}
                    </button>
                    <button
                        type="button"
                        onClick={() => setForm(f => ({ ...f, employment_type: 'employee' }))}
                        className={`flex-1 py-2 text-[11px] font-mono rounded border transition-all ${form.employment_type === 'employee' ? 'border-accent bg-accent-dim text-accent' : 'border-border-light text-textMuted'}`}
                    >
                        {t('auth_employee')}
                    </button>
                </div>
            </div>

            {form.employment_type === 'freelance' ? (
                <>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-mono tracking-widest uppercase text-textMuted">{t('auth_profession')}</label>
                        <input className="waitlist-input" value={form.profession}
                            onChange={e => setForm(f => ({ ...f, profession: e.target.value }))} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-mono tracking-widest uppercase text-textMuted">{t('auth_vat')}</label>
                        <input className="waitlist-input" value={form.vat_number}
                            onChange={e => setForm(f => ({ ...f, vat_number: e.target.value }))} />
                    </div>
                </>
            ) : (
                <>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-mono tracking-widest uppercase text-textMuted">{t('auth_company_role')}</label>
                        <input className="waitlist-input" value={form.company_role}
                            onChange={e => setForm(f => ({ ...f, company_role: e.target.value }))} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-mono tracking-widest uppercase text-textMuted">{t('auth_company')}</label>
                        <input className="waitlist-input" value={form.company_name}
                            onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))} />
                    </div>
                </>
            )}

            <button type="submit" className="btn-gold" style={{ padding: '11px 24px', fontSize: '0.85rem' }}>
                {saved ? '✓ Salvato' : 'Salva modifiche'}
            </button>
        </form>
    );
});


const ActivityBookingsTab = memo(function ActivityBookingsTab({ bookings, onCancel }) {
    const navigate = useNavigate();
    const activityBookings = bookings.filter(b => b.activity_id);

    if (activityBookings.length === 0) {
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
            {activityBookings.map(b => {
                const catColor = CAT_COLORS[b.category]?.color || 'var(--accent)';
                const isPast = new Date(b.check_in || b.date) < new Date();
                return (
                    <div key={b.id} className="rounded-lg p-5"
                        style={{ background: 'var(--surface)', border: '1px solid var(--border-light)' }}>
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="flex items-center gap-3">
                                <span style={{ fontSize: '1.5rem' }}>{b.emoji || '✨'}</span>
                                <div>
                                    <div className="font-medium text-textPrimary mb-0.5">{b.activity_name || b.activityName}</div>
                                    <span style={{
                                        fontSize: '10px', fontFamily: 'monospace', letterSpacing: '0.08em',
                                        textTransform: 'uppercase', fontWeight: 600,
                                        color: catColor, background: `${catColor}18`,
                                        padding: '2px 8px', borderRadius: '4px',
                                        border: `1px solid ${catColor}33`,
                                    }}>{b.category || 'Esperienza'}</span>
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
                                    {new Date(b.check_in || b.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: '2-digit' })}
                                </div>
                            </div>
                            <div>
                                <div className="text-[10px] font-mono tracking-widest uppercase text-textMuted mb-1">Dettaglio</div>
                                <div className="text-sm text-textPrimary">{b.property_name || 'Slot prenotato'}</div>
                            </div>
                            <div>
                                <div className="text-[10px] font-mono tracking-widest uppercase text-textMuted mb-1">Totale</div>
                                <div className="text-sm" style={{ color: 'var(--accent)' }}>€{b.total_price || b.price}</div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                            <Link to="/activities" className="text-xs text-textMuted hover:text-accent transition-colors font-mono">
                                Vedi tutte le attività →
                            </Link>
                            {b.status === 'confermata' && !isPast && (
                                <button onClick={() => onCancel(b.id)}
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
});

export default function Dashboard() {
    const { user, logout, updateProfile, loading } = useAuth();
    const { getUserBookings, cancelBooking } = useBookings();
    const [activeTab, setActiveTab] = useState('bookings');

    const bookings = getUserBookings();

    const { propertyBookings, activityBookings, upcoming, past } = useMemo(() => {
        const pb = bookings.filter(b => b.property_id);
        const ab = bookings.filter(b => b.activity_id);
        return {
            propertyBookings: pb,
            activityBookings: ab,
            upcoming: pb.filter(b => b.status !== 'cancellata' && new Date(b.check_in) > new Date()),
            past: pb.filter(b => b.status === 'cancellata' || new Date(b.check_out) <= new Date())
        };
    }, [bookings]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-bg">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-accent"></div>
        </div>
    );

    if (!user) return <Navigate to="/auth?redirect=/dashboard" replace />;

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
                {/* Premium Banner */}
                {user.is_premium && (
                    <div className="mb-8 p-6 rounded-xl animate-fade-in" style={{ background: 'linear-gradient(90deg, #5865F2 0%, #4752C4 100%)', boxShadow: '0 8px 30px rgba(88, 101, 242, 0.25)' }}>
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-3xl border border-white/20">
                                    👾
                                </div>
                                <div>
                                    <div className="text-white font-serif text-xl mb-1">Benvenuto nella Community Premium</div>
                                    <p className="text-white/80 text-sm">Hai accesso esclusivo al server Discord di Digitalands.</p>
                                </div>
                            </div>
                            <a
                                href="https://discord.gg/hR7bynNd"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-white text-[#5865F2] px-8 py-3 rounded-lg font-bold text-sm tracking-wide hover:scale-105 transition-transform"
                            >
                                ENTRA NEL DISCORD
                            </a>
                        </div>
                    </div>
                )}

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
                    <ActivityBookingsTab bookings={bookings} onCancel={cancelBooking} />
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

                            {user.stats_metadata && Object.keys(user.stats_metadata).length > 0 && (
                                <div style={{ marginTop: '32px', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-light)', background: 'var(--bg)' }}>
                                    <div className="text-[10px] font-mono tracking-widest uppercase text-textMuted mb-4">Dettagli Analisi</div>
                                    <div className="grid grid-cols-2 gap-4">
                                        {Object.entries(user.stats_metadata).map(([key, value]) => (
                                            key !== 'completed_at' && (
                                                <div key={key}>
                                                    <div className="text-[9px] font-mono text-textMuted uppercase mb-1">{key.replace('_', ' ')}</div>
                                                    <div className="text-xs text-textPrimary">{Array.isArray(value) ? value.join(', ') : value}</div>
                                                </div>
                                            )
                                        ))}
                                    </div>
                                </div>
                            )}

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

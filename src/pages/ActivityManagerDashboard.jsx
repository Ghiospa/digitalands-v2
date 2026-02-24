import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';

const RAGUSA_COMUNI = [
    'Ragusa', 'Modica', 'Scicli', 'Vittoria', 'Comiso',
    'Ispica', 'Pozzallo', 'Santa Croce Camerina',
    'Chiaramonte Gulfi', 'Monterosso Almo', 'Giarratana',
    'Marina di Ragusa',
];

const CATEGORIES = ['Surf', 'Kite Surf', 'Yoga', 'Escursioni', 'Snorkeling', 'Food & Wine', 'Altro'];

const CAT_IMAGES = {
    'Surf': 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=600&q=80',
    'Kite Surf': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&q=80',
    'Yoga': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
    'Escursioni': 'https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=600&q=80',
    'Snorkeling': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80',
    'Food & Wine': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80',
    'Altro': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80',
};

const DEFAULT_SLOTS = ['09:00', '11:00', '14:00', '16:00'];

function getMyActivities(userId) {
    try {
        const all = JSON.parse(localStorage.getItem('digitalands_custom_activities') || '[]');
        return all.filter(a => a.ownerId === userId);
    } catch { return []; }
}

function getAllActivityBookings(activityIds) {
    try {
        const all = JSON.parse(localStorage.getItem('digitalands_activity_bookings') || '[]');
        return all.filter(b => activityIds.includes(b.activityId));
    } catch { return []; }
}

function saveActivity(activity) {
    const all = JSON.parse(localStorage.getItem('digitalands_custom_activities') || '[]');
    const idx = all.findIndex(a => a.id === activity.id);
    if (idx !== -1) { all[idx] = activity; } else { all.unshift(activity); }
    localStorage.setItem('digitalands_custom_activities', JSON.stringify(all));
}

function deleteActivity(id) {
    const all = JSON.parse(localStorage.getItem('digitalands_custom_activities') || '[]');
    localStorage.setItem('digitalands_custom_activities', JSON.stringify(all.filter(a => a.id !== id)));
}

/* ─── New/Edit Activity Form ─── */
function ActivityForm({ user, onSaved, editItem }) {
    const { t } = useI18n();
    const empty = {
        name: '', category: 'Surf', description: '', price: '',
        duration: '', location: 'Ragusa', slots: [...DEFAULT_SLOTS],
        image: '', published: true,
    };
    const [form, setForm] = useState(editItem ? {
        ...editItem, price: String(editItem.price),
        slots: editItem.slots || [...DEFAULT_SLOTS],
    } : empty);
    const [newSlot, setNewSlot] = useState('');
    const [saved, setSaved] = useState(false);

    function addSlot() {
        if (newSlot && !form.slots.includes(newSlot)) {
            setForm(f => ({ ...f, slots: [...f.slots, newSlot].sort() }));
        }
        setNewSlot('');
    }

    function removeSlot(s) {
        setForm(f => ({ ...f, slots: f.slots.filter(sl => sl !== s) }));
    }

    function handleSubmit(e) {
        e.preventDefault();
        const activity = {
            ...form,
            id: editItem?.id || `custom-${Date.now()}`,
            ownerId: user.id,
            ownerName: user.name,
            price: Number(form.price),
            image: form.image || CAT_IMAGES[form.category] || CAT_IMAGES['Altro'],
            emoji: { 'Surf': '🏄', 'Kite Surf': '🪁', 'Yoga': '🧘', 'Escursioni': '🥾', 'Snorkeling': '🤿', 'Food & Wine': '🍷', 'Altro': '✨' }[form.category] || '✨',
            coordinates: null,
        };
        saveActivity(activity);
        setSaved(true);
        setTimeout(() => { onSaved(); setSaved(false); }, 800);
    }

    const inputStyle = { width: '100%', padding: '10px 14px', background: 'var(--surface-2)', border: '1px solid var(--border-light)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none' };
    const labelStyle = { fontSize: '10px', fontFamily: 'monospace', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                    <label style={labelStyle}>Nome attività</label>
                    <input style={inputStyle} required value={form.name} placeholder="Es. Surf al tramonto"
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                    <label style={labelStyle}>Categoria</label>
                    <select style={inputStyle} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                </div>
                <div>
                    <label style={labelStyle}>Prezzo (€)</label>
                    <input style={inputStyle} type="number" required min="1" value={form.price} placeholder="65"
                        onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
                </div>
                <div>
                    <label style={labelStyle}>Durata</label>
                    <input style={inputStyle} required value={form.duration} placeholder="Es. 2h"
                        onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} />
                </div>
                <div>
                    <label style={labelStyle}>Comune</label>
                    <select style={inputStyle} value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}>
                        {RAGUSA_COMUNI.map(c => <option key={c}>{c}</option>)}
                    </select>
                </div>
                <div>
                    <label style={labelStyle}>URL Immagine (opzionale)</label>
                    <input style={inputStyle} type="url" value={form.image} placeholder="https://..."
                        onChange={e => setForm(f => ({ ...f, image: e.target.value }))} />
                </div>
            </div>

            <div>
                <label style={labelStyle}>Descrizione</label>
                <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} value={form.description}
                    placeholder="Descrivi l'attività..." onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>

            {/* Slots */}
            <div>
                <label style={labelStyle}>Slot orari disponibili</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                    {form.slots.map(s => (
                        <span key={s} style={{
                            background: 'var(--accent-dim)', border: '1px solid rgba(212,168,83,0.3)',
                            color: 'var(--accent)', borderRadius: '6px', padding: '4px 12px',
                            fontSize: '13px', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '6px'
                        }}>
                            ⏱ {s}
                            <button type="button" onClick={() => removeSlot(s)}
                                style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '12px', padding: 0 }}>×</button>
                        </span>
                    ))}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <input type="time" value={newSlot} onChange={e => setNewSlot(e.target.value)}
                        style={{ ...inputStyle, width: 'auto', colorScheme: 'dark' }} />
                    <button type="button" className="btn-ghost" style={{ padding: '8px 16px', fontSize: '0.82rem' }} onClick={addSlot}>
                        + Aggiungi
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button type="submit" className="btn-gold" style={{ padding: '12px 28px' }}>
                    {saved ? '✓ Salvato!' : editItem ? 'Aggiorna' : t('mgr_publish')}
                </button>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <input type="checkbox" checked={form.published} onChange={e => setForm(f => ({ ...f, published: e.target.checked }))} />
                    Pubblica subito
                </label>
            </div>
        </form>
    );
}

/* ─── Activity Card in Manager list ─── */
function ManagerActivityCard({ activity, onDelete, onEdit }) {
    const { t } = useI18n();
    return (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border-light)', borderRadius: '10px', padding: '18px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <img src={activity.image} alt={activity.name} style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>{activity.name}</div>
                <div style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                    {activity.location} · €{activity.price} · {activity.duration}
                </div>
                <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                    {(activity.slots || []).map(s => (
                        <span key={s} style={{ fontSize: '10px', fontFamily: 'monospace', background: 'var(--accent-dim)', color: 'var(--accent)', padding: '2px 8px', borderRadius: '4px' }}>
                            {s}
                        </span>
                    ))}
                </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <button className="btn-ghost" style={{ padding: '6px 14px', fontSize: '0.78rem' }} onClick={() => onEdit(activity)}>Modifica</button>
                <button onClick={() => onDelete(activity.id)}
                    style={{ padding: '6px 14px', fontSize: '0.78rem', background: 'none', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171', borderRadius: '6px', cursor: 'pointer' }}>
                    {t('mgr_delete')}
                </button>
            </div>
        </div>
    );
}

/* ─── Main ─── */
function toggleAttendance(bookingId) {
    const attendance = JSON.parse(localStorage.getItem('digitalands_activity_attendance') || '{}');
    attendance[bookingId] = !attendance[bookingId];
    localStorage.setItem('digitalands_activity_attendance', JSON.stringify(attendance));
}

function getAttendance() {
    return JSON.parse(localStorage.getItem('digitalands_activity_attendance') || '{}');
}

/* ─── Monitor Tab Component ─── */
function MonitorTab({ activities, bookings }) {
    const [attendance, setAttendance] = useState(getAttendance());
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    const activeBookings = bookings.filter(b => b.status !== 'cancellata' && b.date === selectedDate);

    // Group by activity then by slot
    const grouped = activities.reduce((acc, act) => {
        const actBookings = activeBookings.filter(b => b.activityId === act.id);
        if (actBookings.length === 0) return acc;

        const slots = act.slots.reduce((sAcc, slot) => {
            const slotBookings = actBookings.filter(b => b.timeSlot === slot);
            if (slotBookings.length > 0) {
                sAcc[slot] = slotBookings;
            }
            return sAcc;
        }, {});

        if (Object.keys(slots).length > 0) {
            acc.push({ ...act, groupedSlots: slots });
        }
        return acc;
    }, []);

    const handleToggle = (id) => {
        toggleAttendance(id);
        setAttendance(getAttendance());
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <label style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>GIORNO:</label>
                <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
                    style={{ background: 'var(--surface-2)', border: '1px solid var(--border-light)', color: 'var(--text-primary)', padding: '6px 12px', borderRadius: '6px', outline: 'none', colorScheme: 'dark' }} />
            </div>

            {grouped.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', border: '1px dashed var(--border)', borderRadius: '10px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Nessun corso programmato per questa data.
                </div>
            ) : (
                grouped.map(act => (
                    <div key={act.id} style={{ background: 'var(--surface)', border: '1px solid var(--border-light)', borderRadius: '12px', overflow: 'hidden' }}>
                        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.02)' }}>
                            <span style={{ fontSize: '1.2rem' }}>{act.emoji}</span>
                            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{act.name}</div>
                        </div>
                        <div style={{ padding: '0 20px' }}>
                            {Object.entries(act.groupedSlots).map(([slot, bks]) => (
                                <div key={slot} style={{ py: '16px', borderBottom: '1px solid var(--border)', padding: '16px 0' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                        <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--accent)', background: 'var(--accent-dim)', padding: '2px 8px', borderRadius: '4px' }}>⏱ {slot}</span>
                                        <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>{bks.length} PARTECIPANTI</span>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                                        {bks.map(b => (
                                            <div key={b.id} onClick={() => handleToggle(b.id)}
                                                style={{
                                                    padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)',
                                                    background: attendance[b.id] ? 'rgba(74,222,128,0.05)' : 'transparent',
                                                    borderColor: attendance[b.id] ? 'rgba(74,222,128,0.3)' : 'var(--border)',
                                                    cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '10px'
                                                }}>
                                                <div style={{
                                                    width: '18px', height: '18px', borderRadius: '4px', border: '1px solid',
                                                    borderColor: attendance[b.id] ? 'var(--accent)' : 'var(--text-muted)',
                                                    background: attendance[b.id] ? 'var(--accent)' : 'transparent',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#000'
                                                }}>
                                                    {attendance[b.id] && '✓'}
                                                </div>
                                                <div style={{ fontSize: '13px', color: attendance[b.id] ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: attendance[b.id] ? 500 : 400 }}>
                                                    {b.userName || 'Utente Ospite'}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}

/* ─── Main ─── */
export default function ActivityManagerDashboard() {
    const { user, logout } = useAuth();
    const { t } = useI18n();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('list');
    const [editItem, setEditItem] = useState(null);
    const [activities, setActivities] = useState(() => user ? getMyActivities(user.id) : []);

    if (!user) return <Navigate to="/auth?redirect=/manager/activities" replace />;
    if (user.role !== 'activity_manager') return <Navigate to="/dashboard" replace />;

    const bookings = getAllActivityBookings(activities.map(a => a.id));

    function refreshList() {
        setActivities(getMyActivities(user.id));
        setActiveTab('list');
        setEditItem(null);
    }

    function handleDelete(id) {
        deleteActivity(id);
        setActivities(getMyActivities(user.id));
    }

    function handleEdit(activity) {
        setEditItem(activity);
        setActiveTab('new');
    }

    const tabs = [
        { id: 'list', label: t('mgr_my_activities') },
        { id: 'bookings', label: t('mgr_bookings_received') },
        { id: 'monitor', label: '📊 Monitor Classi' },
        { id: 'new', label: editItem ? '✏️ Modifica' : `+ ${t('mgr_new_activity')}` },
    ];

    const tabStyle = (id) => ({
        padding: '8px 18px', fontSize: '0.82rem', fontFamily: 'monospace',
        letterSpacing: '0.04em', cursor: 'pointer', background: 'none', border: 'none',
        borderBottom: activeTab === id ? '2px solid var(--accent)' : '2px solid transparent',
        color: activeTab === id ? 'var(--text-primary)' : 'var(--text-muted)',
        transition: 'color 0.2s, border-color 0.2s',
        whiteSpace: 'nowrap',
    });

    return (
        <div style={{ minHeight: '100vh', paddingTop: '80px', paddingBottom: '80px' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px' }}>

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                        <div style={{ fontSize: '11px', fontFamily: 'monospace', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>
                            🏄 Gestore Attività
                        </div>
                        <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {user.name}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button className="btn-ghost" style={{ padding: '8px 16px', fontSize: '0.8rem' }} onClick={() => navigate('/activities')}>
                            Vedi pagina pubblica →
                        </button>
                        <button className="btn-ghost" style={{ padding: '8px 16px', fontSize: '0.8rem' }} onClick={() => { logout(); navigate('/'); }}>
                            {t('nav_logout')}
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
                    {[
                        { label: 'Attività pubblicate', value: activities.filter(a => a.published).length },
                        { label: 'Prenotazioni totali', value: bookings.length },
                        { label: 'Prenotazioni confermate', value: bookings.filter(b => b.status === 'confermata').length },
                    ].map(s => (
                        <div key={s.label} style={{ background: 'var(--surface)', border: '1px solid var(--border-light)', borderRadius: '10px', padding: '18px' }}>
                            <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent)' }}>{s.value}</div>
                            <div style={{ fontSize: '10px', fontFamily: 'monospace', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: '4px' }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '28px', overflowX: 'auto' }}>
                    {tabs.map(tab => (
                        <button key={tab.id} style={tabStyle(tab.id)} onClick={() => { setActiveTab(tab.id); if (tab.id !== 'new') setEditItem(null); }}>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab: My activities */}
                {activeTab === 'list' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {activities.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                                <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🏄</div>
                                <p style={{ fontSize: '0.9rem', fontFamily: 'monospace', marginBottom: '20px' }}>Non hai ancora pubblicato attività.</p>
                                <button className="btn-gold" style={{ padding: '10px 24px' }} onClick={() => setActiveTab('new')}>
                                    + {t('mgr_new_activity')}
                                </button>
                            </div>
                        ) : (
                            activities.map(a => (
                                <ManagerActivityCard key={a.id} activity={a} onDelete={handleDelete} onEdit={handleEdit} />
                            ))
                        )}
                    </div>
                )}

                {/* Tab: Bookings received */}
                {activeTab === 'bookings' && (
                    <div>
                        {bookings.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', fontSize: '0.9rem', fontFamily: 'monospace' }}>
                                {t('mgr_no_bookings')}
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {bookings.map(b => (
                                    <div key={b.id} style={{ background: 'var(--surface)', border: '1px solid var(--border-light)', borderRadius: '10px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                                        <div>
                                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                                                {b.emoji} {b.activityName}
                                            </div>
                                            <div style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                                                📅 {new Date(b.date + 'T12:00:00').toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: '2-digit' })}
                                                {b.timeSlot && ` · ⏱ ${b.timeSlot}`}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent)' }}>€{b.price}</span>
                                            <span style={{
                                                fontSize: '10px', fontFamily: 'monospace', letterSpacing: '0.08em', textTransform: 'uppercase',
                                                padding: '3px 10px', borderRadius: '4px',
                                                color: b.status === 'cancellata' ? '#f87171' : '#4ade80',
                                                background: b.status === 'cancellata' ? 'rgba(248,113,113,0.08)' : 'rgba(74,222,128,0.08)',
                                                border: `1px solid ${b.status === 'cancellata' ? 'rgba(248,113,113,0.2)' : 'rgba(74,222,128,0.2)'}`,
                                            }}>
                                                {b.status === 'cancellata' ? 'Cancellata' : 'Confermata'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Tab: Monitor Classi */}
                {activeTab === 'monitor' && (
                    <MonitorTab activities={activities} bookings={bookings} />
                )}

                {/* Tab: New/Edit activity */}
                {activeTab === 'new' && (
                    <div>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '24px' }}>
                            {editItem ? 'Modifica attività' : 'Pubblica nuova attività'}
                        </h2>
                        <ActivityForm user={user} onSaved={refreshList} editItem={editItem} />
                    </div>
                )}
            </div>
        </div>
    );
}

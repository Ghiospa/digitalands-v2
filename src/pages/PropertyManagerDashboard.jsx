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

const AMENITIES_LIST = [
    'WiFi veloce', 'Piscina', 'Aria condizionata', 'Cucina equipaggiata',
    'Parcheggio', 'Vista mare', 'Giardino', 'Terrazza', 'Pet-friendly',
    'Lavatrice', 'Smart TV', 'Barbecue',
];

// Unsplash images for properties in Ragusa area
const PROP_IMAGES = [
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80',
];

function getMyProperties(userId) {
    try {
        const all = JSON.parse(localStorage.getItem('digitalands_custom_properties') || '[]');
        return all.filter(p => p.ownerId === userId);
    } catch { return []; }
}

function getAllPropertyBookings(propertyIds) {
    try {
        const all = JSON.parse(localStorage.getItem('digitalands_bookings') || '[]');
        return all.filter(b => propertyIds.includes(b.propertyId));
    } catch { return []; }
}

function saveProperty(prop) {
    const all = JSON.parse(localStorage.getItem('digitalands_custom_properties') || '[]');
    const idx = all.findIndex(p => p.id === prop.id);
    if (idx !== -1) { all[idx] = prop; } else { all.unshift(prop); }
    localStorage.setItem('digitalands_custom_properties', JSON.stringify(all));
}

function deleteProperty(id) {
    const all = JSON.parse(localStorage.getItem('digitalands_custom_properties') || '[]');
    localStorage.setItem('digitalands_custom_properties', JSON.stringify(all.filter(p => p.id !== id)));
}

/* ─── Form ─── */
function PropertyForm({ user, onSaved, editItem }) {
    const { t } = useI18n();
    const empty = {
        name: '', location: 'Ragusa', description: '',
        pricePerNight: '', image: '', amenities: [],
        rooms: '', maxGuests: '', published: true,
    };
    const [form, setForm] = useState(editItem ? {
        ...editItem, pricePerNight: String(editItem.pricePerNight)
    } : empty);
    const [saved, setSaved] = useState(false);

    function toggleAmenity(a) {
        setForm(f => ({
            ...f,
            amenities: f.amenities.includes(a)
                ? f.amenities.filter(x => x !== a)
                : [...f.amenities, a],
        }));
    }

    function handleSubmit(e) {
        e.preventDefault();
        const prop = {
            ...form,
            id: editItem?.id || `prop-${Date.now()}`,
            ownerId: user.id,
            ownerName: user.name,
            pricePerNight: Number(form.pricePerNight),
            image: form.image || PROP_IMAGES[Math.floor(Math.random() * PROP_IMAGES.length)],
            type: 'custom',
        };
        saveProperty(prop);
        setSaved(true);
        setTimeout(() => { onSaved(); setSaved(false); }, 1500);
    }

    const inputStyle = {
        width: '100%', padding: '12px 16px',
        background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
        borderRadius: '8px', color: 'var(--text-primary)',
        fontSize: '0.92rem', fontFamily: 'inherit', outline: 'none',
        transition: 'border-color 0.2s, background 0.2s',
    };
    const labelStyle = {
        fontSize: '10px', fontFamily: 'monospace', letterSpacing: '0.12em',
        textTransform: 'uppercase', color: 'var(--text-muted)',
        display: 'block', marginBottom: '8px', fontWeight: 600
    };

    return (
        <div style={{ position: 'relative' }}>
            {saved && (
                <div style={{
                    position: 'absolute', inset: -20, background: 'rgba(10,10,10,0.8)',
                    backdropFilter: 'blur(8px)', zIndex: 10, borderRadius: '12px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    animation: 'reveal 0.4s ease forwards'
                }}>
                    <div style={{
                        width: '60px', height: '60px', borderRadius: '50%', background: 'var(--accent)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', color: '#000',
                        marginBottom: '16px', boxShadow: '0 0 30px rgba(212,168,83,0.4)'
                    }}>✓</div>
                    <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: '1.2rem', fontWeight: 600 }}>Annuncio Pubblicato!</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '4px' }}>La tua casa è ora visibile su Digitalands.</div>
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '700px', opacity: saved ? 0.3 : 1, transition: 'opacity 0.3s' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={labelStyle}>Nome della struttura</label>
                        <input style={inputStyle} required value={form.name} placeholder="Es. Palazzo Barocco Sicilian Luxury"
                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                    </div>

                    <div style={{ gridColumn: 'span 1' }}>
                        <label style={labelStyle}>Comune</label>
                        <select style={inputStyle} value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}>
                            {RAGUSA_COMUNI.map(c => <option key={c}>{c}</option>)}
                        </select>
                    </div>
                    <div style={{ gridColumn: 'span 1' }}>
                        <label style={labelStyle}>Prezzo/notte (€)</label>
                        <input style={inputStyle} type="number" required min="1" value={form.pricePerNight} placeholder="120"
                            onChange={e => setForm(f => ({ ...f, pricePerNight: e.target.value }))} />
                    </div>
                    <div style={{ gridColumn: 'span 1' }}>
                        <label style={labelStyle}>Ospiti max</label>
                        <input style={inputStyle} type="number" min="1" value={form.maxGuests} placeholder="4"
                            onChange={e => setForm(f => ({ ...f, maxGuests: e.target.value }))} />
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={labelStyle}>URL Immagine</label>
                        <input style={inputStyle} type="url" value={form.image} placeholder="https://images.unsplash.com/..."
                            onChange={e => setForm(f => ({ ...f, image: e.target.value }))} />
                    </div>
                </div>

                <div>
                    <label style={labelStyle}>Descrizione dell'esperienza</label>
                    <textarea style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }}
                        value={form.description} placeholder="Racconta la storia della tua casa, l'architettura e l'atmosfera che gli ospiti troveranno..."
                        onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>

                {/* Amenities */}
                <div>
                    <label style={labelStyle}>Servizi & Comfort</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {AMENITIES_LIST.map(a => (
                            <button key={a} type="button" onClick={() => toggleAmenity(a)}
                                style={{
                                    padding: '8px 16px', borderRadius: '8px', fontSize: '11px',
                                    fontFamily: 'monospace', cursor: 'pointer',
                                    border: '1px solid',
                                    borderColor: form.amenities.includes(a) ? 'var(--accent)' : 'var(--border)',
                                    background: form.amenities.includes(a) ? 'var(--accent-dim)' : 'transparent',
                                    color: form.amenities.includes(a) ? 'var(--accent)' : 'var(--text-muted)',
                                    transition: 'all 0.2s',
                                }}>
                                {a}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginTop: '10px', padding: '20px', background: 'var(--surface-2)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <button type="submit" className="btn-gold" style={{ padding: '14px 40px', fontSize: '0.95rem' }}>
                        {editItem ? 'Salva Modifiche' : 'Pubblica Annuncio'}
                    </button>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                        <input type="checkbox" checked={form.published} onChange={e => setForm(f => ({ ...f, published: e.target.checked }))}
                            style={{ accentColor: 'var(--accent)', width: '16px', height: '16px' }} />
                        Attiva immediatamente l'annuncio
                    </label>
                </div>
            </form>
        </div>
    );
}

function ManagerPropCard({ property, onDelete, onEdit }) {
    const { t } = useI18n();
    return (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border-light)', borderRadius: '10px', padding: '18px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <img src={property.image} alt={property.name} style={{ width: '70px', height: '60px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>{property.name}</div>
                <div style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                    📍 {property.location} · €{property.pricePerNight}/notte
                    {property.rooms && ` · ${property.rooms} camere`}
                </div>
                {property.amenities?.length > 0 && (
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {property.amenities.slice(0, 4).join(' · ')}{property.amenities.length > 4 ? ' …' : ''}
                    </div>
                )}
            </div>
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <button className="btn-ghost" style={{ padding: '6px 14px', fontSize: '0.78rem' }} onClick={() => onEdit(property)}>Modifica</button>
                <button onClick={() => onDelete(property.id)}
                    style={{ padding: '6px 14px', fontSize: '0.78rem', background: 'none', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171', borderRadius: '6px', cursor: 'pointer' }}>
                    {t('mgr_delete')}
                </button>
            </div>
        </div>
    );
}

export default function PropertyManagerDashboard() {
    const { user, logout } = useAuth();
    const { t } = useI18n();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('list');
    const [editItem, setEditItem] = useState(null);
    const [properties, setProperties] = useState(() => user ? getMyProperties(user.id) : []);

    if (!user) return <Navigate to="/auth?redirect=/manager/properties" replace />;
    if (user.role !== 'property_manager') return <Navigate to="/dashboard" replace />;

    const bookings = getAllPropertyBookings(properties.map(p => p.id));

    function refreshList() {
        setProperties(getMyProperties(user.id));
        setActiveTab('list');
        setEditItem(null);
    }

    function handleDelete(id) {
        deleteProperty(id);
        setProperties(getMyProperties(user.id));
    }

    function handleEdit(prop) {
        setEditItem(prop);
        setActiveTab('new');
    }

    const tabs = [
        { id: 'list', label: t('mgr_my_properties') },
        { id: 'bookings', label: t('mgr_bookings_received') },
        { id: 'new', label: editItem ? '✏️ Modifica' : `+ ${t('mgr_new_property')}` },
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
                            🏡 Gestore Casa
                        </div>
                        <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {user.name}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button className="btn-ghost" style={{ padding: '8px 16px', fontSize: '0.8rem' }} onClick={() => navigate('/#properties')}>
                            Vedi strutture →
                        </button>
                        <button className="btn-ghost" style={{ padding: '8px 16px', fontSize: '0.8rem' }} onClick={() => { logout(); navigate('/'); }}>
                            {t('nav_logout')}
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
                    {[
                        { label: 'Case pubblicate', value: properties.filter(p => p.published).length },
                        { label: 'Prenotazioni totali', value: bookings.length },
                        { label: 'Confermate', value: bookings.filter(b => b.status === 'confermata').length },
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

                {/* Tab: My properties */}
                {activeTab === 'list' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {properties.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                                <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🏡</div>
                                <p style={{ fontSize: '0.9rem', fontFamily: 'monospace', marginBottom: '20px' }}>Non hai ancora inserito case.</p>
                                <button className="btn-gold" style={{ padding: '10px 24px' }} onClick={() => setActiveTab('new')}>
                                    + {t('mgr_new_property')}
                                </button>
                            </div>
                        ) : (
                            properties.map(p => (
                                <ManagerPropCard key={p.id} property={p} onDelete={handleDelete} onEdit={handleEdit} />
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
                                                🏡 {b.propertyName}
                                            </div>
                                            <div style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                                                📅 {new Date(b.checkIn).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}
                                                {' → '}
                                                {new Date(b.checkOut).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: '2-digit' })}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent)' }}>€{b.totalPrice}</span>
                                            <span style={{
                                                fontSize: '10px', fontFamily: 'monospace', letterSpacing: '0.08em', textTransform: 'uppercase',
                                                padding: '3px 10px', borderRadius: '4px',
                                                color: b.status === 'cancellata' ? '#f87171' : b.status === 'confermata' ? '#4ade80' : 'var(--accent)',
                                                background: b.status === 'cancellata' ? 'rgba(248,113,113,0.08)' : b.status === 'confermata' ? 'rgba(74,222,128,0.08)' : 'var(--accent-dim)',
                                                border: `1px solid ${b.status === 'cancellata' ? 'rgba(248,113,113,0.2)' : b.status === 'confermata' ? 'rgba(74,222,128,0.2)' : 'rgba(212,168,83,0.2)'}`,
                                            }}>
                                                {b.status === 'cancellata' ? 'Cancellata' : b.status === 'confermata' ? 'Confermata' : 'In attesa'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Tab: New/Edit property */}
                {activeTab === 'new' && (
                    <div>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '24px' }}>
                            {editItem ? 'Modifica casa' : 'Inserisci nuova casa'}
                        </h2>
                        <PropertyForm user={user} onSaved={refreshList} editItem={editItem} />
                    </div>
                )}
            </div>
        </div>
    );
}

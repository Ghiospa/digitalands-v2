import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBookings } from '../context/BookingContext';

import { SEED_PROPERTIES } from '../data/seedProperties';

function getPropertyById(id) {
    // Check seed properties
    const seed = SEED_PROPERTIES.find(p => p.id === id);
    if (seed) return seed;

    // Check custom properties in local storage
    try {
        const custom = JSON.parse(localStorage.getItem('digitalands_custom_properties') || '[]');
        return custom.find(p => p.id === id);
    } catch (e) {
        console.error('Error loading custom properties:', e);
        return null;
    }
}

// ── Mini Calendar ──────────────────────────────────────────────────
const MONTHS = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
const DAYS_LABEL = ['Lu', 'Ma', 'Me', 'Gi', 'Ve', 'Sa', 'Do'];

function MiniCalendar({ selected, onSelect }) {
    const today = new Date();
    const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
    const adjustedFirst = (firstDay === 0 ? 6 : firstDay - 1); // Mon-start
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    function prevMonth() {
        setViewDate(new Date(year, month - 1, 1));
    }
    function nextMonth() {
        setViewDate(new Date(year, month + 1, 1));
    }
    function isSelected(d) {
        if (!selected) return false;
        return selected.getDate() === d && selected.getMonth() === month && selected.getFullYear() === year;
    }
    function isPast(d) {
        const date = new Date(year, month, d);
        return date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <button onClick={prevMonth} className="text-textMuted hover:text-textPrimary text-sm px-1 transition-colors">‹</button>
                <span className="text-sm font-medium text-textPrimary font-mono">{MONTHS[month]} {year}</span>
                <button onClick={nextMonth} className="text-textMuted hover:text-textPrimary text-sm px-1 transition-colors">›</button>
            </div>
            {/* Day labels */}
            <div className="grid grid-cols-7 gap-0.5 mb-1">
                {DAYS_LABEL.map(d => (
                    <div key={d} className="text-center font-mono text-[10px] text-textMuted py-1">{d}</div>
                ))}
            </div>
            {/* Days */}
            <div className="grid grid-cols-7 gap-0.5">
                {Array.from({ length: adjustedFirst }).map((_, i) => (
                    <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const d = i + 1;
                    const past = isPast(d);
                    const sel = isSelected(d);
                    return (
                        <button
                            key={d}
                            disabled={past}
                            onClick={() => !past && onSelect(new Date(year, month, d))}
                            className="text-center text-xs py-1.5 rounded transition-colors duration-150"
                            style={{
                                color: past ? 'var(--text-subtle)' : sel ? '#0A0A0A' : 'var(--text-muted)',
                                background: sel ? 'var(--accent)' : 'transparent',
                                cursor: past ? 'not-allowed' : 'pointer',
                                fontFamily: 'monospace',
                            }}
                            onMouseEnter={e => { if (!past && !sel) e.target.style.background = 'rgba(212,168,83,0.1)'; }}
                            onMouseLeave={e => { if (!sel) e.target.style.background = 'transparent'; }}
                        >
                            {d}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

function BookingSidebar({ property }) {
    const { user } = useAuth();
    const { addBooking } = useBookings();
    const navigate = useNavigate();

    const [checkIn, setCheckIn] = useState(null);
    const [guests, setGuests] = useState(1);
    const [months, setMonths] = useState(1);
    const [step, setStep] = useState('select'); // select | confirm | done
    const [toast, setToast] = useState('');

    const pricePerNight = property.pricePerNight || (property.price ? parseInt(String(property.price).replace(/[^\d]/g, '')) : 80);
    const cleaningFee = property.cleaningFee || 50;
    const deposit = property.deposit || 100;
    const total = pricePerNight * (30 * months) + cleaningFee;

    function handleBook() {
        if (!user) {
            navigate(`/auth?redirect=/property/${property.id}`);
            return;
        }
        if (!checkIn) {
            setToast('Seleziona la data di check-in.');
            setTimeout(() => setToast(''), 3000);
            return;
        }
        setStep('confirm');
    }

    function handleConfirm() {
        const checkOut = new Date(checkIn);
        checkOut.setMonth(checkOut.getMonth() + months);
        addBooking({
            propertyId: property.id,
            propertyName: property.name,
            location: property.location,
            checkIn: checkIn.toISOString(),
            checkOut: checkOut.toISOString(),
            guests,
            months,
            pricePerMonth: property.pricePerMonth,
            cleaningFee: property.cleaningFee,
            totalPrice: total,
            deposit: property.deposit,
        });
        setStep('done');
    }

    if (step === 'done') {
        return (
            <div className="rounded-lg p-6 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--border-light)' }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ background: 'rgba(212,168,83,0.12)', border: '1px solid rgba(212,168,83,0.3)' }}>
                    <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
                        <path d="M5 13l4 4L19 7" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                <div className="font-serif text-xl text-textPrimary mb-2">Prenotazione confermata!</div>
                <p className="text-sm text-textMuted mb-5">Il tuo soggiorno è stato salvato. Trovi tutti i dettagli nella tua dashboard.</p>
                <Link to="/dashboard" className="btn-gold block text-center" style={{ padding: '12px' }}>
                    Vai alla dashboard →
                </Link>
            </div>
        );
    }

    if (step === 'confirm') {
        const checkOut = new Date(checkIn);
        checkOut.setMonth(checkOut.getMonth() + months);
        return (
            <div className="rounded-lg overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border-light)' }}>
                <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
                    <div className="font-mono text-[11px] tracking-widest uppercase text-accent mb-1">Riepilogo prenotazione</div>
                    <div className="font-medium text-textPrimary">{property.name}</div>
                </div>
                <div className="p-5 space-y-3">
                    <Row label="Check-in" value={checkIn.toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })} />
                    <Row label="Check-out" value={checkOut.toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })} />
                    <Row label="Ospiti" value={guests} />
                    <Row label="Durata" value={`${months} ${months > 1 ? 'mesi' : 'mese'}`} />
                    <div className="border-t pt-3" style={{ borderColor: 'var(--border)' }}>
                        <Row label={`€${pricePerNight} × ${months * 30} notti`} value={`€${pricePerNight * 30 * months}`} />
                        <Row label="Pulizie" value={`€${cleaningFee}`} />
                        <div className="flex justify-between pt-2 mt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                            <span className="text-sm font-medium text-textPrimary">Totale</span>
                            <span className="text-sm font-medium" style={{ color: 'var(--accent)' }}>€{total}</span>
                        </div>
                        <div className="flex justify-between mt-1">
                            <span className="text-xs text-textMuted">Deposito ora</span>
                            <span className="text-xs text-textMuted">€{deposit}</span>
                        </div>
                    </div>
                </div>
                <div className="px-5 pb-5 flex gap-2">
                    <button onClick={() => setStep('select')} className="btn-ghost flex-1" style={{ fontSize: '0.85rem', padding: '11px' }}>← Modifica</button>
                    <button onClick={handleConfirm} className="btn-gold flex-1" style={{ fontSize: '0.85rem', padding: '11px' }}>Conferma →</button>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-lg overflow-hidden sticky top-24" style={{ background: 'var(--surface)', border: '1px solid var(--border-light)' }}>
            {/* Price header */}
            <div className="px-5 pt-5 pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
                <div>
                    <span className="text-xs text-textMuted">da </span>
                    <span className="font-serif text-3xl" style={{ color: 'var(--accent)' }}>€{pricePerNight}</span>
                    <span className="text-sm text-textMuted"> / notte</span>
                </div>
                <div className="text-xs font-mono text-textMuted mt-1">+ €{cleaningFee} pulizie · deposito €{deposit}</div>
            </div>

            <div className="p-5 space-y-5">
                {/* Calendar */}
                <div>
                    <div className="text-xs font-mono tracking-widest uppercase text-textMuted mb-3">Check-in</div>
                    <MiniCalendar selected={checkIn} onSelect={setCheckIn} />
                    {checkIn && (
                        <div className="mt-2 text-xs font-mono" style={{ color: 'var(--accent)' }}>
                            ✓ {checkIn.toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </div>
                    )}
                </div>

                {/* Duration */}
                <div>
                    <div className="text-xs font-mono tracking-widest uppercase text-textMuted mb-2">Durata soggiorno</div>
                    <div className="flex items-center gap-3">
                        {[1, 2, 3, 6].map(m => (
                            <button key={m} onClick={() => setMonths(m)}
                                className="flex-1 py-2 text-xs rounded font-mono transition-colors duration-150"
                                style={{
                                    background: months === m ? 'var(--accent)' : 'var(--surface-2)',
                                    color: months === m ? '#0A0A0A' : 'var(--text-muted)',
                                    border: '1px solid ' + (months === m ? 'var(--accent)' : 'var(--border-light)'),
                                    borderRadius: '4px',
                                }}>
                                {m === 1 ? '1 mese' : `${m} mesi`}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Guests */}
                <div>
                    <div className="text-xs font-mono tracking-widest uppercase text-textMuted mb-2">Ospiti</div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => setGuests(g => Math.max(1, g - 1))}
                            className="w-9 h-9 rounded border text-textMuted hover:text-textPrimary hover:border-accent transition-colors"
                            style={{ borderColor: 'var(--border-light)', fontSize: '18px', lineHeight: 1 }}>−</button>
                        <span className="font-mono text-textPrimary text-sm w-6 text-center">{guests}</span>
                        <button onClick={() => setGuests(g => Math.min(6, g + 1))}
                            className="w-9 h-9 rounded border text-textMuted hover:text-textPrimary hover:border-accent transition-colors"
                            style={{ borderColor: 'var(--border-light)', fontSize: '18px', lineHeight: 1 }}>+</button>
                    </div>
                </div>

                {/* Price breakdown */}
                <div className="pt-3 border-t space-y-1.5" style={{ borderColor: 'var(--border)' }}>
                    <Row label={`€${pricePerNight} × ${months * 30} notti`} value={`€${pricePerNight * 30 * months}`} />
                    <Row label="Pulizie" value={`€${cleaningFee}`} />
                    <div className="flex justify-between pt-2 border-t mt-1" style={{ borderColor: 'var(--border)' }}>
                        <span className="text-sm font-medium text-textPrimary">Totale</span>
                        <span className="text-sm font-medium" style={{ color: 'var(--accent)' }}>€{total}</span>
                    </div>
                </div>

                {toast && (
                    <div className="text-xs font-mono p-2.5 rounded text-center"
                        style={{ background: 'rgba(212,168,83,0.08)', border: '1px solid rgba(212,168,83,0.2)', color: 'var(--accent)' }}>
                        {toast}
                    </div>
                )}

                <button onClick={handleBook} className="btn-gold w-full" style={{ padding: '14px', fontSize: '0.9rem' }}>
                    {user ? 'Prenota ora →' : 'Accedi per prenotare →'}
                </button>

                <p className="text-xs text-textMuted text-center font-mono">Cancellazione gratuita entro 48h</p>
            </div>
        </div>
    );
}

function Row({ label, value }) {
    return (
        <div className="flex justify-between">
            <span className="text-sm text-textMuted">{label}</span>
            <span className="text-sm text-textPrimary">{value}</span>
        </div>
    );
}

// ── Main Page ──────────────────────────────────────────────────────
export default function PropertyDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const property = getPropertyById(id);

    if (!property) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-textMuted">
                <p className="text-sm font-mono mb-4">Struttura non trovata.</p>
                <button onClick={() => navigate(-1)} className="btn-ghost text-sm">← Torna indietro</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-20 pb-20 px-6 md:px-10">
            <div className="max-w-content mx-auto">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 mb-8 text-xs font-mono text-textMuted">
                    <Link to="/" className="hover:text-accent transition-colors">Home</Link>
                    <span>›</span>
                    <Link to="/#properties" className="hover:text-accent transition-colors">Strutture</Link>
                    <span>›</span>
                    <span className="text-textPrimary">{property.name}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-12">
                    {/* LEFT — Property info */}
                    <div>
                        {/* Hero image */}
                        <div className="rounded-lg mb-8 relative overflow-hidden"
                            style={{ height: '340px' }}>
                            <img
                                src={property.img}
                                alt={property.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            />
                            {/* gradient overlay */}
                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,10,10,0.8) 0%, rgba(10,10,10,0.15) 60%, transparent 100%)' }} />
                            {/* Arch accent */}
                            <div style={{
                                position: 'absolute', bottom: '-20px', left: '50%',
                                transform: 'translateX(-50%)', width: '140px', height: '200px',
                                borderRadius: '70px 70px 0 0',
                                background: property.archColor,
                                border: `1px solid ${property.archColor.replace(/[\d.]+\)$/, '0.4)')}`,
                                mixBlendMode: 'screen',
                            }} />
                            {/* WiFi badge */}
                            <div className="absolute top-4 right-4 font-mono text-[10px] tracking-widest uppercase px-3 py-1.5 rounded"
                                style={{ background: 'rgba(10,10,10,0.65)', border: '1px solid rgba(212,168,83,0.3)', color: 'var(--accent)', backdropFilter: 'blur(6px)' }}>
                                WiFi Certified ✓
                            </div>
                        </div>

                        {/* Title */}
                        <div className="section-chip mb-4">MARINA DI RAGUSA, SICILY</div>
                        <h1 className="font-serif text-textPrimary mb-2" style={{ fontSize: '36px', lineHeight: 1.1 }}>
                            {property.name}
                        </h1>
                        <p className="text-textMuted text-sm mb-8">{property.location}</p>

                        {/* Description */}
                        <p className="text-textPrimary leading-relaxed mb-8 text-[15px]">{property.description}</p>

                        {/* Specs grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                            {property.specs ? (
                                Array.isArray(property.specs[0]) || typeof property.specs[0] === 'object' ? (
                                    property.specs.map(s => (
                                        <div key={s.label} className="flex items-start gap-3 p-4 rounded-lg"
                                            style={{ background: 'var(--surface)', border: '1px solid var(--border-light)' }}>
                                            <span className="text-lg leading-none mt-0.5">{s.icon || '✓'}</span>
                                            <div>
                                                <div className="text-sm font-medium text-textPrimary">{s.label}</div>
                                                <div className="text-xs text-textMuted">{s.sub}</div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    property.specs.map(s => (
                                        <div key={s} className="flex items-start gap-3 p-4 rounded-lg"
                                            style={{ background: 'var(--surface)', border: '1px solid var(--border-light)' }}>
                                            <span className="text-lg leading-none mt-0.5">⚡</span>
                                            <div>
                                                <div className="text-sm font-medium text-textPrimary">{s}</div>
                                                <div className="text-xs text-textMuted">Servizio verificato</div>
                                            </div>
                                        </div>
                                    ))
                                )
                            ) : null}
                        </div>

                        {/* Long description if exists */}
                        {property.longDescription && (
                            <div className="mb-8">
                                <h3 className="text-xs font-mono tracking-widest uppercase text-textMuted mb-3">Dettagli Struttura</h3>
                                <p className="text-textPrimary leading-relaxed opacity-80">{property.longDescription}</p>
                            </div>
                        )}

                        {/* Highlights */}
                        <div className="border-t pt-8" style={{ borderColor: 'var(--border)' }}>
                            <div className="text-xs font-mono tracking-widest uppercase text-textMuted mb-4">
                                Cosa è incluso
                            </div>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {(property.highlights || property.amenities || []).map(h => (
                                    <li key={h} className="check-item text-sm">
                                        <span className="check-icon text-xs">✓</span>
                                        <span className="text-textMuted">{h}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* RIGHT — Booking sidebar */}
                    <div>
                        <BookingSidebar property={property} />
                    </div>
                </div>
            </div>
        </div>
    );
}

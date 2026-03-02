import { useState, useMemo } from 'react';
import { SEED_PROPERTIES, COMUNI } from '../data/seedProperties';
import { useI18n } from '../context/I18nContext';
import PropCard from '../components/PropCard';

export default function PropertiesPage() {
    const { t } = useI18n();
    const [filterComune, setFilterComune] = useState('Tutti');
    const [maxPrice, setMaxPrice] = useState(500);
    const [selectedAmenities, setSelectedAmenities] = useState([]);

    const FILTER_TAGS = [
        { label: '🚀 Fibra 100+', value: 'fibra' },
        { label: '💻 Postazione', value: 'work' },
        { label: '❄️ A/C', value: 'ac' },
        { label: '🏊 Piscina', value: 'piscina' },
        { label: '🌊 Vista Mare', value: 'mare' },
        { label: '🍳 Cucina', value: 'cucina' },
    ];

    const allProperties = useMemo(() => {
        let custom = [];
        try {
            custom = JSON.parse(localStorage.getItem('digitalands_custom_properties') || '[]').filter(p => p.published);
        } catch (e) { console.error(e); }
        return [...SEED_PROPERTIES, ...custom];
    }, []);

    const filtered = allProperties.filter(p => {
        const matchesComune = filterComune === 'Tutti' || p.comune === filterComune;
        let price = p.pricePerNight;
        if (!price && p.price) {
            price = parseInt(String(p.price).replace(/[^\d]/g, '')) || 0;
        }
        const matchesPrice = (price || 0) <= maxPrice;

        const matchesAmenities = selectedAmenities.every(val => {
            const propertyTags = [
                ...p.amenities?.map(a => a.toLowerCase()) || [],
                ...p.specs?.map(s => s.toLowerCase()) || []
            ].join(' ');

            if (val === 'fibra') return propertyTags.includes('fibra') || propertyTags.includes('100 mbps') || propertyTags.includes('150 mbps') || propertyTags.includes('200 mbps') || propertyTags.includes('gigabit') || propertyTags.includes('starlink');
            if (val === 'work') return propertyTags.includes('workstation') || propertyTags.includes('ufficio') || propertyTags.includes('desk') || propertyTags.includes('office') || propertyTags.includes('scrivania');
            if (val === 'ac') return propertyTags.includes('a/c') || propertyTags.includes('climatizzazione');
            if (val === 'piscina') return propertyTags.includes('piscina') || propertyTags.includes('jacuzzi') || propertyTags.includes('idromassaggio');
            if (val === 'mare') return propertyTags.includes('mare') || propertyTags.includes('spiaggia');
            if (val === 'cucina') return propertyTags.includes('cucina');
            return false;
        });

        return matchesComune && matchesPrice && matchesAmenities;
    });

    return (
        <div style={{ minHeight: '100vh', paddingTop: '100px', paddingBottom: '100px', background: 'var(--bg)' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>

                {/* Header */}
                <div style={{ marginBottom: '48px', textAlign: 'center' }}>
                    <div className="section-chip" style={{ margin: '0 auto 16px' }}>EXPLORE</div>
                    <h1 style={{
                        fontFamily: "'Unbounded', sans-serif", fontSize: 'clamp(2rem, 5vw, 3rem)',
                        fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px'
                    }}>
                        {t('nav_properties')}
                    </h1>
                    <p style={{ color: 'var(--text-primary)', opacity: 0.9, maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem' }}>
                        Strutture selezionate e verificate per il lavoro remoto in Sicilia.
                    </p>
                </div>

                {/* Filters */}
                <div style={{
                    background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px',
                    padding: '24px', marginBottom: '40px'
                }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-end', marginBottom: '24px' }}>
                        <div style={{ flex: '1 1 200px' }}>
                            <label style={{ fontSize: '10px', fontFamily: 'monospace', textTransform: 'uppercase', color: 'var(--text-primary)', opacity: 0.8, display: 'block', marginBottom: '8px' }}>
                                📍 Comune
                            </label>
                            <select
                                value={filterComune}
                                onChange={e => setFilterComune(e.target.value)}
                                style={{
                                    width: '100%', padding: '12px', background: 'var(--bg)',
                                    border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)',
                                    outline: 'none'
                                }}
                            >
                                {COMUNI.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        <div style={{ flex: '1 1 250px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <label style={{ fontSize: '10px', fontFamily: 'monospace', textTransform: 'uppercase', color: 'var(--text-primary)', opacity: 0.8 }}>
                                    💰 Budget Max: €{maxPrice}
                                </label>
                            </div>
                            <input
                                type="range" min="50" max="500" step="10"
                                value={maxPrice} onChange={e => setMaxPrice(parseInt(e.target.value))}
                                style={{ width: '100%', accentColor: 'var(--accent)' }}
                            />
                        </div>

                        <div style={{ marginLeft: 'auto', alignSelf: 'center' }}>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                                {filtered.length} strutture trovate
                            </div>
                        </div>
                    </div>

                    <div>
                        <label style={{ fontSize: '10px', fontFamily: 'monospace', textTransform: 'uppercase', color: 'var(--text-primary)', opacity: 0.8, display: 'block', marginBottom: '12px' }}>
                            ⚡ Technical & Amenities
                        </label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                            {FILTER_TAGS.map(tag => {
                                const active = selectedAmenities.includes(tag.value);
                                return (
                                    <button
                                        key={tag.value}
                                        onClick={() => {
                                            setSelectedAmenities(prev =>
                                                active ? prev.filter(v => v !== tag.value) : [...prev, tag.value]
                                            );
                                        }}
                                        style={{
                                            padding: '8px 16px', borderRadius: '30px', fontSize: '12px',
                                            background: active ? 'var(--accent-dim)' : 'transparent',
                                            border: active ? '1px solid var(--accent)' : '1px solid var(--border-light)',
                                            color: active ? 'var(--accent)' : 'var(--text-muted)',
                                            cursor: 'pointer', transition: 'all 0.2s',
                                            fontWeight: active ? '600' : '400'
                                        }}
                                    >
                                        {tag.label}
                                    </button>
                                );
                            })}
                            {selectedAmenities.length > 0 && (
                                <button
                                    onClick={() => setSelectedAmenities([])}
                                    style={{
                                        padding: '8px 12px', fontSize: '11px', color: 'var(--text-subtle)',
                                        background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'monospace'
                                    }}
                                >
                                    Reset filtri ×
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Grid */}
                {filtered.length > 0 ? (
                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                        gap: '32px'
                    }}>
                        {filtered.map((p, i) => (
                            <div key={p.id}>
                                <PropCard prop={p} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '80px 0', border: '1px dashed var(--border)', borderRadius: '16px' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '16px' }}>🔎</div>
                        <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Nessuna corrispondenza</h3>
                        <p style={{ color: 'var(--text-muted)' }}>Prova a cambiare i filtri per vedere più risultati.</p>
                        <button
                            className="btn-ghost" style={{ marginTop: '20px' }}
                            onClick={() => { setFilterComune('Tutti'); setMaxPrice(500); setSelectedAmenities([]); }}
                        >
                            Resetta filtri
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

import { Link } from 'react-router-dom';

export default function PropCard({ prop }) {
    // Standardize data fields
    const name = prop.name;
    const img = prop.img || prop.image;
    const price = prop.price || `€${prop.pricePerNight}`;
    const location = prop.location || 'Ragusa province';
    const specs = prop.specs || [
        `${prop.rooms || 1} camere`,
        `${prop.maxGuests || 2} ospiti`,
        'WiFi'
    ];
    const archColor = prop.archColor || 'rgba(212,168,83,0.15)';

    return (
        <div className="card-hover flex flex-col bg-surface overflow-hidden" style={{ borderRadius: '12px', border: '1px solid var(--border)' }}>
            {/* Image */}
            <div style={{ height: '220px', position: 'relative', overflow: 'hidden' }}>
                <img
                    src={img}
                    alt={name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    loading="lazy"
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,10,10,0.8) 0%, rgba(10,10,10,0.1) 60%, transparent 100%)' }} />

                {/* Visual arch element */}
                <div style={{
                    position: 'absolute', bottom: '-15px', left: '50%',
                    transform: 'translateX(-50%)', width: '100px', height: '140px',
                    borderRadius: '50px 50px 0 0', background: archColor,
                    border: `1px solid ${archColor.replace(/[\d.]+\)$/, '0.3)')}`,
                    mixBlendMode: 'screen',
                }} />

                <div className="absolute top-4 right-4 font-mono text-[10px] tracking-widest uppercase px-2.5 py-1 rounded"
                    style={{ background: 'rgba(10,10,10,0.7)', border: '1px solid var(--border-light)', color: 'var(--text-muted)', backdropFilter: 'blur(4px)' }}>
                    Verified ✓
                </div>
            </div>

            {/* Body */}
            <div className="p-6 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <div className="font-semibold text-textPrimary text-lg mb-0.5">{name}</div>
                        <div className="text-white text-xs font-mono uppercase tracking-wider opacity-90">{location} · Sicilia</div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-1.5 my-4">
                    {specs.slice(0, 3).map(s => (
                        <span key={s} className="font-mono text-[10px] px-2 py-0.5 rounded border border-border-light text-white bg-surface-2 opacity-90">
                            {s}
                        </span>
                    ))}
                </div>

                <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                    <div>
                        <span className="font-semibold text-accent" style={{ fontSize: '20px' }}>{price}</span>
                        <span className="text-xs text-textPrimary opacity-80"> / notte</span>
                    </div>
                    <Link
                        to={`/property/${prop.id}`}
                        className="btn-ghost"
                        style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                    >
                        Esplora →
                    </Link>
                </div>
            </div>
        </div>
    );
}

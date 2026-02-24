import { useI18n } from '../context/I18nContext';

const PARTNERS = [
    {
        category: 'Ristorazione',
        icon: '🍽️',
        items: [
            { name: 'Ristorante Duomo', location: 'Ragusa Ibla', logo: null, color: '#f87171' },
            { name: 'La Gazza Ladra', location: 'Modica', logo: null, color: '#fb923c' },
            { name: 'Fattoria delle Torri', location: 'Modica', logo: null, color: '#fbbf24' },
        ],
    },
    {
        category: 'Scuole di Surf',
        icon: '🏄',
        items: [
            { name: 'Surf Ragusa', location: 'Marina di Ragusa', logo: null, color: '#34d399' },
            { name: 'Pozzallo Surf Club', location: 'Pozzallo', logo: null, color: '#22d3ee' },
            { name: 'Kite School Sicilia', location: 'Santa Croce Camerina', logo: null, color: '#60a5fa' },
        ],
    },
    {
        category: 'Agenzie Immobiliari',
        icon: '🏡',
        items: [
            { name: 'Ibla Real Estate', location: 'Ragusa', logo: null, color: '#a78bfa' },
            { name: 'Case Barocche', location: 'Scicli', logo: null, color: '#f472b6' },
            { name: 'Sicily Homes', location: 'Modica', logo: null, color: '#D4A853' },
        ],
    },
    {
        category: 'Sport & Benessere',
        icon: '🧘',
        items: [
            { name: 'Yoga Iblea', location: 'Ragusa', logo: null, color: '#4ade80' },
            { name: 'Etna Adventure', location: 'Ragusa', logo: null, color: '#fb923c' },
            { name: 'Dive Center Pozzallo', location: 'Pozzallo', logo: null, color: '#22d3ee' },
        ],
    },
];

function PartnerLogo({ partner }) {
    const initials = partner.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    return (
        <div
            className="card-hover"
            style={{
                background: 'var(--surface)',
                padding: '20px 16px',
                borderRadius: '10px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
                cursor: 'default',
            }}
        >
            {/* Logo placeholder / future image slot */}
            <div style={{
                width: '60px', height: '60px', borderRadius: '12px',
                background: `${partner.color}18`,
                border: `1px solid ${partner.color}33`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.1rem', fontWeight: 700,
                color: partner.color,
                fontFamily: "'Unbounded', sans-serif",
                letterSpacing: '-0.02em',
            }}>
                {initials}
            </div>
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                    {partner.name}
                </div>
                <div style={{ fontSize: '10px', fontFamily: 'monospace', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {partner.location}
                </div>
            </div>
        </div>
    );
}

export default function Partners() {
    const { t } = useI18n();

    return (
        <section id="partners" style={{ padding: '100px 24px', borderTop: '1px solid var(--border)' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <div className="section-chip" style={{ margin: '0 auto 16px' }}>
                        {t('partners_chip')}
                    </div>
                    <h2 style={{
                        fontFamily: "'Unbounded', sans-serif",
                        fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        marginBottom: '12px',
                        lineHeight: 1.15,
                    }}>
                        {t('partners_title')}
                    </h2>
                    <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto', lineHeight: 1.6 }}>
                        {t('partners_sub')}
                    </p>
                </div>

                {/* Category groups */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
                    {PARTNERS.map(group => (
                        <div key={group.category}>
                            {/* Category header */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                                <span style={{ fontSize: '1.1rem' }}>{group.icon}</span>
                                <span style={{
                                    fontSize: '11px', fontFamily: 'monospace',
                                    letterSpacing: '0.12em', textTransform: 'uppercase',
                                    color: 'var(--text-muted)',
                                }}>
                                    {group.category}
                                </span>
                                <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                            </div>

                            {/* Partner logos grid */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                                gap: '16px',
                            }}>
                                {group.items.map(partner => (
                                    <PartnerLogo key={partner.name} partner={partner} />
                                ))}

                                {/* "Your logo here" slot */}
                                <div style={{
                                    background: 'transparent',
                                    padding: '20px 16px',
                                    borderRadius: '10px',
                                    border: '1px dashed var(--border-light)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    cursor: 'pointer',
                                    transition: 'border-color 0.2s',
                                }}
                                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-light)'}
                                >
                                    <span style={{ fontSize: '1.5rem', opacity: 0.4 }}>+</span>
                                    <span style={{ fontSize: '10px', fontFamily: 'monospace', color: 'var(--text-muted)', textAlign: 'center' }}>
                                        Il tuo logo qui
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div style={{ textAlign: 'center', marginTop: '56px' }}>
                    <a href="mailto:partner@digitalands.it" className="btn-gold" style={{ display: 'inline-block', padding: '14px 36px', fontSize: '0.9rem' }}>
                        {t('partners_cta')} →
                    </a>
                </div>
            </div>
        </section>
    );
}

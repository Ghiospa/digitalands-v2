import { useRef, useState, memo } from 'react';
import { useAuth } from '../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import { toPng } from 'html-to-image';

const SicilyCardBg = memo(function SicilyCardBg() {
    return (
        <svg viewBox="0 0 280 160" fill="none" xmlns="http://www.w3.org/2000/svg"
            style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.07, width: '200px' }}>
            {/* Sicily silhouette — simplified path */}
            <path d="M 22 90 C 18 80 22 68 32 60 C 42 52 52 58 62 52 C 72 46 78 38 90 34 C 102 30 112 36 122 30 C 132 24 138 16 148 14 C 158 12 166 18 172 24 C 178 30 180 40 186 46 C 192 52 200 52 206 58 C 212 64 212 74 218 80 C 224 86 232 86 236 92 C 240 98 238 108 232 114 C 226 120 216 118 208 118 C 200 118 194 122 186 122 C 178 122 172 118 164 118 C 156 118 150 122 142 122 C 134 122 128 118 120 118 C 112 118 104 122 96 120 C 88 118 82 112 74 110 C 66 108 58 112 50 108 C 42 104 36 96 28 92 Z"
                fill="#D4A853" />
            {/* Etna */}
            <path d="M 60 50 L 66 36 L 72 50 Z" fill="#D4A853" opacity="0.6" />
        </svg>
    );
});

const ROLE_LABELS = {
    guest: 'Nomade Digitale',
    activity_manager: 'Activity Manager',
    property_manager: 'Property Manager',
};

const ROLE_COLORS = {
    guest: '#D4A853',
    activity_manager: '#4ade80',
    property_manager: '#60a5fa',
};

const DigitalCard = memo(function DigitalCard() {
    const { user } = useAuth();
    const cardRef = useRef(null);
    const [downloading, setDownloading] = useState(false);

    if (!user) return null;

    const memberNumber = `DN-${user.id.toString().slice(-6).toUpperCase()}`;
    const memberSince = new Date(user.createdAt || Date.now()).toLocaleDateString('it-IT', { year: 'numeric', month: 'long' });
    const roleLabel = ROLE_LABELS[user.role] || 'Nomade Digitale';
    const roleColor = ROLE_COLORS[user.role] || '#D4A853';

    // Download card as image
    const downloadCard = async () => {
        if (!cardRef.current) return;
        setDownloading(true);
        try {
            const dataUrl = await toPng(cardRef.current, {
                cacheBust: true,
                style: {
                    transform: 'none', // Reset tilt for snapshot
                    scale: '1',
                }
            });
            const link = document.createElement('a');
            link.download = `digitalands-nomad-card-${user.name.replace(/\s+/g, '-').toLowerCase()}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error('Download failed', err);
        } finally {
            setDownloading(false);
        }
    };

    // Tilt on mouse move
    function handleMouseMove(e) {
        const card = cardRef.current;
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const rotX = ((y / rect.height) - 0.5) * 12;
        const rotY = ((x / rect.width) - 0.5) * -12;
        card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.02)`;
    }
    function handleMouseLeave() {
        const card = cardRef.current;
        if (!card) return;
        card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale(1)';
    }

    return (
        <div style={{ marginBottom: '32px', maxWidth: '340px' }}>
            <div style={{ fontSize: '11px', fontFamily: 'monospace', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '14px' }}>
                🪪 Tessera Digitale
            </div>

            {/* Card Container */}
            <div
                ref={cardRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{
                    position: 'relative',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    padding: '24px 26px',
                    background: 'linear-gradient(135deg, #1A1600 0%, #111 50%, #0D1A0D 100%)',
                    border: `1px solid ${roleColor}40`,
                    boxShadow: `0 0 40px ${roleColor}18, 0 20px 60px rgba(0,0,0,0.6)`,
                    cursor: 'default',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                    userSelect: 'none',
                    zIndex: 1,
                }}
            >
                {/* Background gleam */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: `radial-gradient(ellipse 80% 60% at 20% 30%, ${roleColor}0A 0%, transparent 60%)`,
                    pointerEvents: 'none',
                }} />

                {/* Sicily silhouette watermark */}
                <SicilyCardBg />

                {/* Holographic shimmer strip */}
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                    background: `linear-gradient(90deg, transparent, ${roleColor}, #60a5fa, #4ade80, transparent)`,
                    opacity: 0.8,
                }} />

                {/* Header row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', position: 'relative' }}>
                    <div>
                        <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: roleColor, marginBottom: '2px' }}>
                            Digitalands
                        </div>
                        <div style={{ fontSize: '9px', fontFamily: 'monospace', color: 'rgba(240,240,240,0.35)', letterSpacing: '0.06em' }}>
                            OFFICIAL MEMBERSHIP
                        </div>
                    </div>
                    {/* Globe icon */}
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: `${roleColor}15`, border: `1px solid ${roleColor}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                        🌍
                    </div>
                </div>

                {/* Mid section: Avatar & QR Code */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{
                            width: '52px', height: '52px', borderRadius: '12px',
                            background: `linear-gradient(135deg, ${roleColor}40, ${roleColor}80)`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontFamily: "'Unbounded', sans-serif", fontSize: '1.4rem', fontWeight: 700, color: roleColor,
                            border: `1px solid ${roleColor}50`, flexShrink: 0,
                        }}>
                            {user.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div>
                            <div style={{ fontFamily: "'Unbounded', sans-serif", fontWeight: 700, fontSize: '0.95rem', color: '#F0F0F0', lineHeight: 1.2, marginBottom: '4px' }}>
                                {user.name}
                            </div>
                            <div style={{ fontSize: '9px', fontFamily: 'monospace', letterSpacing: '0.1em', textTransform: 'uppercase', color: roleColor }}>
                                {user.profession || user.company_role || roleLabel}
                            </div>
                        </div>
                    </div>
                    {/* QR Code */}
                    <div style={{
                        padding: '6px',
                        background: '#FFF',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                    }}>
                        <QRCodeSVG value={`https://digitalands-v2.vercel.app/member/${user.id}`} size={42} />
                    </div>
                </div>

                {/* Member info row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px', position: 'relative' }}>
                    {[
                        { label: 'Membro N.', value: memberNumber },
                        { label: 'Provincia', value: 'Ragusa, Sicilia' },
                        { label: 'Membro dal', value: memberSince },
                        { label: 'Stato', value: '● Attivo' },
                    ].map(item => (
                        <div key={item.label}>
                            <div style={{ fontSize: '9px', fontFamily: 'monospace', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(240,240,240,0.3)', marginBottom: '2px' }}>
                                {item.label}
                            </div>
                            <div style={{ fontSize: '11px', fontFamily: 'monospace', color: item.label === 'Stato' ? '#4ade80' : 'rgba(240,240,240,0.8)' }}>
                                {item.value}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom strip - fake card number style */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.06)',
                    position: 'relative',
                }}>
                    <div style={{ fontFamily: 'monospace', fontSize: '11px', letterSpacing: '0.3em', color: 'rgba(240,240,240,0.2)' }}>
                        ····  ····  ····  {user.id.toString().slice(-4)}
                    </div>
                    <div style={{ fontSize: '9px', fontFamily: 'monospace', color: roleColor, letterSpacing: '0.06em' }}>
                        SICILY 🇮🇹
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                    onClick={downloadCard}
                    disabled={downloading}
                    className="btn-ghost"
                    style={{ width: '100%', padding: '10px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                    {downloading ? 'Generazione...' : '📥 Scarica come immagine'}
                </button>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <button
                        onClick={() => alert('Apple Wallet: In una versione di produzione, questo genererebbe un file .pkpass firmato da Apple.')}
                        style={{
                            background: '#000', color: '#FFF', border: '1px solid #333', borderRadius: '8px',
                            padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                            fontSize: '11px', fontWeight: 600, cursor: 'pointer'
                        }}
                    >
                         Wallet
                    </button>
                    <button
                        onClick={() => alert('Google Wallet: In una versione di produzione, questo utilizzerebbe le Google Wallet API per aggiungere la tessera.')}
                        style={{
                            background: '#000', color: '#FFF', border: '1px solid #333', borderRadius: '8px',
                            padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                            fontSize: '11px', fontWeight: 600, cursor: 'pointer'
                        }}
                    >
                        <span style={{ fontSize: '1.2rem' }}>💳</span> Google
                    </button>
                </div>
            </div>

            {/* Premium Discord Entry */}
            {user.is_premium && (
                <div style={{ marginTop: '16px', padding: '16px', borderRadius: '12px', background: 'rgba(88, 101, 242, 0.1)', border: '1px solid rgba(88, 101, 242, 0.25)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#5865F2', display: 'flex', alignItems: 'center', justifyCenter: 'center', flexShrink: 0, fontSize: '1.2rem' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="white" style={{ margin: 'auto' }}>
                            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.003 14.003 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                        </svg>
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#F0F0F0', marginBottom: '2px' }}>Entra in Discord</div>
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.2 }}>Community premium dei Nomadi Digitali.</div>
                    </div>
                    <a
                        href="https://discord.gg/hR7bynNd"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.08)', borderRadius: '6px', fontSize: '11px', fontWeight: 600, color: '#FFF', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                        UNISCITI
                    </a>
                </div>
            )}

            {/* Helper text */}
            <p style={{ marginTop: '10px', fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                Usa il QR code per accedere ai vantaggi della community in tutta la Sicilia.
            </p>
        </div>
    );
});

export default DigitalCard;

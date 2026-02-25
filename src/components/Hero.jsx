import { useEffect, useRef } from 'react';
import sicilyImage from '../assets/sicily-outline.png';

const AVATARS = [
    { bg: 'linear-gradient(135deg,#8A6B3A,#D4A853)' },
    { bg: 'linear-gradient(135deg,#3A6B8A,#53A8D4)' },
    { bg: 'linear-gradient(135deg,#4A8A3A,#87D453)' },
    { bg: 'linear-gradient(135deg,#8A3A4A,#D45387)' },
    { bg: 'linear-gradient(135deg,#5A3A8A,#8753D4)' },
];

const STATS = [
    { value: '300', suffix: ' giorni di sole / anno' },
    { value: '40%', suffix: ' meno rispetto a Milano' },
    { value: '30 min', suffix: ' da Comiso Airport' },
];

// Tags that blend nature + digital
const FLOAT_TAGS = [
    { text: '🌊 Acque cristalline', top: '20%', left: '3%', delay: '0s', dur: '7s', color: 'rgba(80,170,255,0.9)', bg: 'rgba(80,170,255,0.07)', border: 'rgba(80,170,255,0.28)' },
    { text: '🍋 Slow living · Fast WiFi', top: '32%', left: '1%', delay: '1.5s', dur: '9s', color: 'rgba(230,200,60,0.95)', bg: 'rgba(230,200,60,0.07)', border: 'rgba(230,200,60,0.28)' },
    { text: '⚡ 100–200 Mbps fiber', top: '50%', left: '2%', delay: '2.8s', dur: '8s', color: 'rgba(100,225,160,0.9)', bg: 'rgba(100,225,160,0.07)', border: 'rgba(100,225,160,0.25)' },
    { text: '� Aria pulita · Zero stress', top: '66%', left: '4%', delay: '0.8s', dur: '10s', color: 'rgba(120,210,120,0.9)', bg: 'rgba(120,210,120,0.07)', border: 'rgba(120,210,120,0.25)' },
    { text: '💻 Remote-friendly', top: '20%', right: '3%', delay: '1.8s', dur: '8.5s', color: 'rgba(180,145,255,0.9)', bg: 'rgba(180,145,255,0.07)', border: 'rgba(180,145,255,0.25)' },
    { text: '☀️ 300 giorni di sole', top: '34%', right: '1%', delay: '0.4s', dur: '9s', color: 'rgba(255,190,50,0.95)', bg: 'rgba(255,190,50,0.08)', border: 'rgba(255,190,50,0.28)' },
    { text: '� UNESCO · Barocco ibleo', top: '50%', right: '3%', delay: '2.2s', dur: '7.5s', color: 'rgba(212,168,83,0.9)', bg: 'rgba(212,168,83,0.07)', border: 'rgba(212,168,83,0.26)' },
    { text: '🛜 WiFi Certified ✓', top: '66%', right: '2%', delay: '1s', dur: '10s', color: 'rgba(100,225,160,0.85)', bg: 'rgba(100,225,160,0.07)', border: 'rgba(100,225,160,0.22)' },
];

// Floating mini-villa cards
const VILLA_CARDS = [
    { img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=280&q=75&fit=crop', label: 'Villa Iblea', price: '€890/mese', top: '26%', left: '4%', delay: '0s', dur: '11s' },
    { img: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=280&q=75&fit=crop', label: 'Terrazza sul Mare', price: '€1.190/mese', top: '28%', right: '3%', delay: '2s', dur: '10s' },
    { img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=280&q=75&fit=crop', label: 'Casa Barocca', price: '€970/mese', top: '56%', left: '3%', delay: '3.5s', dur: '12s' },
];

// ── SVG: Digital Sun — raggi alternati pixel/naturali ──
function DigitalSun({ size = 140 }) {
    const rays = Array.from({ length: 16 }, (_, i) => i);
    const cx = size / 2;
    return (
        <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
            {/* Outer glow ring */}
            <circle cx={cx} cy={cx} r={size * 0.46} fill="rgba(255,200,50,0.04)" />
            <circle cx={cx} cy={cx} r={size * 0.38} fill="rgba(255,200,50,0.06)" />
            {/* Pixel-style dashed ring */}
            <circle cx={cx} cy={cx} r={size * 0.32} fill="none"
                stroke="rgba(255,190,50,0.25)" strokeWidth="0.8" strokeDasharray="3 4" />
            {/* Rays — alternate between natural (smooth) and digital (dashed) */}
            {rays.map(i => {
                const angle = (i * (360 / 16) * Math.PI) / 180;
                const isDigital = i % 2 === 1;
                const r1 = size * 0.27;
                const r2 = isDigital ? size * 0.42 : size * 0.38;
                const x1 = cx + r1 * Math.cos(angle), y1 = cx + r1 * Math.sin(angle);
                const x2 = cx + r2 * Math.cos(angle), y2 = cx + r2 * Math.sin(angle);
                return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke={isDigital ? 'rgba(100,220,160,0.55)' : 'rgba(255,200,50,0.6)'}
                    strokeWidth={isDigital ? 1 : 2}
                    strokeDasharray={isDigital ? '2 3' : undefined}
                    strokeLinecap="round" />;
            })}
            {/* Core */}
            <circle cx={cx} cy={cx} r={size * 0.2} fill="rgba(255,200,50,0.18)" />
            <circle cx={cx} cy={cx} r={size * 0.12} fill="rgba(255,220,80,0.7)" />
            {/* Digital pixel dots on core edge */}
            {[0, 90, 180, 270].map(deg => {
                const a = (deg * Math.PI) / 180;
                const r = size * 0.18;
                return <rect key={deg} x={cx + r * Math.cos(a) - 1.5} y={cx + r * Math.sin(a) - 1.5}
                    width="3" height="3" fill="rgba(100,220,160,0.7)" rx="0.5" />;
            })}
        </svg>
    );
}

// ── SVG: Stylized Sicily Outline (Now using user-provided image) ──
function SicilyOutline({ size = 300 }) {
    return (
        <div style={{
            width: size,
            height: size,
            position: 'relative',
            opacity: 0.6,
            filter: 'drop-shadow(0 0 20px rgba(212,168,83,0.15)) brightness(1.2) contrast(1.1)',
            animation: 'float-slow 20s infinite ease-in-out'
        }}>
            <img
                src={sicilyImage}
                alt="Sicily Outline"
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    filter: 'sepia(1) saturate(5) hue-rotate(-10deg) brightness(0.9)' // Give it a gold-ish tint
                }}
            />
        </div>
    );
}

// ── SVG: Lemon + WiFi fusion ──
function LemonWifi({ size = 80 }) {
    const cx = size / 2, cy = size * 0.52;
    return (
        <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
            {/* Lemon body */}
            <ellipse cx={cx} cy={cy} rx={size * 0.28} ry={size * 0.34}
                fill="rgba(230,205,50,0.18)" stroke="rgba(230,205,50,0.55)" strokeWidth="1.2" />
            {/* Lemon tip top */}
            <ellipse cx={cx} cy={size * 0.12} rx={size * 0.08} ry={size * 0.09}
                fill="rgba(230,205,50,0.22)" stroke="rgba(230,205,50,0.4)" strokeWidth="1" />
            {/* Lemon tip bottom */}
            <ellipse cx={cx} cy={size * 0.91} rx={size * 0.08} ry={size * 0.07}
                fill="rgba(230,205,50,0.22)" stroke="rgba(230,205,50,0.4)" strokeWidth="1" />
            {/* Leaf */}
            <path d={`M ${cx} ${size * 0.12} Q ${cx + size * 0.18} ${size * 0.02} ${cx + size * 0.26} ${size * 0.08} Q ${cx + size * 0.14} ${size * 0.14} ${cx} ${size * 0.12}`}
                fill="rgba(100,200,100,0.35)" stroke="rgba(100,200,100,0.6)" strokeWidth="0.8" />
            {/* WiFi arcs inside lemon */}
            <path d={`M ${cx - size * 0.1} ${cy + size * 0.1} Q ${cx} ${cy - size * 0.05} ${cx + size * 0.1} ${cy + size * 0.1}`}
                stroke="rgba(230,205,50,0.75)" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            <path d={`M ${cx - size * 0.06} ${cy + size * 0.15} Q ${cx} ${cy + size * 0.04} ${cx + size * 0.06} ${cy + size * 0.15}`}
                stroke="rgba(100,220,160,0.8)" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            <circle cx={cx} cy={cy + size * 0.19} r="1.8" fill="rgba(100,220,160,0.9)" />
        </svg>
    );
}

// ── SVG: Olive branch with circuit nodes ──
function OliveBranch({ size = 100 }) {
    return (
        <svg viewBox="0 0 100 70" width={size} height={size * 0.7} fill="none">
            {/* Main stem */}
            <path d="M 10 60 Q 40 40 70 20 Q 85 12 92 10"
                stroke="rgba(120,190,100,0.5)" strokeWidth="1.5" strokeLinecap="round" />
            {/* Leaves */}
            {[
                { cx: 25, cy: 51, r: 8, a: -40 },
                { cx: 42, cy: 38, r: 7, a: -55 },
                { cx: 60, cy: 27, r: 6, a: -50 },
                { cx: 76, cy: 17, r: 5, a: -45 },
            ].map((l, i) => (
                <ellipse key={i} cx={l.cx} cy={l.cy} rx={l.r} ry={l.r * 0.45}
                    transform={`rotate(${l.a} ${l.cx} ${l.cy})`}
                    fill="rgba(100,185,90,0.22)" stroke="rgba(120,200,100,0.55)" strokeWidth="0.8" />
            ))}
            {/* Olives as circuit nodes */}
            {[
                { x: 22, y: 55 }, { x: 38, y: 43 }, { x: 56, y: 31 }, { x: 72, y: 20 },
            ].map((p, i) => (
                <g key={i}>
                    <circle cx={p.x} cy={p.y} r="3.5" fill="rgba(60,160,80,0.18)" stroke="rgba(100,200,120,0.55)" strokeWidth="0.8" />
                    <circle cx={p.x} cy={p.y} r="1.2" fill="rgba(100,220,140,0.8)" />
                </g>
            ))}
            {/* Circuit tick marks between nodes */}
            {[
                { x1: 27, y1: 52, x2: 34, y2: 47 },
                { x1: 44, y1: 40, x2: 50, y2: 35 },
                { x1: 62, y1: 28, x2: 67, y2: 24 },
            ].map((l, i) => (
                <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
                    stroke="rgba(100,200,120,0.35)" strokeWidth="0.8" strokeDasharray="1.5 2" />
            ))}
        </svg>
    );
}

// ── SVG: Multi-layer sea wave with data-stream dots ──
function SeaDataWave({ width = 260, flip = false }) {
    const h = 40;
    const dots = [20, 55, 95, 135, 175, 215, 248];
    return (
        <svg viewBox={`0 0 ${width} ${h}`} width={width} height={h} fill="none"
            style={flip ? { transform: 'scaleX(-1)' } : undefined}>
            {/* Wave layers */}
            <path d={`M0 ${h * 0.6} Q${width * 0.15} ${h * 0.25} ${width * 0.3} ${h * 0.6} Q${width * 0.45} ${h * 0.9} ${width * 0.6} ${h * 0.6} Q${width * 0.75} ${h * 0.28} ${width * 0.9} ${h * 0.6} Q${width * 0.97} ${h * 0.78} ${width} ${h * 0.65}`}
                stroke="rgba(60,160,255,0.45)" strokeWidth="1.8" strokeLinecap="round" />
            <path d={`M0 ${h * 0.75} Q${width * 0.15} ${h * 0.45} ${width * 0.3} ${h * 0.75} Q${width * 0.45} ${h * 0.95} ${width * 0.6} ${h * 0.75} Q${width * 0.75} ${h * 0.5} ${width * 0.9} ${h * 0.75} Q${width * 0.97} ${h * 0.88} ${width} ${h * 0.78}`}
                stroke="rgba(60,160,255,0.25)" strokeWidth="1" strokeLinecap="round" />
            {/* Data-stream dots riding the wave */}
            {dots.map((x, i) => (
                <circle key={i} cx={x} cy={h * 0.55} r="1.8"
                    fill={i % 3 === 0 ? 'rgba(100,220,160,0.75)' : 'rgba(80,170,255,0.55)'} />
            ))}
        </svg>
    );
}

export default function Hero() {
    const heroRef = useRef(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            const els = heroRef.current?.querySelectorAll('[data-hero]');
            els?.forEach((el, i) => {
                setTimeout(() => el.classList.add('visible'), i * 120);
            });
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <section
            ref={heroRef}
            className="relative min-h-screen flex flex-col items-center justify-center grid-bg overflow-hidden"
            style={{ paddingTop: '80px', paddingBottom: '0' }}
        >
            {/* ── Background glows ── */}
            <div className="absolute inset-0 pointer-events-none">
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 75% 55% at 50% 45%, rgba(212,168,83,0.09) 0%, transparent 68%)' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 50% 40% at 82% 12%, rgba(255,175,40,0.07) 0%, transparent 62%)' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 45% 38% at 12% 88%, rgba(60,145,255,0.07) 0%, transparent 58%)' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 35% 30% at 50% 95%, rgba(100,200,100,0.04) 0%, transparent 55%)' }} />
            </div>


            {/* ── Floating text tags ── */}
            <div className="absolute inset-0 pointer-events-none hidden lg:block">
                {FLOAT_TAGS.map((tag, i) => (
                    <div key={i} className="absolute hero-float-tag"
                        style={{ top: tag.top, left: tag.left, right: tag.right, animationDelay: tag.delay, animationDuration: tag.dur, color: tag.color, background: tag.bg, borderColor: tag.border }}>
                        {tag.text}
                    </div>
                ))}
            </div>

            {/* ── Floating villa cards ── */}
            <div className="absolute inset-0 pointer-events-none hidden xl:block">
                {VILLA_CARDS.map((card, i) => (
                    <div key={i} className="absolute hero-float-svg"
                        style={{ top: card.top, left: card.left, right: card.right, animationDelay: card.delay, animationDuration: card.dur, width: '152px' }}>
                        <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(212,168,83,0.2)', background: 'rgba(10,10,10,0.55)', backdropFilter: 'blur(6px)', boxShadow: '0 8px 28px rgba(0,0,0,0.45)' }}>
                            <img src={card.img} alt={card.label} style={{ width: '100%', height: '88px', objectFit: 'cover', display: 'block' }} />
                            <div style={{ padding: '8px 10px' }}>
                                <div style={{ fontSize: '10px', fontFamily: 'monospace', color: 'rgba(212,168,83,0.9)', letterSpacing: '0.04em', marginBottom: '1px' }}>{card.label}</div>
                                <div style={{ fontSize: '11px', color: 'rgba(240,240,240,0.65)', fontFamily: 'monospace' }}>{card.price}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Nature + Digital SVG decorations ── */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
                {/* ── Sicily Outline Background ── */}
                <div className="opacity-20 select-none pointer-events-none" style={{ transform: 'rotate(-5deg)' }}>
                    <SicilyOutline size="clamp(350px, 90vw, 750px)" />
                </div>

                {/* Digital Sun — top right */}
                <div className="absolute hero-float-svg" style={{ top: '6%', right: '8%', animationDelay: '0s', animationDuration: '15s', opacity: 0.9 }}>
                    <DigitalSun size={138} />
                </div>

                {/* Lemon + WiFi — mid left */}
                <div className="absolute hero-float-svg" style={{ top: '42%', left: '1%', animationDelay: '2s', animationDuration: '11s', opacity: 0.85 }}>
                    <LemonWifi size={82} />
                </div>

                {/* Lemon + WiFi mini — bottom right */}
                <div className="absolute hero-float-svg" style={{ bottom: '25%', right: '6%', animationDelay: '4s', animationDuration: '13s', opacity: 0.7 }}>
                    <LemonWifi size={56} />
                </div>

                {/* Olive branch circuit — bottom left */}
                <div className="absolute hero-float-svg" style={{ bottom: '22%', left: '5%', animationDelay: '1s', animationDuration: '12s', opacity: 0.85 }}>
                    <OliveBranch size={110} />
                </div>

                {/* Sea data wave — mid right */}
                <div className="absolute hero-float-svg" style={{ top: '54%', right: '1%', animationDelay: '0.5s', animationDuration: '10s', opacity: 0.9 }}>
                    <SeaDataWave width={200} />
                </div>

                {/* Sea data wave — lower left (flipped) */}
                <div className="absolute hero-float-svg" style={{ bottom: '16%', left: '8%', animationDelay: '2.5s', animationDuration: '9s', opacity: 0.7 }}>
                    <SeaDataWave width={160} flip />
                </div>

                {/* Gold dot grid — top left */}
                <div className="absolute" style={{ top: '16%', left: '10%' }}>
                    <svg viewBox="0 0 52 52" fill="none" width="52" height="52">
                        {[0, 10, 20, 30, 40].flatMap(x => [0, 10, 20, 30, 40].map(y =>
                            <circle key={`${x}-${y}`} cx={x + 6} cy={y + 6} r="1.3" fill="rgba(212,168,83,0.2)" />
                        ))}
                    </svg>
                </div>

                {/* Blue dot grid — bottom right */}
                <div className="absolute" style={{ bottom: '18%', right: '9%' }}>
                    <svg viewBox="0 0 52 52" fill="none" width="52" height="52">
                        {[0, 10, 20, 30, 40].flatMap(x => [0, 10, 20, 30, 40].map(y =>
                            <circle key={`${x}-${y}`} cx={x + 6} cy={y + 6} r="1.3" fill="rgba(80,160,255,0.18)" />
                        ))}
                    </svg>
                </div>
            </div>

            {/* ── Main content ── */}
            <div className="relative z-10 text-center px-6 max-w-3xl mx-auto w-full flex flex-col items-center">

                <div data-hero className="reveal stagger-1 section-chip mb-8">
                    <span className="text-accent">·</span> MARINA DI RAGUSA, SICILY
                </div>

                <h1
                    data-hero
                    className="reveal stagger-2 font-serif text-textPrimary leading-[1.1] tracking-[-0.02em] mb-6"
                    style={{ fontSize: 'clamp(38px, 6vw, 68px)' }}
                >
                    Work remotely.<br />
                    Live in{' '}
                    <span style={{
                        color: 'transparent',
                        backgroundImage: 'linear-gradient(90deg, #D4A853 0%, #F5C832 55%, #E8921A 100%)',
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                    }}>Sicily.</span>
                </h1>

                <p data-hero className="reveal stagger-3 text-textMuted leading-relaxed mb-10 max-w-[480px]" style={{ fontSize: '18px' }}>
                    Appartamenti verificati, fibra garantita e una community di
                    professionisti remoti nella destinazione più sottovalutata d'Europa.
                </p>

                {/* Nature-digital inline badges */}
                <div data-hero className="reveal stagger-3 flex flex-wrap gap-2 justify-center mb-8">
                    {[
                        { icon: '🍋', label: 'Slow living' },
                        { icon: '🌊', label: 'Mare cristallino' },
                        { icon: '⚡', label: 'Fibra garantita' },
                        { icon: '🌿', label: 'Aria pulita' },
                    ].map(b => (
                        <span key={b.label} style={{
                            display: 'inline-flex', alignItems: 'center', gap: '5px',
                            fontSize: '11px', fontFamily: 'monospace', letterSpacing: '0.04em',
                            padding: '5px 12px', borderRadius: '20px',
                            background: 'rgba(212,168,83,0.07)',
                            border: '1px solid rgba(212,168,83,0.2)',
                            color: 'rgba(240,240,240,0.6)',
                        }}>
                            {b.icon} {b.label}
                        </span>
                    ))}
                </div>

                <div data-hero className="reveal stagger-4 flex items-center gap-3 flex-wrap justify-center mb-8">
                    <a href="#waitlist" className="btn-gold">Iscriviti alla Waitlist</a>
                    <a href="#properties" className="btn-ghost">Vedi le strutture →</a>
                </div>

                <div data-hero className="reveal stagger-5 flex flex-col items-center gap-3">
                    <div className="flex items-center gap-4">
                        <div className="flex">
                            {AVATARS.map((a, i) => (
                                <div key={i} className="avatar-ring" style={{ background: a.bg, zIndex: AVATARS.length - i }} />
                            ))}
                        </div>
                        <div className="text-left">
                            <div className="text-accent text-sm tracking-wider">★★★★★</div>
                            <div className="text-xs text-textMuted">
                                <span className="text-textPrimary font-medium">120+ nomadi</span> già in lista · 4.9 dai primi membri
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Bottom stats bar ── */}
            <div className="relative z-10 w-full mt-20 border-t border-border">
                <div className="max-w-content mx-auto px-6 md:px-10">
                    <div className="flex flex-col md:flex-row items-center justify-center divide-y md:divide-y-0 md:divide-x divide-border">
                        {STATS.map((s, i) => (
                            <div key={i} className="flex items-center gap-2 px-8 py-5">
                                <span className="font-mono text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{s.value}</span>
                                <span className="text-sm text-textMuted">{s.suffix}</span>
                                {i < STATS.length - 1 && <span className="hidden md:inline ml-2 text-accent opacity-40">·</span>}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

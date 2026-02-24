const CARDS = [
    {
        num: '01',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
                <path d="M1 6h4v12H1zM19 6h4v12h-4zM5 12h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.5" />
            </svg>
        ),
        title: 'Fiber-verified only',
        desc: 'Ogni struttura è testata prima della pubblicazione. Niente sorprese durante il tuo standup del lunedì.',
    },
    {
        num: '02',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
                <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M8 14h2M8 17h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
        ),
        title: 'Settimane o mesi',
        desc: 'Tariffe flessibili, nessun vincolo da checkout a una notte. Paga mensilmente, disdici con 30 giorni di preavviso.',
    },
    {
        num: '03',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
                <path d="M17 20h5v-1a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-1a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M12 11a4 4 0 100-8 4 4 0 000 8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
        title: 'Community reale',
        desc: 'Workspace Slack, eventi locali mensili, altri nomadi nello stesso quartiere. Non sei solo.',
    },
];

export default function WhySicily() {
    return (
        <section className="py-28 px-6 md:px-10" id="why">
            <div className="max-w-content mx-auto">
                <div className="reveal" data-reveal>
                    <div className="section-chip">WHY SICILY</div>
                    <h2 className="text-textPrimary font-serif mt-2 mb-4" style={{ fontSize: '40px', lineHeight: '1.15' }}>
                        Non Bali. Non Lisbona.<br />
                        <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>Qualcosa di meglio.</em>
                    </h2>
                    <p className="text-textMuted text-base max-w-md leading-relaxed mb-14">
                        Fuso orario europeo. Qualità della vita italiana. Una frazione del costo.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {CARDS.map((card, i) => (
                        <div
                            key={card.num}
                            data-reveal
                            className={`card-hover reveal bg-surface p-8 relative overflow-hidden`}
                            style={{ transitionDelay: `${i * 100}ms` }}
                        >
                            {/* Ghost number */}
                            <div
                                className="absolute top-4 right-6 font-serif font-bold select-none pointer-events-none"
                                style={{ fontSize: '80px', lineHeight: 1, color: 'rgba(255,255,255,0.04)' }}
                            >
                                {card.num}
                            </div>

                            {/* Icon */}
                            <div className="text-accent mb-4">{card.icon}</div>

                            <h3 className="text-textPrimary font-medium text-base mb-2">{card.title}</h3>
                            <p className="text-textMuted text-sm leading-relaxed">{card.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

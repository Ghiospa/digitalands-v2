const STEPS = [
    {
        num: '01',
        title: 'Browse & Filter',
        desc: 'Scegli tra strutture verificate. Filtra per velocità WiFi, setup di lavoro, distanza dal mare.',
    },
    {
        num: '02',
        title: 'Prenota con un deposito',
        desc: 'Blocca le date con €150 di deposito. Paga il resto al check-in. Cancella entro 48h per un rimborso completo.',
    },
    {
        num: '03',
        title: 'Arriva e connettiti',
        desc: 'Welcome kit, invito Slack, SIM locale e una guida curata ad aspettarti. Pensiamo noi alla logistica.',
    },
];

export default function HowItWorks() {
    return (
        <section className="py-28 px-6 md:px-10" id="process" style={{ background: 'var(--surface)' }}>
            <div className="max-w-content mx-auto">
                <div className="reveal" data-reveal>
                    <div className="section-chip">PROCESS</div>
                    <h2 className="text-textPrimary font-serif mt-2 mb-16" style={{ fontSize: '40px', lineHeight: '1.15' }}>
                        Tre passi per la tua prossima base.
                    </h2>
                </div>

                {/* Stepper */}
                <div className="relative">
                    {/* Connector line — desktop */}
                    <div
                        className="hidden md:block absolute top-7 left-[calc(16.66%+16px)] right-[calc(16.66%+16px)]"
                        style={{ height: '1px', background: 'var(--border-light)' }}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
                        {STEPS.map((step, i) => (
                            <div
                                key={step.num}
                                data-reveal
                                className="reveal flex flex-col"
                                style={{ transitionDelay: `${i * 120}ms` }}
                            >
                                {/* Step number */}
                                <div
                                    className="font-mono font-medium text-accent mb-6 relative"
                                    style={{ fontSize: '13px', letterSpacing: '0.05em' }}
                                >
                                    <span className="relative z-10 bg-bg pr-3">{step.num}</span>
                                </div>

                                <h3 className="text-textPrimary font-medium text-base mb-3">{step.title}</h3>
                                <p className="text-textMuted text-sm leading-relaxed">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

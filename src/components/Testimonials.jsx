const TESTIMONIALS = [
    {
        quote: 'Ho lavorato 3 mesi a Marina di Ragusa. Meno di uno studio a Milano. Luce migliore. Cibo migliore. Non torno indietro.',
        name: 'Marco, 31',
        role: 'Developer · Milano',
        initials: 'M',
        grad: 'linear-gradient(135deg, #8A6B3A, #D4A853)',
    },
    {
        quote: 'La fibra ha funzionato dal primo giorno. La community Slack è davvero attiva. Tutto quello che dovevo sapere.',
        name: 'Sarah, 28',
        role: 'UX Designer · Berlino',
        initials: 'S',
        grad: 'linear-gradient(135deg, #3A6B8A, #4A9ED4)',
    },
    {
        quote: 'Cercavamo qualcosa in Italia che non fosse Roma o Milano. Ragusa è la risposta. Digitalands ha reso tutto senza attrito.',
        name: 'Luca & Anna, 33/30',
        role: 'Nomad couple · Lisbona',
        initials: 'L',
        grad: 'linear-gradient(135deg, #5A3A8A, #8A53D4)',
    },
];

export default function Testimonials() {
    return (
        <section className="py-28 px-6 md:px-10" style={{ background: 'var(--surface)' }}>
            <div className="max-w-content mx-auto">
                <div data-reveal className="reveal mb-14">
                    <div className="section-chip">EARLY MEMBERS</div>
                    <h2 className="font-serif text-textPrimary mt-2" style={{ fontSize: '40px', lineHeight: '1.15' }}>
                        Dal primo gruppo.
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 overflow-x-auto">
                    {TESTIMONIALS.map((t, i) => (
                        <div
                            key={t.name}
                            data-reveal
                            className="reveal card-hover bg-bg p-7 flex flex-col min-w-[280px]"
                            style={{ transitionDelay: `${i * 100}ms` }}
                        >
                            {/* Stars */}
                            <div className="text-accent text-sm tracking-widest mb-5">★★★★★</div>

                            <blockquote className="testimonial-card flex-1">
                                "{t.quote}"
                            </blockquote>

                            <div className="flex items-center gap-3 mt-6 pt-5" style={{ borderTop: '1px solid var(--border)' }}>
                                <div
                                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                                    style={{ background: t.grad }}
                                >
                                    {t.initials}
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-textPrimary">{t.name}</div>
                                    <div className="text-xs text-textMuted font-mono">{t.role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

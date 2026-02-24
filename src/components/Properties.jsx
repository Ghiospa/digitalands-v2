import { SEED_PROPERTIES } from '../data/seedProperties';

const PROPERTIES = SEED_PROPERTIES.slice(0, 3);

export default function Properties() {
    return (
        <section className="py-28 px-6 md:px-10" id="properties">
            <div className="max-w-content mx-auto">
                <div className="reveal" data-reveal>
                    <div className="section-chip">PROPERTIES</div>
                    <h2 className="text-textPrimary font-serif mt-2 mb-3" style={{ fontSize: '40px', lineHeight: '1.15' }}>
                        Costruite per chi lavora.
                    </h2>
                    <p className="text-textMuted text-base max-w-md leading-relaxed mb-14">
                        Ogni struttura è verificata: WiFi fibra, scrivania dedicata, posizione strategica.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
                    {PROPERTIES.map((prop, i) => (
                        <div key={prop.name} data-reveal className="reveal" style={{ transitionDelay: `${i * 100}ms` }}>
                            <PropCard prop={prop} />
                        </div>
                    ))}
                </div>

                <div data-reveal className="reveal text-center">
                    <p className="text-textMuted text-sm mb-4">Altre strutture in arrivo. Esplora il nostro catalogo completo.</p>
                    <Link to="/strutture" className="btn-gold text-sm">Vedi tutte le strutture →</Link>
                </div>
            </div>
        </section>
    );
}

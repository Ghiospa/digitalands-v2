import { useState, useEffect } from 'react';
import { SEED_PROPERTIES } from '../data/seedProperties';
import { Link } from 'react-router-dom';
import PropCard from './PropCard';
import { supabase } from '../lib/supabase';

export default function Properties() {
    const [properties, setProperties] = useState(SEED_PROPERTIES.slice(0, 3));

    useEffect(() => {
        async function fetchDbProperties() {
            const { data, error } = await supabase
                .from('properties')
                .select('id, name, location, comune, price_per_night, image_url, specs, published, owner_id')
                .eq('published', true)
                .order('created_at', { ascending: false })
                .limit(3);

            if (!error && data && data.length > 0) {
                const mapped = data.map(p => ({
                    ...p,
                    img: p.image_url,
                    pricePerNight: p.price_per_night,
                    specs: p.specs || [],
                }));
                // Prefer DB properties over seed; fill remainder with seeds if < 3
                const combined = [...mapped];
                if (combined.length < 3) {
                    const seedFill = SEED_PROPERTIES.slice(0, 3 - combined.length);
                    combined.push(...seedFill);
                }
                setProperties(combined);
            }
        }
        fetchDbProperties();
    }, []);

    return (
        <section className="py-16 md:py-28 px-6 md:px-10" id="properties">
            <div className="max-w-content mx-auto">
                <div className="reveal" data-reveal>
                    <div className="section-chip">PROPERTIES</div>
                    <h2 className="text-textPrimary font-serif mt-2 mb-3 section-title">
                        Costruite per chi lavora.
                    </h2>
                    <p className="text-textMuted text-base max-w-md leading-relaxed mb-10 md:mb-14">
                        Ogni struttura è verificata: WiFi fibra, scrivania dedicata, posizione strategica.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
                    {properties.map((prop, i) => (
                        <div key={prop.id || prop.name} data-reveal className="reveal" style={{ transitionDelay: `${i * 100}ms` }}>
                            <PropCard prop={prop} />
                        </div>
                    ))}
                </div>

                <div data-reveal className="reveal text-center">
                    <p className="text-textMuted text-sm mb-4">Esplora il nostro catalogo completo di strutture.</p>
                    <Link to="/strutture" className="btn-gold text-sm">Vedi tutte le strutture →</Link>
                </div>
            </div>
        </section>
    );
}

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';

export default function OnboardingOverlay() {
    const { user, updateProfile } = useAuth();
    const { t } = useI18n();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({});

    if (!user) return null;

    // Check DB flag OR localStorage fallback (resilient even without migrations)
    const localKey = `onboarded_${user.id}`;
    if (user.onboarded || localStorage.getItem(localKey) === 'true') return null;

    const handleComplete = async () => {
        setLoading(true);
        // Mark locally immediately so overlay won't reappear on next render
        localStorage.setItem(localKey, 'true');
        await updateProfile({
            onboarded: true,
            stats_metadata: { ...data, completed_at: new Date().toISOString() }
        });
        setLoading(false);
    };

    const roles = {
        guest: {
            title: 'Personalizza la tua esperienza',
            subtitle: 'Aiutaci a farti scoprire la Sicilia migliore per te.',
            questions: [
                {
                    id: 'interests',
                    label: 'Cosa ti interessa di più?',
                    type: 'multiselect',
                    options: ['Surf / Mare', 'Yoga & Wellness', 'Food & Wine', 'Escursioni / Etna', 'Cultura & Storia', 'Networking']
                },
                {
                    id: 'stay_duration',
                    label: 'Quanto tempo pensi di restare in Sicilia?',
                    type: 'select',
                    options: ['Meno di 2 settimane', '2-4 settimane', '1-3 mesi', 'Più di 3 mesi']
                }
            ]
        },
        activity_manager: {
            title: 'Benvenuto a bordo, Manager',
            subtitle: 'Aiutaci a capire come supportare il tuo business.',
            questions: [
                {
                    id: 'years_exp',
                    label: 'Da quanti anni operi nel settore?',
                    type: 'select',
                    options: ['Debuttante', '1-3 anni', '4-10 anni', 'Oltre 10 anni']
                },
                {
                    id: 'team_size',
                    label: 'Quanto è grande il tuo team?',
                    type: 'select',
                    options: ['Solo io', '2-5 persone', '6-15 persone', 'Grande azienda']
                }
            ]
        },
        property_manager: {
            title: 'Ottimizza la tua proprietà',
            subtitle: 'I nomadi digitali cercano standard specifici.',
            questions: [
                {
                    id: 'wifi_speed',
                    label: 'Velocità media del Wifi (Mbps)',
                    type: 'select',
                    options: ['< 30 Mbps', '30-100 Mbps', '100-300 Mbps', 'Fibra > 300 Mbps']
                },
                {
                    id: 'workspace',
                    label: 'Disponi di una postazione lavoro dedicata?',
                    type: 'select',
                    options: ['Sì, scrivania e sedia ergonomica', 'Sì, tavolo generico', 'No']
                }
            ]
        }
    };

    const config = roles[user.role] || roles.guest;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-bg/80 backdrop-blur-sm animate-fade-in" style={{ backgroundColor: 'rgba(var(--bg-rgb, 0,0,0), 0.8)' }}>
            <div className="bg-surface border border-border-light rounded-2xl p-8 max-w-lg w-full shadow-2xl relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-3xl rounded-full -mr-32 -mt-32 pointer-events-none" />

                <div className="relative">
                    <div className="text-xs font-mono tracking-widest uppercase text-accent mb-2">Configurazione Profilo</div>
                    <h2 className="text-2xl font-serif text-textPrimary mb-2">{config.title}</h2>
                    <p className="text-sm text-textMuted mb-8">{config.subtitle}</p>

                    <div className="space-y-6">
                        {config.questions.map(q => (
                            <div key={q.id} className="flex flex-col gap-3">
                                <label className="text-sm font-medium text-textPrimary">{q.label}</label>
                                {q.type === 'select' && (
                                    <div className="grid grid-cols-1 gap-2">
                                        {q.options.map(opt => (
                                            <button
                                                key={opt}
                                                onClick={() => setData(prev => ({ ...prev, [q.id]: opt }))}
                                                className={`text-left px-4 py-3 rounded-lg border text-sm transition-all ${data[q.id] === opt ? 'border-accent bg-accent-dim text-accent' : 'border-border-light bg-surfaceHover/30 text-textMuted hover:border-textMuted/50'}`}
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {q.type === 'multiselect' && (
                                    <div className="flex flex-wrap gap-2">
                                        {q.options.map(opt => {
                                            const isSelected = (data[q.id] || []).includes(opt);
                                            return (
                                                <button
                                                    key={opt}
                                                    onClick={() => {
                                                        const current = data[q.id] || [];
                                                        const next = isSelected ? current.filter(i => i !== opt) : [...current, opt];
                                                        setData(prev => ({ ...prev, [q.id]: next }));
                                                    }}
                                                    className={`px-3 py-1.5 rounded-full border text-[11px] font-mono tracking-wide transition-all ${isSelected ? 'border-accent bg-accent text-black font-bold' : 'border-border-light bg-surfaceHover/30 text-textMuted hover:border-textMuted/50'}`}
                                                >
                                                    {opt}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="mt-10 flex items-center justify-between">
                        <div className="flex gap-1.5">
                            {[1].map(i => (
                                <div key={i} className={`h-1 rounded-full ${step >= i ? 'w-8 bg-accent' : 'w-4 bg-border'}`} />
                            ))}
                        </div>
                        <button
                            onClick={handleComplete}
                            disabled={loading || Object.keys(data).length < config.questions.length}
                            className="btn-gold px-8 py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Salvataggio...' : 'Completa →'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

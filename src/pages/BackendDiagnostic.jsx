import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';

const TABLES = ['profiles', 'bookings', 'activities', 'properties'];

export default function BackendDiagnostic() {
    const [status, setStatus] = useState({
        connection: 'testing',
        tables: {},
        env: {
            url: import.meta.env.VITE_SUPABASE_URL ? '✅ Presente' : '❌ Mancante',
            key: import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Presente' : '❌ Mancante',
        },
        error: null
    });

    useEffect(() => {
        async function runDiagnostic() {
            try {
                // 1. Test Connection
                const { data: connData, error: connError } = await supabase.from('profiles').select('id').limit(1);

                const newStatus = { ...status };

                if (connError) {
                    newStatus.connection = 'failed';
                    newStatus.error = connError.message;
                } else {
                    newStatus.connection = 'success';
                }

                // 2. Test Tables
                for (const table of TABLES) {
                    const { error } = await supabase.from(table).select('count', { count: 'exact', head: true });
                    newStatus.tables[table] = error ? `❌ Error: ${error.message}` : '✅ OK';
                }

                setStatus(newStatus);
            } catch (err) {
                setStatus(prev => ({ ...prev, connection: 'failed', error: err.toString() }));
            }
        }
        runDiagnostic();
    }, []);

    const cardStyle = {
        background: 'var(--surface)',
        border: '1px solid var(--border-light)',
        padding: '24px',
        borderRadius: '12px',
        marginBottom: '20px'
    };

    return (
        <div style={{ padding: '100px 24px', maxWidth: '800px', margin: '0 auto', color: 'var(--text-primary)' }}>
            <Link to="/" style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: '14px', marginBottom: '20px', display: 'inline-block' }}>
                ← Torna alla Home
            </Link>

            <h1 style={{ fontFamily: 'serif', marginBottom: '32px' }}>Backend Diagnostic Tool</h1>

            {/* Connection State */}
            <div style={cardStyle}>
                <h3 style={{ marginTop: 0, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>Status Connessione</h3>
                <div style={{ fontSize: '24px', fontWeight: 'bold', borderLeft: `4px solid ${status.connection === 'success' ? '#4ade80' : status.connection === 'failed' ? '#f87171' : 'var(--accent)'}`, paddingLeft: '16px', margin: '16px 0' }}>
                    {status.connection.toUpperCase()}
                </div>
                {status.error && <pre style={{ background: 'rgba(248,113,113,0.1)', padding: '12px', borderRadius: '4px', fontSize: '12px', color: '#f87171', overflow: 'auto' }}>{status.error}</pre>}
            </div>

            {/* Env Variables */}
            <div style={cardStyle}>
                <h3 style={{ marginTop: 0, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>Variabili d'Ambiente</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                    <div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>SUPABASE_URL</div>
                        <div style={{ fontWeight: 500 }}>{status.env.url}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>SUPABASE_ANON_KEY</div>
                        <div style={{ fontWeight: 500 }}>{status.env.key}</div>
                    </div>
                </div>
            </div>

            {/* Database Tables */}
            <div style={cardStyle}>
                <h3 style={{ marginTop: 0, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>Verifica Tabelle Database</h3>
                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {TABLES.map(table => (
                        <div key={table} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                            <span style={{ fontFamily: 'monospace' }}>{table}</span>
                            <span>{status.tables[table] || 'In attesa...'}</span>
                        </div>
                    ))}
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '16px' }}>
                    Nota: Gli errori potrebbero essere dovuti a tabelle mancanti o politiche RLS restrittive.
                </p>
            </div>

            <button
                onClick={() => window.location.reload()}
                className="btn-gold"
                style={{ width: '100%', padding: '16px' }}
            >
                Riesegui Diagnostica
            </button>
        </div>
    );
}

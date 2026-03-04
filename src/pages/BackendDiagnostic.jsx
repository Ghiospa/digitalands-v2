import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';

const TABLES = ['profiles', 'bookings', 'activities', 'properties', 'reviews'];

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

                // 3. Test API Health
                try {
                    const apiRes = await fetch('/api/health');
                    if (apiRes.ok) {
                        const apiData = await apiRes.json();
                        newStatus.api = { status: '✅ OK', detail: apiData };
                    } else {
                        const text = await apiRes.text();
                        newStatus.api = { status: '❌ Fallito', detail: `Status ${apiRes.status}: ${text.slice(0, 100)}` };
                    }
                } catch (apiErr) {
                    newStatus.api = { status: '❌ Errore Network', detail: apiErr.message };
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
            </div>

            {/* API Health */}
            <div style={cardStyle}>
                <h3 style={{ marginTop: 0, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>Vercel API Health</h3>
                <div style={{ marginTop: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span>Status:</span>
                        <span style={{ fontWeight: 600 }}>{status.api?.status || 'In attesa...'}</span>
                    </div>
                    {status.api?.detail && (
                        <pre style={{
                            background: 'rgba(0,0,0,0.2)',
                            padding: '12px',
                            borderRadius: '8px',
                            fontSize: '11px',
                            fontFamily: 'monospace',
                            color: 'var(--text-muted)',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-all'
                        }}>
                            {typeof status.api.detail === 'string' ? status.api.detail : JSON.stringify(status.api.detail, null, 2)}
                        </pre>
                    )}
                </div>
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

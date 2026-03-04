import { supabaseAdmin } from './_lib/supabase-admin.js';

/**
 * Health check endpoint — use this to verify that:
 * 1. The serverless function is running
 * 2. Environment variables are set (not their values)
 * 3. Supabase connection is working
 *
 * GET /api/health
 */
export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const checks = {
        runtime: 'ok',
        env: {
            SUPABASE_URL: !!process.env.SUPABASE_URL,
            SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
            STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
            STRIPE_WEBHOOK_SECRET: !!process.env.STRIPE_WEBHOOK_SECRET,
            VITE_SITE_URL: !!process.env.VITE_SITE_URL,
        },
        supabase: null,
    };

    // Test Supabase connectivity with a lightweight query
    try {
        const { error } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .limit(1);

        checks.supabase = error ? `error: ${error.message}` : 'connected';
    } catch (err) {
        checks.supabase = `exception: ${err.message}`;
    }

    const allEnvSet = Object.values(checks.env).every(Boolean);
    const healthy = allEnvSet && checks.supabase === 'connected';

    return res.status(healthy ? 200 : 503).json({
        status: healthy ? 'healthy' : 'degraded',
        ...checks,
        timestamp: new Date().toISOString(),
    });
}

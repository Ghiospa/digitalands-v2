/**
 * Stream-based body parser for Vercel Serverless Functions (non-Next.js).
 * req.body is NOT automatically parsed in plain Vercel Node.js functions.
 */

export async function readRawBody(req) {
    // If body was already buffered (e.g. some runtimes/proxies), use it
    if (req.body !== undefined && req.body !== null) {
        if (Buffer.isBuffer(req.body)) return req.body;
        if (typeof req.body === 'string') return Buffer.from(req.body, 'utf8');
        // Object (pre-parsed JSON) — re-serialize (risky for webhook sig, fine for others)
        return Buffer.from(JSON.stringify(req.body), 'utf8');
    }
    const chunks = [];
    for await (const chunk of req) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks);
}

export async function parseBody(req) {
    const buf = await readRawBody(req);
    const text = buf.toString('utf8');
    if (!text) return {};
    try {
        return JSON.parse(text);
    } catch {
        return {};
    }
}

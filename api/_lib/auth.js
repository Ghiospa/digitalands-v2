import { supabaseAdmin } from './supabase-admin.js';

export async function getAuthUser(req) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return null;

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error) return null;
    return user;
}

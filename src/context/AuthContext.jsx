import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                fetchProfile(session.user);
            } else {
                setLoading(false);
            }
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
                fetchProfile(session.user);
            } else {
                setUser(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    async function fetchProfile(authUser) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .single();

        if (!error && data) {
            setUser({ ...authUser, ...data, avatar: data.name?.charAt(0).toUpperCase() });
        } else {
            setUser(authUser);
        }
        setLoading(false);
    }

    async function register({ name, email, password, role = 'guest' }) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { name, role }
            }
        });

        if (error) return { error: error.message };

        if (data.user) {
            // Profile is usually created via trigger in Supabase, 
            // but we can also do it manually here if trigger isn't set.
            const { error: profileError } = await supabase
                .from('profiles')
                .insert([{ id: data.user.id, name, role }]);

            if (profileError) console.error('Error creating profile:', profileError);
        }

        return { success: true };
    }

    async function login({ email, password }) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) return { error: error.message };
        return { success: true };
    }

    async function logout() {
        await supabase.auth.signOut();
    }

    async function updateProfile({ name, role }) {
        if (!user) return;
        const { error } = await supabase
            .from('profiles')
            .update({ name, role, updated_at: new Date().toISOString() })
            .eq('id', user.id);

        if (!error) {
            setUser(prev => ({ ...prev, name, role }));
        }
        return { error };
    }

    return (
        <AuthContext.Provider value={{ user, register, login, logout, updateProfile, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
}

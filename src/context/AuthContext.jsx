import { createContext, useContext, useState, useEffect, useMemo } from 'react';
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
                setLoading(true); // Ensure loading is true while fetching profile
                fetchProfile(session.user);
            } else {
                setUser(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    async function fetchProfile(authUser) {
        console.log('Fetching profile for user:', authUser.id);
        const { data, error } = await supabase
            .from('profiles')
            .select('id, name, role, employment_type, profession, vat_number, company_name, company_role, stats_metadata, onboarded')
            .eq('id', authUser.id)
            .single();

        if (error) {
            console.error('Error fetching profile from Supabase:', error);
        }

        if (!error && data) {
            setUser({ ...authUser, ...data, avatar: data.name?.charAt(0).toUpperCase(), stats_metadata: data.stats_metadata || {} });
        } else {
            setUser(authUser);
        }
        setLoading(false);
    }

    async function register({ name, email, password, role = 'guest', ...profileData }) {
        const redirectTo = import.meta.env.VITE_SITE_URL || window.location.origin;

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name,
                    role,
                    employment_type: profileData.employment_type,
                    profession: profileData.profession,
                    vat_number: profileData.vat_number,
                    company_name: profileData.company_name,
                    company_role: profileData.company_role
                },
                emailRedirectTo: redirectTo
            }
        });

        if (error) {
            console.error('Auth registration error:', error);
            return { error: error.message };
        }

        console.log('Auth registration successful for:', data.user?.id);
        return { success: true };
    }

    async function login({ email, password }) {
        console.log('Attempting login for:', email);
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.error('Login error:', error);
            return { error: error.message };
        }

        console.log('Login successful for:', email);
        return { success: true };
    }

    async function logout() {
        await supabase.auth.signOut();
    }

    async function updateProfile(profileData) {
        if (!user) return;
        const { error } = await supabase
            .from('profiles')
            .update({ ...profileData, updated_at: new Date().toISOString() })
            .eq('id', user.id);

        if (!error) {
            setUser(prev => ({ ...prev, ...profileData }));
        }
        return { error };
    }

    const value = useMemo(() => ({
        user,
        register,
        login,
        logout,
        updateProfile,
        loading
    }), [user, loading]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
}

import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try {
            const stored = localStorage.getItem('digitalands_user');
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    });

    useEffect(() => {
        if (user) {
            localStorage.setItem('digitalands_user', JSON.stringify(user));
        } else {
            localStorage.removeItem('digitalands_user');
        }
    }, [user]);

    function register({ name, email, password, role = 'guest' }) {
        const users = JSON.parse(localStorage.getItem('digitalands_users') || '[]');
        if (users.find(u => u.email === email)) {
            return { error: 'Email già registrata. Prova ad accedere.' };
        }
        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            role,
            createdAt: new Date().toISOString(),
            avatar: name.charAt(0).toUpperCase(),
        };
        users.push({ ...newUser, password });
        localStorage.setItem('digitalands_users', JSON.stringify(users));
        setUser(newUser);
        return { success: true };
    }

    function login({ email, password }) {
        const users = JSON.parse(localStorage.getItem('digitalands_users') || '[]');
        const match = users.find(u => u.email === email && u.password === password);
        if (!match) {
            return { error: 'Email o password non corretti.' };
        }
        const { password: _pw, ...safeUser } = match;
        setUser(safeUser);
        return { success: true };
    }

    function logout() {
        setUser(null);
    }

    function updateProfile({ name, email, role }) {
        setUser(prev => ({ ...prev, name, email, ...(role ? { role } : {}) }));
        const users = JSON.parse(localStorage.getItem('digitalands_users') || '[]');
        const idx = users.findIndex(u => u.id === user.id);
        if (idx !== -1) {
            users[idx] = { ...users[idx], name, email, ...(role ? { role } : {}) };
            localStorage.setItem('digitalands_users', JSON.stringify(users));
        }
    }

    return (
        <AuthContext.Provider value={{ user, register, login, logout, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
}

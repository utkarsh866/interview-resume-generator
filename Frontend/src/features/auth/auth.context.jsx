import { createContext, useState, useEffect, useCallback } from "react";
import { getMe, login, register, logout } from "./services/auth.api.js";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const checkAuth = async () => {
            try {
                const data = await getMe();
                if (isMounted) {
                    setUser(data?.user ?? null);
                }
            } catch {
                if (isMounted) {
                    setUser(null);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        checkAuth();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleLogin = useCallback(async ({ email, password }) => {
        setLoading(true);
        try {
            const data = await login({ email, password });
            if (data?.user) {
                setUser(data.user);
            }
            return data;
        } finally {
            setLoading(false);
        }
    }, []);

    const handleRegister = useCallback(async ({ username, email, password }) => {
        setLoading(true);
        try {
            const data = await register({ username, email, password });
            if (data?.user) {
                setUser(data.user);
            }
            return data;
        } finally {
            setLoading(false);
        }
    }, []);

    const handleLogout = useCallback(async () => {
        setLoading(true);
        try {
            const data = await logout();
            setUser(null);
            return data;
        } finally {
            setLoading(false);
        }
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
                loading,
                setLoading,
                handleLogin,
                handleRegister,
                handleLogout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

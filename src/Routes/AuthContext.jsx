import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { setUnauthorizedHandler } from '../API/axiosInstance';

const AuthContext = createContext(undefined);

/** Angular LoginAuthenticationService. */
export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();

    // protectRoute(): give access to routes if a token is available (survives page refresh)
    const [isLoginAuthenticated, setLoginAuthenticated] = useState(sessionStorage.getItem('LOGIN_TOKEN') != null);

    // activatesidemenu()
    const activateSideMenu = useCallback(() => {
        setLoginAuthenticated(true);
    }, []);

    // Adminlogout()
    const adminLogout = useCallback(() => {
        setLoginAuthenticated(false);
        sessionStorage.removeItem('LOGIN_TOKEN');
        sessionStorage.removeItem('PAGE_RELOADED');
        localStorage.clear();
        sessionStorage.clear();
        navigate('/');
    }, [navigate]);

    // 401 from any API call -> same logout as the Logout button (Angular TokenInterceptorService)
    useEffect(() => {
        setUnauthorizedHandler(adminLogout);
        return () => setUnauthorizedHandler(null);
    }, [adminLogout]);

    return (
        <AuthContext.Provider value={{ isLoginAuthenticated, setLoginAuthenticated, activateSideMenu, adminLogout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

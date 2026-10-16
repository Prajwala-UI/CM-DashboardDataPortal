// LoaderContext.js (reference pattern - ref-counted global loader)
import React, { createContext, useContext, useRef, useState } from 'react';

const LoaderContext = createContext();

export const LoaderProvider = ({ children }) => {
    const [loading, setLoading] = useState(false);
    const loadingCountRef = useRef(0);

    const start_loader = React.useCallback(() => {
        loadingCountRef.current += 1;
        if (loadingCountRef.current === 1) {
            setLoading(true);
        }
    }, []);

    const stop_loader = React.useCallback(() => {
        loadingCountRef.current = Math.max(0, loadingCountRef.current - 1);
        if (loadingCountRef.current === 0) {
            setLoading(false);
        }
    }, []);

    return (
        <LoaderContext.Provider value={{ loading, start_loader, stop_loader }}>
            {children}
        </LoaderContext.Provider>
    );
};

export const useLoader = () => useContext(LoaderContext);

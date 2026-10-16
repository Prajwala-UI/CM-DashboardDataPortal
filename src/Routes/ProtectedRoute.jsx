import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

/**
 * Angular adminGuardGuard: allows the route when the user is flagged as logged in AND a
 * LOGIN_TOKEN exists. No role check (same as Angular). Otherwise alert, go to login.
 */
const ProtectedRoute = ({ element }) => {
    const { isLoginAuthenticated, setLoginAuthenticated } = useAuth();
    const navigate = useNavigate();
    const alerted = useRef(false);

    const token = sessionStorage.getItem('LOGIN_TOKEN');
    const allowed = isLoginAuthenticated && token != null;

    useEffect(() => {
        if (!allowed && !alerted.current) {
            alerted.current = true;
            alert('Please Login');
            navigate('/', { replace: true });
            setLoginAuthenticated(false);
        }
    }, [allowed, navigate, setLoginAuthenticated]);

    return allowed ? element : null;
};

export default ProtectedRoute;

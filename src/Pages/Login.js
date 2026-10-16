import React, { useEffect, useRef } from 'react';
import { useAuth } from '../Routes/AuthContext';
import { useLoginLogic } from '../Hooks/useLoginLogic';
import LoginForm from '../Components/Login/LoginForm';
import ResetPasswordForm from '../Components/Login/ResetPasswordForm';
import '../Styles/Login.css';

/** Angular LoginComponent (route ''). */
const Login = () => {
    const { activateSideMenu } = useAuth();
    const login = useLoginLogic(activateSideMenu);
    const { s, closeDropdowns } = login;
    const rootRef = useRef(null);

    // close any open custom dropdown when clicking outside this component (Angular @HostListener)
    useEffect(() => {
        const onDocumentClick = (event) => {
            if (rootRef.current && !rootRef.current.contains(event.target)) {
                closeDropdowns();
            }
        };
        document.addEventListener('click', onDocumentClick);
        return () => document.removeEventListener('click', onDocumentClick);
    }, [closeDropdowns]);

    return (
        <div className="page-login" ref={rootRef}>
            <div className="cmd-page">

                {/* ===== Header ===== */}
                <div className="cmd-header">
                    <img src={`${import.meta.env.BASE_URL}assets/images/cmvv4-removebg-preview.png`} className="top_nav_img" alt="" />
                    <div className="cmd-eyebrow">Government of Karnataka</div>
                    <h1 className="cmd-title">CM dashboard Data Portal</h1>
                </div>

                {/* ===== Card ===== */}
                <div className="cmd-card">
                    {s.view === 'login' && <LoginForm login={login} />}
                    {s.view === 'reset' && <ResetPasswordForm login={login} />}
                </div>

                <p className="cmd-footer">Designed &amp; Developed by - Centre for e-Governance, Government of karnataka</p>

            </div>
        </div>
    );
};

export default Login;

import React from 'react';
import DeptDesignationFields from './DeptDesignationFields';

const onEnter = (fn) => (e) => { if (e.key === 'Enter') fn(); };

/** VIEW: LOGIN (login.component.html) */
const LoginForm = ({ login }) => {
    const { s, set, verifyDefaultPassword, sendOtp, verifyOtp, registerAndLogin, loginExisting, openResetPassword, showpwd } = login;

    return (
        <>
            <h2 className="cmd-card-title">Department Login</h2>
            <p className="cmd-card-subtitle">Enter service data for your department's schemes and missions.</p>

            {/* Angular's NgForm suppressed native submission - same here */}
            <form id="cmd-login" onSubmit={(e) => e.preventDefault()}>

                <DeptDesignationFields login={login} />

                {/* ============ NEW USER FLOW ============ */}
                {s.isNewUser === true && (
                    <>
                        {!s.defaultPasswordVerified && (
                            <div className="cmd-field">
                                <label className="cmd-label">Enter default password</label>
                                <div className="cmd-inline-field">
                                    <input type={s.password_type} className="cmd-input" placeholder="Default password"
                                        name="defaultPassword" value={s.defaultPassword}
                                        onChange={(e) => set({ defaultPassword: e.target.value })}
                                        onKeyUp={onEnter(verifyDefaultPassword)} />
                                    <button type="button" className="cmd-link-btn" onClick={verifyDefaultPassword} disabled={s.defaultPasswordChecking}>
                                        {s.defaultPasswordChecking ? 'Checking...' : 'Verify'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {s.defaultPasswordVerified && (
                            <>
                                <div className="cmd-field">
                                    <label className="cmd-label">Enter Mobile</label>
                                    <div className="cmd-inline-field">
                                        <input type="tel" maxLength={10} className="cmd-input" placeholder="10-digit mobile number"
                                            name="mobile" value={s.mobile} disabled={s.otpSent}
                                            onChange={(e) => set({ mobile: e.target.value })} />
                                        <button type="button" className="cmd-link-btn" onClick={sendOtp} disabled={s.otpSent || s.otpSending}>
                                            {s.otpSending ? 'Sending...' : 'Verify with OTP'}
                                        </button>
                                    </div>
                                </div>

                                {s.otpSent && !s.otpVerified && (
                                    <div className="cmd-field">
                                        <label className="cmd-label">OTP</label>
                                        <div className="cmd-inline-field">
                                            <input type="text" className="cmd-input" placeholder="Sent to your registered mobile" name="otp"
                                                value={s.otp} onChange={(e) => set({ otp: e.target.value })} />
                                            <button type="button" className="cmd-link-btn" onClick={verifyOtp} disabled={s.otpVerifying}>
                                                {s.otpVerifying ? 'Verifying...' : 'Verify'}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {s.otpVerified && (
                                    <>
                                        <div className="cmd-field">
                                            <label className="cmd-label">Enter Password</label>
                                            <div className="cmd-password-wrap">
                                                <input type={s.password_type} className="cmd-input" placeholder="Create a password" name="password"
                                                    value={s.password} onChange={(e) => set({ password: e.target.value })} />
                                                <button type="button" className="cmd-eye-btn" onClick={showpwd}>{s.showPassword ? 'Hide' : 'Show'}</button>
                                            </div>
                                        </div>

                                        <div className="cmd-field">
                                            <label className="cmd-label">Enter Confirm password</label>
                                            <input type={s.password_type} className="cmd-input" placeholder="Re-enter password" name="confirmPassword"
                                                value={s.confirmPassword} onChange={(e) => set({ confirmPassword: e.target.value })} />
                                        </div>
                                    </>
                                )}

                                <button type="button" className="cmd-login-btn" onClick={registerAndLogin}>
                                    {s.loader ? 'Please wait...' : 'Register & Log In'}
                                </button>
                            </>
                        )}
                    </>
                )}

                {/* ============ RETURNING USER FLOW ============ */}
                {s.isNewUser === false && (
                    <>
                        <div className="cmd-field">
                            <label className="cmd-label">Password</label>
                            <div className="cmd-password-wrap">
                                <input type={s.password_type} className="cmd-input" placeholder="Enter your password"
                                    name="password" value={s.password}
                                    onChange={(e) => set({ password: e.target.value })}
                                    onKeyUp={onEnter(loginExisting)} />
                                <button type="button" className="cmd-eye-btn" onClick={showpwd}>{s.showPassword ? 'Hide' : 'Show'}</button>
                            </div>
                        </div>

                        <button type="button" className="cmd-login-btn" disabled={s.loader} onClick={loginExisting}>
                            {s.loader ? 'Please wait...' : 'Log In'}
                        </button>

                        <div className="cmd-forgot-link">
                            <a onClick={openResetPassword}>Reset Password?</a>
                        </div>
                    </>
                )}

                {/* default state before a designation is chosen */}
                {s.isNewUser === null && <button type="button" className="cmd-login-btn" disabled>Log In</button>}

                {s.isNewUser === null && (
                    <div className="cmd-forgot-link">
                        <a onClick={openResetPassword}>Reset Password?</a>
                    </div>
                )}

                {s.errorMsg && <div className="cmd-alert cmd-alert-error">{s.errorMsg}</div>}
                {s.infoMsg && !s.errorMsg && <div className="cmd-alert cmd-alert-info">{s.infoMsg}</div>}

            </form>
        </>
    );
};

export default LoginForm;

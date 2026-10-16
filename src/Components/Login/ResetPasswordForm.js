import React from 'react';
import DeptDesignationFields from './DeptDesignationFields';

/** VIEW: RESET PASSWORD (login.component.html) */
const ResetPasswordForm = ({ login }) => {
    const { s, set, sendResetOtp, verifyResetOtp, submitResetPassword, backToLogin, showpwd } = login;

    return (
        <>
            <h2 className="cmd-card-title">Reset Password</h2>
            <p className="cmd-card-subtitle">
                Verify your registered mobile number to set a new password for your account.
            </p>

            <form id="cmd-reset-password" onSubmit={(e) => e.preventDefault()}>

                <DeptDesignationFields login={login} searchSuffix="R" />

                {/* ============ Registered mobile + Send OTP (side-by-side) ============ */}
                {s.selectedPostCode && (
                    <div className="cmd-field">
                        <label className="cmd-label">Registered Mobile Number</label>
                        <div className="cmd-inline-field">
                            <input type="text" className="cmd-input" value={s.resetMobile}
                                placeholder="Fetching registered mobile number..." disabled readOnly />

                            {/* Send OTP sits right next to the mobile field */}
                            {s.resetMobile && !s.resetOtpVerified && (
                                <button type="button" className="cmd-link-btn" onClick={sendResetOtp} disabled={s.resetOtpSending}>
                                    {s.resetOtpSending ? 'Sending...' : (s.resetOtpSent ? 'Resend OTP' : 'Send OTP')}
                                </button>
                            )}
                        </div>

                        {s.resetMobileError && <div className="cmd-hint-error">{s.resetMobileError}</div>}
                    </div>
                )}

                {/* ============ OTP + Verify OTP (side-by-side) ============ */}
                {s.resetMobile && s.resetOtpSent && !s.resetOtpVerified && (
                    <div className="cmd-field">
                        <label className="cmd-label">OTP Verification</label>
                        <div className="cmd-inline-field">
                            <input type="text" className="cmd-input" placeholder="Enter OTP" name="resetOtp"
                                value={s.resetOtp} onChange={(e) => set({ resetOtp: e.target.value })} />

                            {/* Verify OTP sits right next to the OTP field */}
                            <button type="button" className="cmd-link-btn" onClick={verifyResetOtp} disabled={s.resetOtpVerifying}>
                                {s.resetOtpVerifying ? 'Verifying...' : 'Verify OTP'}
                            </button>
                        </div>
                    </div>
                )}

                {/* ============ New password (only after OTP verified) ============ */}
                {s.resetOtpVerified && (
                    <>
                        <div className="cmd-field">
                            <label className="cmd-label">New Password</label>
                            <div className="cmd-password-wrap">
                                <input type={s.password_type} className="cmd-input" placeholder="Enter new password"
                                    name="resetPassword" value={s.resetPassword} onChange={(e) => set({ resetPassword: e.target.value })} />
                                <button type="button" className="cmd-eye-btn" onClick={showpwd}>{s.showPassword ? 'Hide' : 'Show'}</button>
                            </div>
                        </div>

                        <div className="cmd-field">
                            <label className="cmd-label">Confirm New Password</label>
                            <div className="cmd-password-wrap">
                                <input type={s.password_type} className="cmd-input" placeholder="Re-enter new password"
                                    name="resetConfirmPassword" value={s.resetConfirmPassword} onChange={(e) => set({ resetConfirmPassword: e.target.value })} />
                            </div>
                        </div>

                        <button type="button" className="cmd-login-btn" disabled={s.resetLoader} onClick={submitResetPassword}>
                            {s.resetLoader ? 'Please wait...' : 'Reset Password'}
                        </button>
                    </>
                )}

                {/* Only ERROR messages in the reset view */}
                {s.resetErrorMsg && <div className="cmd-alert cmd-alert-error">{s.resetErrorMsg}</div>}

                <div className="cmd-back-link">
                    <a onClick={backToLogin}><i className="fa fa-long-arrow-left"></i> Back to Login</a>
                </div>

            </form>
        </>
    );
};

export default ResetPasswordForm;

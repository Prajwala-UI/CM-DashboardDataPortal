import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../Config/config';
import {
    cmdGenerateToken, cmdGetMainDepartments, cmdGetLineDepartments, cmdSetMobilePassword,
    cmdSendOtp, cmdVerifyOtp, cmdGetMobileNoByPostcode, cmdLogin
} from '../API/cmdService';
import { extractErrorMessage, devLog } from '../Utils/apiHelpers';

const isValidMobile = (value) => /^[6-9]\d{9}$/.test(String(value ?? '').trim());

const CREDENTIAL_FIELDS = {
    mobile: '', otp: '', password: '', confirmPassword: '',
    otpSent: false, otpVerified: false, otpSending: false, otpVerifying: false,
    defaultPassword: '', defaultPasswordVerified: false, defaultPasswordChecking: false,
    errorMsg: '', infoMsg: ''
};

const RESET_FIELDS = {
    resetMobile: '', resetMobileError: '', resetMobileFetching: false,
    resetOtp: '', resetOtpSent: false, resetOtpVerified: false, resetOtpSending: false, resetOtpVerifying: false,
    resetPassword: '', resetConfirmPassword: '', resetLoader: false, resetErrorMsg: ''
};

const INITIAL_STATE = {
    loader: false,
    departments: [], designations: [],
    departmentsLoading: true, designationsLoading: false,
    deptDropdownOpen: false, desigDropdownOpen: false, deptSearchTerm: '', desigSearchTerm: '',
    selectedLocationCode: '', selectedPostCode: '', selectedDepartment: null, selectedDesignation: null,
    // null = nothing picked yet, true = first-time user, false = returning user
    isNewUser: null,
    showPassword: false, password_type: 'password',
    view: 'login',
    ...CREDENTIAL_FIELDS,
    ...RESET_FIELDS
};

/**
 * Angular LoginComponent logic: bearer token + department/designation dropdowns,
 * new-user registration (default password, OTP, password), returning-user login and
 * the Reset Password view. Messages and API sequencing are kept exactly.
 */
export const useLoginLogic = (activateSideMenu) => {
    const navigate = useNavigate();
    const [s, setS] = useState(INITIAL_STATE);
    const set = useCallback((patch) => setS(prev => ({ ...prev, ...(typeof patch === 'function' ? patch(prev) : patch) })), []);

    // CM Dashboard API bearer token (obtained via api/Token)
    const tokenRef = useRef(null);

    /* ------------------------------------------------------------------
       Step 1: bearer token + department dropdown
       ------------------------------------------------------------------ */
    const loadDepartments = useCallback(async () => {
        try {
            const alldata = await cmdGetMainDepartments(tokenRef.current);
            set({ departments: alldata || [], departmentsLoading: false });
        } catch (err) {
            set({ departmentsLoading: false, errorMsg: extractErrorMessage(err, 'Could not load departments. Please refresh and try again.') });
        }
    }, [set]);

    const initCmdLogin = useCallback(async () => {
        set({ departmentsLoading: true, errorMsg: '' });
        try {
            const alldata = await cmdGenerateToken();
            tokenRef.current = alldata.access_token;
            sessionStorage.setItem('CMD_API_TOKEN', tokenRef.current);
            loadDepartments();
        } catch (err) {
            set({ departmentsLoading: false, errorMsg: extractErrorMessage(err, 'Unable to connect to the server. Please try again.') });
        }
    }, [set, loadDepartments]);

    useEffect(() => {
        // One-shot confirmation after a successful reset (see submitResetPassword -> reload)
        const flash = sessionStorage.getItem('RESET_SUCCESS_FLASH');
        if (flash) {
            sessionStorage.removeItem('RESET_SUCCESS_FLASH');
            set({ infoMsg: flash });
        }
        initCmdLogin();
    }, [initCmdLogin, set]);

    const closeDropdowns = useCallback(() => set({ deptDropdownOpen: false, desigDropdownOpen: false }), [set]);

    /* ------------------------------------------------------------------
       Department dropdown
       ------------------------------------------------------------------ */
    const filteredDepartments = (() => {
        const term = (s.deptSearchTerm || '').trim().toLowerCase();
        if (!term) return s.departments;
        return s.departments.filter(d => (d.location_Name || '').toLowerCase().includes(term));
    })();

    const toggleDeptDropdown = () => {
        if (s.departmentsLoading) return;
        const open = !s.deptDropdownOpen;
        set({ desigDropdownOpen: false, deptDropdownOpen: open, ...(open ? { deptSearchTerm: '' } : {}) });
    };

    const selectDepartment = async (dept) => {
        // onDepartmentChange(): resetDesignationState() + reload designations
        set({
            selectedLocationCode: dept.location_Code,
            selectedDepartment: dept,
            deptDropdownOpen: false,
            selectedPostCode: '', selectedDesignation: null, isNewUser: null,
            ...CREDENTIAL_FIELDS, ...RESET_FIELDS,
            designations: []
        });

        if (!dept.location_Code) return;

        set({ designationsLoading: true, errorMsg: '' });
        try {
            const alldata = await cmdGetLineDepartments(dept.location_Code, tokenRef.current);
            set({ designations: alldata || [], designationsLoading: false });
        } catch (err) {
            set({ designationsLoading: false, errorMsg: extractErrorMessage(err, 'Could not load designations for this department.') });
        }
    };

    /* ------------------------------------------------------------------
       Designation dropdown
       ------------------------------------------------------------------ */
    const filteredDesignations = (() => {
        const term = (s.desigSearchTerm || '').trim().toLowerCase();
        if (!term) return s.designations;
        return s.designations.filter(d => (d.designation_Name || '').toLowerCase().includes(term));
    })();

    const toggleDesigDropdown = () => {
        if (!s.selectedLocationCode || s.designationsLoading) return;
        const open = !s.desigDropdownOpen;
        set({ deptDropdownOpen: false, desigDropdownOpen: open, ...(open ? { desigSearchTerm: '' } : {}) });
    };

    // LOGIN view part of onDesignationChange()
    const applyLoginDesignation = (designation) => {
        if (!designation) {
            set({ ...CREDENTIAL_FIELDS, isNewUser: null });
            return;
        }
        const isNewUser = !isValidMobile(designation.mobile_No);
        set({ ...CREDENTIAL_FIELDS, selectedDesignation: designation, isNewUser, ...(!isNewUser ? { mobile: designation.mobile_No } : {}) });
    };

    // RESET view part of onDesignationChange()
    const fetchMobileForReset = async (postCode) => {
        set({
            resetMobile: '', resetMobileError: '', resetOtpSent: false, resetOtpVerified: false,
            resetOtp: '', resetPassword: '', resetConfirmPassword: '', resetErrorMsg: ''
        });

        if (!postCode) return;

        set({ resetMobileFetching: true });
        try {
            const res = await cmdGetMobileNoByPostcode(postCode, tokenRef.current);
            if (res && res.mobile_No) {
                set({ resetMobileFetching: false, resetMobile: String(res.mobile_No).trim(), resetErrorMsg: '' });
            } else {
                set({
                    resetMobileFetching: false, resetMobile: '',
                    resetMobileError: (res && res.message) ? res.message : 'No mobile number is registered for the selected designation.'
                });
            }
        } catch (err) {
            set({
                resetMobileFetching: false, resetMobile: '',
                resetMobileError: extractErrorMessage(err, 'Could not fetch the registered mobile number. Please try again.')
            });
        }
    };

    const selectDesignation = (d) => {
        set({ selectedPostCode: d.postCode, selectedDesignation: d, desigDropdownOpen: false });
        if (s.view === 'reset') {
            fetchMobileForReset(d.postCode);
            return;
        }
        applyLoginDesignation(s.designations.find(x => x.postCode === d.postCode) || null);
    };

    /* ==================================================================
       LOGIN view - default password gate, OTP, register/login
       ================================================================== */
    const verifyDefaultPassword = () => {
        set({ errorMsg: '', infoMsg: '' });

        if (!s.defaultPassword) {
            set({ errorMsg: 'Please enter the default password.' });
            return;
        }

        set({ defaultPasswordChecking: true });
        const entered = s.defaultPassword;

        setTimeout(() => {
            if (entered === config.ApiCredentials.credentials.defaultPassword) {
                set({ defaultPasswordChecking: false, defaultPasswordVerified: true, infoMsg: 'Default password verified. Please complete your registration.' });
            } else {
                set({ defaultPasswordChecking: false, errorMsg: 'Incorrect default password.' });
            }
        }, 300);
    };

    const doSendOtp = async (mobile) => {
        set({ infoMsg: 'OTP is sending...' });
        try {
            const res = await cmdSendOtp(mobile, '', tokenRef.current);
            if (res && res.status === '1') {
                set({ otpSending: false, otpSent: true, infoMsg: res.message || 'OTP sent to your mobile number.' });
            } else {
                set({ otpSending: false, infoMsg: '', errorMsg: (res && res.message) ? res.message : 'Could not send OTP. Please try again.' });
            }
        } catch (err) {
            set({ otpSending: false, infoMsg: '', errorMsg: extractErrorMessage(err, 'Could not send OTP. Please try again.') });
        }
    };

    const sendOtp = async () => {
        set({ errorMsg: '', infoMsg: '' });

        if (!isValidMobile(s.mobile)) {
            set({ errorMsg: 'Please enter a valid 10-digit mobile number.' });
            return;
        }
        if (!s.selectedDesignation) {
            set({ errorMsg: 'Please select your designation.' });
            return;
        }

        set({ otpSending: true, infoMsg: 'Registering your mobile number...' });

        // registerMobileBeforeOtp(): register the mobile (empty password) before sending the OTP
        const payload = { postCode: s.selectedDesignation.postCode, mobile_No: s.mobile, password: '' };
        try {
            await cmdSetMobilePassword(payload, tokenRef.current);
        } catch (err) {
            set({ otpSending: false, infoMsg: '', errorMsg: extractErrorMessage(err, 'Could not register your mobile number. Please try again.') });
            return;
        }
        doSendOtp(s.mobile);
    };

    const verifyOtp = async () => {
        set({ errorMsg: '', infoMsg: '' });

        if (!s.otp || s.otp.trim().length < 4) {
            set({ errorMsg: 'Please enter the OTP sent to your mobile.' });
            return;
        }

        set({ otpVerifying: true });
        try {
            const res = await cmdVerifyOtp(s.mobile, s.otp, tokenRef.current);
            if (res && res.status === 200) {
                set({ otpVerifying: false, otpVerified: true, infoMsg: res.message || 'Mobile number verified.' });
            } else {
                set({ otpVerifying: false, errorMsg: (res && res.message) ? res.message : 'Invalid OTP. Please try again.' });
            }
        } catch (err) {
            set({ otpVerifying: false, errorMsg: extractErrorMessage(err, 'Could not verify OTP. Please try again.') });
        }
    };

    /* ==================================================================
       Final login
       ================================================================== */
    const finalLogin = async (mobileNo, password) => {
        set({ loader: true, errorMsg: '' });

        const payload = { mobile_No: mobileNo, password: password };

        try {
            const res = await cmdLogin(payload, tokenRef.current);
            set({ loader: false });
            devLog('Login result', res);

            if (res && res.status === 200 && res.data) {
                const postCode = res.data.postCode || '';
                const role = (res.data.role || 'USER').toString().toUpperCase();

                sessionStorage.setItem('LOGIN_TOKEN', tokenRef.current);

                localStorage.setItem('POST_CODE', postCode);
                localStorage.setItem('DEPT_CODE', res.data.deptCode || '');
                localStorage.setItem('DEPT_NAME', res.data.deptName || '');
                localStorage.setItem('MOBILE_NO', res.data.mobile_No || '');
                localStorage.setItem('LOCATION_CODE', res.data.location_Code || '');
                localStorage.setItem('LOCATION_NAME', res.data.location_Name || '');
                localStorage.setItem('LINE_DEPT_CODE', res.data.line_Dept_Code || '');
                localStorage.setItem('DESIGNATION_NAME', res.data.designation_Name || '');
                localStorage.setItem('ROLE', role);
                localStorage.setItem('IS_NODAL_OFFICER', (res.data.isNodalOfficer ?? 'false').toString());
                localStorage.setItem('NODAL_OFFICER_NAME', res.data.nodalOfficerName || '');

                localStorage.setItem('REFERENCE_ID', postCode);

                activateSideMenu();

                navigate(role === 'NODAL' ? '/NodalDashboard' : '/home');
            } else {
                set({ errorMsg: res?.message || 'Login failed. Please check your password.' });
            }
        } catch (err) {
            set({ loader: false, errorMsg: extractErrorMessage(err, 'Login failed. Please check your password and try again.') });
        }
    };

    const registerAndLogin = async () => {
        set({ errorMsg: '' });

        if (!s.defaultPasswordVerified) {
            set({ errorMsg: 'Please verify the default password first.' });
            return;
        }
        if (!s.otpVerified) {
            set({ errorMsg: 'Please verify your mobile number with OTP first.' });
            return;
        }
        if (!s.password || s.password !== s.confirmPassword) {
            set({ errorMsg: 'Password and Confirm Password must match.' });
            return;
        }
        if (!s.selectedDesignation) {
            set({ errorMsg: 'Please select your designation.' });
            return;
        }

        set({ loader: true });

        const payload = { postCode: s.selectedDesignation.postCode, mobile_No: s.mobile, password: s.password };
        try {
            await cmdSetMobilePassword(payload, tokenRef.current);
        } catch (err) {
            set({ loader: false, errorMsg: extractErrorMessage(err, 'Registration failed. Please try again.') });
            return;
        }
        finalLogin(s.mobile, s.password);
    };

    const loginExisting = () => {
        set({ errorMsg: '' });

        if (!s.password) {
            set({ errorMsg: 'Please enter your password.' });
            return;
        }
        if (!s.selectedDesignation || !s.selectedDesignation.mobile_No) {
            set({ errorMsg: 'Please select your designation.' });
            return;
        }

        finalLogin(s.selectedDesignation.mobile_No, s.password);
    };

    /* ==================================================================
       RESET PASSWORD view
       ================================================================== */
    const openResetPassword = () => {
        set({
            view: 'reset',
            errorMsg: '', infoMsg: '', password: '', confirmPassword: '', mobile: '', otp: '',
            otpSent: false, otpVerified: false, isNewUser: null,
            ...RESET_FIELDS
        });

        if (s.selectedPostCode) {
            fetchMobileForReset(s.selectedPostCode);
        }
    };

    const backToLogin = () => {
        set({ view: 'login', ...RESET_FIELDS });

        if (s.selectedPostCode) {
            applyLoginDesignation(s.designations.find(d => d.postCode === s.selectedPostCode) || null);
        }
    };

    const sendResetOtp = async () => {
        set({ resetErrorMsg: '' });

        if (!s.resetMobile) {
            set({ resetErrorMsg: 'No registered mobile number found. Please pick a different designation.' });
            return;
        }

        set({ resetOtpSending: true });
        try {
            const res = await cmdSendOtp(s.resetMobile, '', tokenRef.current);
            if (res && res.status === '1') {
                set({ resetOtpSending: false, resetOtpSent: true });
            } else {
                set({ resetOtpSending: false, resetErrorMsg: (res && res.message) ? res.message : 'Could not send OTP. Please try again.' });
            }
        } catch (err) {
            set({ resetOtpSending: false, resetErrorMsg: extractErrorMessage(err, 'Could not send OTP. Please try again.') });
        }
    };

    const verifyResetOtp = async () => {
        set({ resetErrorMsg: '' });

        if (!s.resetOtp || s.resetOtp.trim().length < 4) {
            set({ resetErrorMsg: 'Please enter the OTP sent to your mobile.' });
            return;
        }

        set({ resetOtpVerifying: true });
        try {
            const res = await cmdVerifyOtp(s.resetMobile, s.resetOtp, tokenRef.current);
            if (res && res.status === 200) {
                set({ resetOtpVerifying: false, resetOtpVerified: true });
            } else {
                set({ resetOtpVerifying: false, resetErrorMsg: (res && res.message) ? res.message : 'Invalid OTP. Please try again.' });
            }
        } catch (err) {
            set({ resetOtpVerifying: false, resetErrorMsg: extractErrorMessage(err, 'Could not verify OTP. Please try again.') });
        }
    };

    const submitResetPassword = async () => {
        set({ resetErrorMsg: '' });

        if (!s.resetOtpVerified) {
            set({ resetErrorMsg: 'Please verify your mobile number with OTP first.' });
            return;
        }
        if (!s.resetPassword) {
            set({ resetErrorMsg: 'Please enter a new password.' });
            return;
        }
        if (s.resetPassword !== s.resetConfirmPassword) {
            set({ resetErrorMsg: 'Password and Confirm Password must match.' });
            return;
        }
        if (!s.selectedPostCode || !s.resetMobile) {
            set({ resetErrorMsg: 'Missing postcode or mobile number. Please re-select your designation.' });
            return;
        }

        set({ resetLoader: true });

        const payload = { postCode: s.selectedPostCode, mobile_No: s.resetMobile, password: s.resetPassword };
        try {
            await cmdSetMobilePassword(payload, tokenRef.current);
            set({ resetLoader: false });
            // One-shot success message shown after the reload (see the mount effect)
            sessionStorage.setItem('RESET_SUCCESS_FLASH', 'Password reset successfully. Please log in with your new password.');
            window.location.reload();
        } catch (err) {
            set({ resetLoader: false, resetErrorMsg: extractErrorMessage(err, 'Could not reset the password. Please try again.') });
        }
    };

    /*------------------------------------------------------------------
       helpers
    -------------------------------------------------------------------*/
    const showpwd = () => set(prev => ({ showPassword: !prev.showPassword, password_type: !prev.showPassword ? 'text' : 'password' }));

    return {
        s, set,
        filteredDepartments, filteredDesignations,
        closeDropdowns, toggleDeptDropdown, selectDepartment, toggleDesigDropdown, selectDesignation,
        verifyDefaultPassword, sendOtp, verifyOtp, registerAndLogin, loginExisting,
        openResetPassword, backToLogin, sendResetOtp, verifyResetOtp, submitResetPassword,
        showpwd
    };
};

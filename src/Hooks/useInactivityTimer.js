import { useEffect } from 'react';
import config from '../Config/config';

/**
 * Angular InactivityService: after 30 minutes without mouse/keyboard/click/scroll activity,
 * remove the login token, show the same alert and reload the page.
 */
export const useInactivityTimer = () => {
  useEffect(() => {
    const inactivityTime = config.ApiCredentials.credentials.inactivityTimeMs;
    let timeout;

    const clearLocalStorage = () => {
      sessionStorage.removeItem('LOGIN_TOKEN');
      localStorage.removeItem('REFERENCE_ID');
      localStorage.removeItem('myemail_id');

      alert('No User Activity Found. Please again to continue');
      window.location.reload();
    };

    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(clearLocalStorage, inactivityTime);
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll'];
    events.forEach((evt) => document.addEventListener(evt, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(timeout);
      events.forEach((evt) => document.removeEventListener(evt, resetTimer));
    };
  }, []);
};

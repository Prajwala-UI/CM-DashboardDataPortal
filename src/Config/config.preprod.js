//config.preprod.js - Angular environment.preprod.ts
// PREPROD - the Angular source leaves both API base URLs empty ("TODO"), so calls go to the
// same origin as the app (/api/...). Set REACT_APP_KODI_API_BASE_URL / REACT_APP_KAAMS_API_BASE_URL
// in .env.preprod once the real URL is known.
import { apiEndpoints } from './apiEndPoints';

const ApiCredentials = {
    credentials: {
        BASE_URL: '/CM-DashboardDP/',
        kodiApiBaseUrl: process.env.REACT_APP_KODI_API_BASE_URL ?? '',
        kaamsApiBaseUrl: process.env.REACT_APP_KAAMS_API_BASE_URL ?? '',
        tokenUserName: process.env.REACT_APP_CMD_TOKEN_USERNAME || '',
        tokenPassword: process.env.REACT_APP_CMD_TOKEN_PASSWORD || '',
        defaultPassword: process.env.REACT_APP_DEFAULT_PASSWORD || '',
        inactivityTimeMs: 1800000,
        enableConsoleLogs: true
    },
    endpoints: apiEndpoints
};

export { ApiCredentials };

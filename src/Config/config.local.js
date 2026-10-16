//config.local.js - Angular environment.ts (ng serve)
import { apiEndpoints } from './apiEndPoints';

const DEFAULT_API = 'https://testapps.bbmpgov.in/CMDashboardAPI';

const ApiCredentials = {
    credentials: {
        BASE_URL: '/',
        // REACT_APP_*_API_BASE_URL overrides are optional (e.g. to point a local UI check at an unreachable host)
        kodiApiBaseUrl: process.env.REACT_APP_KODI_API_BASE_URL ?? DEFAULT_API,
        kaamsApiBaseUrl: process.env.REACT_APP_KAAMS_API_BASE_URL ?? DEFAULT_API,
        tokenUserName: process.env.REACT_APP_CMD_TOKEN_USERNAME || '',
        tokenPassword: process.env.REACT_APP_CMD_TOKEN_PASSWORD || '',
        defaultPassword: process.env.REACT_APP_DEFAULT_PASSWORD || '',
        inactivityTimeMs: 1800000,
        enableConsoleLogs: true
    },
    endpoints: apiEndpoints
};

export { ApiCredentials };

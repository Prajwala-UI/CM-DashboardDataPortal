//config.test.js - Angular environment.test.ts
import { apiEndpoints } from './apiEndPoints';

const DEFAULT_API = 'https://testapps.bbmpgov.in/CMDashboardAPI';

const ApiCredentials = {
    credentials: {
        BASE_URL: '/CM-DashboardDP/',
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

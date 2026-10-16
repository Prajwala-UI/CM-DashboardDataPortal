import axios from 'axios';

// No baseURL: like the Angular service, every call builds its full URL from the
// configured kodiApiBaseUrl / kaamsApiBaseUrl (see cmdService.js).
const axiosInstance = axios.create();

// Set by AuthProvider - the same Adminlogout() the Angular interceptor calls on 401.
let unauthorizedHandler = null;
export const setUnauthorizedHandler = (handler) => {
  unauthorizedHandler = handler;
};

// Angular TokenInterceptorService: adds this header (exact spelling and format) to every request,
// including the token call itself - the value is "bearer : null" before login.
axiosInstance.interceptors.request.use(
  (config) => {
    const local_LOGIN_TOKEN = sessionStorage.getItem('LOGIN_TOKEN');
    config.headers['Authorisation'] = 'bearer : ' + local_LOGIN_TOKEN;
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // The CM Dashboard session token was rejected by the backend (expired / invalid) -
    // log the user out the same way the manual "Logout" button does.
    if (error.response && error.response.status === 401 && unauthorizedHandler) {
      unauthorizedHandler();
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

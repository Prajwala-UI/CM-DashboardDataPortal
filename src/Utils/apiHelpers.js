import config from '../Config/config';

/** Angular extractErrorMessage(): err.error is the response body there - err.response.data with axios. */
export const extractErrorMessage = (err, fallback) => {
  const body = err?.response?.data;
  if (body && typeof body === 'object' && body.message) {
    return body.message;
  }
  if (typeof body === 'string' && body.trim()) {
    return body;
  }
  return fallback;
};

/** Home screen check: status_code (number 200) or status ("success"). */
export const isSuccess = (res) =>
  String(res.status_code) === '200' || String(res.status).toLowerCase() === 'success';

/** Project detail / KPI / Nodal check - also accepts a bare {status: 200}. */
export const isOverviewSuccess = (res) =>
  String(res.status_code) === '200'
  || String(res.status).toLowerCase() === 'success'
  || String(res.status) === '200';

/** Request/response logging kept from the Angular source, switched off in prod (R11). */
export const devLog = (...args) => {
  if (config.ApiCredentials.credentials.enableConsoleLogs) {
    console.log(...args);
  }
};

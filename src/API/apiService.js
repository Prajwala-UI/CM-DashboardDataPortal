import axiosInstance from './axiosInstance';

// Thin verb wrappers (reference pattern). Headers are passed explicitly per call
// because the Angular service sets them per method.
const apiService = {
  // POST request method
  postRequest: async (url, data, headers = {}) => {
    const response = await axiosInstance.post(url, data, { headers });
    return response.data;
  },

  // GET request method
  getRequest: async (url, headers = {}) => {
    // axios removes Content-Type when there is no body; Angular sends the header it was given on GET,
    // so an empty body is passed to keep it (browsers do not send a body with GET).
    const response = await axiosInstance.get(url, { headers, data: {} });
    return response.data;
  },

  // POST multipart/form-data - Content-Type is left to the browser so it can add the boundary
  postMultipart: async (url, formData, headers = {}) => {
    const response = await axiosInstance.post(url, formData, { headers });
    return response.data;
  },
};

export default apiService;

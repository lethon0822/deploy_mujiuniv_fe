// httpRequester.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: '/api',
  withCredentials: true,
  timeout: 10000,
});

let isRefreshing = false;
axiosInstance.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401 && !isRefreshing) {
      isRefreshing = true;
      // location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default axiosInstance;  
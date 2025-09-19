// httpRequester.js
import axios from 'axios';

console.log('vite_base_url:', import.meta.env.VITE_BASE_URL);

axios.defaults.baseURL = `${import.meta.env.VITE_BASE_URL}/api/`;
axios.defaults.withCredentials = true;

export default axios;  
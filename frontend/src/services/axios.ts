import axios from 'axios';
import { getCookie } from 'cookies-next';

const api = axios.create({
    timeout: 5000,
});

api.interceptors.request.use(
    (config) => {
        const token = getCookie('jwt');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


export default api;

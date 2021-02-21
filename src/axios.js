import { app } from 'electron';
import axios from 'axios';

let config = {
  baseURL: process.env.VUE_APP_URL,
  timeout: 60 * 1000, // Timeout
};
  
const _axios = axios.create(config);

_axios.interceptors.request.use(
  function(config) {
    config.headers['X-Client-Version'] = app.getVersion();
    return config;
  }
);

export default _axios;

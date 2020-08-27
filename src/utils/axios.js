import axios from 'axios';

function createAxiosAuthMiddleware() {
  return () => (next) => (action) => {
    axios.defaults.baseURL = window.REACT_APP_API_URL;
    return next(action);
  };
}

const axiosAuth = createAxiosAuthMiddleware();

export default axiosAuth;

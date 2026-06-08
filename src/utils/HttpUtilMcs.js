import axios from 'axios';

// MCS专用HTTP工具，用于调用AGV调度系统接口
const HttpUtilMcs = axios.create({
  baseURL: process.env.VUE_APP_MCS_BASE_URL,
  timeout: 10000
});

// 响应拦截器
HttpUtilMcs.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default HttpUtilMcs;

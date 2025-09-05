// httpRequester.js
import axios from 'axios';

const instance = axios.create({
  baseURL: '/api',         // vite 프록시 쓸 거면 이거 그대로 OK
  withCredentials: true,   // ★ 쿠키 포함해서 보내기
  timeout: 10000,
});

// 401 반복 호출 방지용(선택)
let isRefreshing = false;
instance.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401 && !isRefreshing) {
      isRefreshing = true;
      // 여기서 상태 갱신/리다이렉트 등
      // location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default instance;

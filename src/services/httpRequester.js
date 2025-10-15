// httpRequester.js
import axios from 'axios';
import {logout} from './accountService';
console.log('vite_base_url:', import.meta.env.VITE_BASE_URL);
axios.defaults.baseURL = `${import.meta.env.VITE_BASE_URL}/api/`;
axios.defaults.withCredentials = true;
//401 반복 호출 방지용(선택)
// axios.interceptors.response.use(
//   (res) => {
//     return res;
//   },
//   async (err) => {
//     console.log('err: ', err);
//     if (err.response) {
//       console.log('err.response : ', err.response);
//       const authenticationStore = useAuthenticationStore();
//       if(err.config.url === '/user/reissue' && err.response.status === 500) {
//         authenticationStore.signOut();
//       } else if (err.response.status === 401 && authenticationStore.state.isSigned) {
//         //401 UnAuthorized 에러인데 FE 로그인 처리 되어 있다면       
//         await logout(); //만료시 로그아웃
//         // 중단된 요청을(에러난 요청)을 토큰 갱신 후 재요청       
//       } else {
//         const message = err.response.data?.message ? err.response.data?.message : err.response.data;
//         const messageModalStore = useMessageModalStore();
//         messageModalStore.setMessage(message);
//       }
//     }
//     return Promise.reject(err);
//   }
// );
export default axios;

// 요청 인터셉터 추가
axios.interceptors.request.use((config) => {
    const token = localStorage.getItem("access-token");
  
    // 로그인 없이 접근 가능한 엔드포인트
    const publicEndpoints = [
      "/account/login",
      "/account/id",          // 아이디 찾기
      "/account/sign-up",     // 회원가입
      "/account/reissue",     // 토큰 재발급
      "/auth/email/send",     // 이메일 인증 코드 발송
      "/auth/email/verify",   // 이메일 코드 검증
    ];
  
    // 요청 URL이 공개 엔드포인트가 아니면 JWT 붙이기
    const isPublic = publicEndpoints.some((path) => config.url.includes(path));
  
    if (!isPublic && token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization; // 공개 엔드포인트면 헤더 제거
    }
  
    return config;
  });
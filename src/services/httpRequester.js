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
import axios from './httpRequester';

// 로그인
export const login = (args) => {
  return axios.post('/account/login', args).catch((e) => e.response);
};

// 로그인 상태 확인 (세션 체크)
export const check = () => {
  return axios.get('/account/check').catch((e) => e.response);
};

// 로그아웃
export const logout = () => {
  return axios.post('/account/logout').catch((e) => e.response);
};

// 아이디 찾기
export const findId = (params) => {
  return axios.get('/account/id', { params }).catch((e) => e.response);
};

// 우편번호로 주소 조회
export const getAddressByZipcode = async (zipcode) => {
  const res = await axios.get(`/zipcode?code=${zipcode}`);
  return res.data;
};

// 사용자 정보 업데이트
export const updateUser = async (userDto) => {
  const res = await axios.post('/user/update', userDto);
  return res.data;
};

// 인증코드 검증(기존 경로 유지 시)
export async function verifyAuthCode(code) {
  return await axios.post('/email/verify-code', { code });
}

// 비밀번호 변경(기존 경로 유지 시)
export async function changePasswordApi(userId, newPassword) {
  return await axios.post('/user/change-password', { userId, newPassword });
}

// 이메일 인증 코드 발송
export function sendEmailCode(email) {
  return axios.post('/auth/email/send', { email });
}

// 이메일 인증 코드 검증
export async function verifyEmailCode(email, code) {
  const { data } = await axios.post('/auth/email/verify', { email, code });
  return data; // { verifiedToken: '...' }
}

// 비밀번호 변경(이메일 검증 토큰 방식)
export function changePassword(newPassword, verifiedToken) {
  return axios.post('/auth/password/change', { newPassword, verifiedToken });
}
import axios from './httpRequester';

export const sendMail = (params) => {
  return axios.post('/account/auth', params).catch((e) => e.response);
};

export const checkMail = (params) => {
  return axios.get('/account/auth', params).catch((e) => e.response);
};

export const confirmCode = (params) => {
  return axios.post('/account/auth', params).catch((e) => e.response);
};

export const renewalPwd = (params) => {
  return axios.put('/account/renewal', params).catch((e) => e.response);
};

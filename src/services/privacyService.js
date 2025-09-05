import axios from './httpRequester';


export const getPrivacy = () => {
    return axios.get('/account/privacy').catch(e => e.response);
};

export const putPrivacy = (jsonBody) => {
  return axios.put('/account/privacy', jsonBody).catch(e => e.response);
};

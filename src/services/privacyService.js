import axios from './httpRequester';


export const getPrivacy = () => {
    return axios.get('/renewal/privacy').catch(e => e.response);
};

export const putPrivacy = (jsonBody) => {
  return axios.put('/renewal/privacy', jsonBody).catch(e => e.response);
};

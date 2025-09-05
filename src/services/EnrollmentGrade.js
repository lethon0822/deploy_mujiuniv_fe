import axios from './httpRequester';

export const enrollmentgrade = () => {
  return axios.put('/professor/course/grade', data).catch((e) => e.response);
};

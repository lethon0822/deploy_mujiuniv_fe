import axios from './httpRequester';

export const getList = (jsonBody) => {
  return axios.get('/staff/approval', jsonBody).catch((e) => e.response);
};

export const decicdeApp = (param) => {
  return axios.patch('/staff/approval', param).catch((e) => e.response);
};

export const createApplication = (payload) => {
  return axios.post('/application', payload).catch((e) => e.response); // { scheduleId, reason }
}

export const fetchMyApplications = (params) => {
  return axios.get('/application/me', {params}).catch((e) => e.response);
};

// ✅ 다음 학기 신청 (백엔드: POST /api/application/apply-next)
export const applyNextApplication = (payload) => {
  return axios.post('/application/apply-next', payload).catch((e) => e.response);
};

export const cancelApplication = (appId) => {
  return axios.patch(`/application/${appId}/cancel`).catch((e) => e.response);
};

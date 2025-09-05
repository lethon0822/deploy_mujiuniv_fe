import axios from "./httpRequester";

export const getList = (params) => {
  return axios.get("/api/staff/approval", { params }).catch((e) => e.response);
};

export const decicdeApp = (param) => {
    return axios.patch("/api/staff/approval", {param}).catch((e) => e.response);
}

export const createApplication = (payload) => {
  return axios.post('/applications', payload).catch((e) => e.response); // { scheduleId, reason }
}

export const fetchMyApplications = (params) => {
  return axios.get('/application/me', { params }).catch((e) => e.response);
}

export const cancelApplication = (appId) => {
  return axios.patch(`/application/${appId}/cancel`).catch((e) => e.response);
}
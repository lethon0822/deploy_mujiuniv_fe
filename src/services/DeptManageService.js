import axios from "./httpRequester";

//학과 들고오기
export const deptGet = (params) => {
  return axios.get("/dept", { params }).catch((e) => e.response);
};

//학과장 들고오기
export const deptGetHead = (id) => {
  return axios.get(`/dept/head?dept_id=${id}`, id).catch((e) => e.response);
};

// 학과 개설
export const deptPost = (jsonBody) => {
  return axios.post("/dept", jsonBody).catch((e) => e.response);
};

export const deptPut = (jsonBody) => {
  return axios.put("/dept", jsonBody).catch((e) => e.response);
};

export const deptPatch = (id) => {
  return axios.patch(`/dept?id=${id}`, id).catch((e) => e.response);
};

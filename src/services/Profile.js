import axios from "./httpRequester";

//

export const getUserProfile = () => {
  return axios.get("/user/profile").catch((e) => e.response);
};

export const uploadProfilePic = (params) => {
  return axios.post("/user/profile", params).catch((e) => e.response);
}
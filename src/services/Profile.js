import axios from "./httpRequester";

//

export const getUserProfile = () => {
  return axios.get("/user/profile").catch((e) => e.response);
};

export const patchProfilePic = (params) => {
  return axios.patch("/user/profile", params).catch((e) => e.response);
}

export const deleteProfilePic = () => {
  return axios.delete("/user/profile").catch((e) => e.response);
}
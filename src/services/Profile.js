import axios from "./httpRequester";

//

export const getUserProfile = () => {
  return axios.get("/user/profile").catch((e) => e.response);
};

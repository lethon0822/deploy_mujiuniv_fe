import axios from "./httpRequester";

//

export const getUserProfile = () => {
  return axios.get("/account/profile").catch((e) => e.response);
};

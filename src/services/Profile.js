import axios from "./httpRequester";

//

export const getUserProfile = () => {
  return axios.get("/mypage").catch((e) => e.response);
};

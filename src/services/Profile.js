import axios from "./httpRequester";

//

export const getUserProfile = () => {
  return axios.get("/user/profile").catch((e) => e.response);
};

export const uploadProfilePic = async (formData) => {
  return axios.post("/user/profile", formData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    },
  });
};
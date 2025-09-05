import axios from "./httpRequester";

export const attendance = () => {
    return axios.put('/professor/course/check', data).catch((e) => e.response);
}


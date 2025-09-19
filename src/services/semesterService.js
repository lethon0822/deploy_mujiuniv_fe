import axios from "./httpRequester";

export const getNextSemesterId = (currentSemesterId) =>
    axios.get(`/semester/${currentSemesterId}/next`)
         .then(r => r?.data?.semesterId ?? r?.data ?? null);


import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000", // آدرس backend
});
export default api;

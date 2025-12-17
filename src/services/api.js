import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api",
});

// Si hay token guardado, lo agregamos
const access = localStorage.getItem("access");
if (access) {
  api.defaults.headers.common["Authorization"] = "Bearer " + access;
}

export default api;

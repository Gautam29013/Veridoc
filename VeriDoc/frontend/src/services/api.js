import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
});

export const loginUser = (data) => API.post("/login", data);

export const uploadDocument = (formData) =>
  API.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const queryDocument = (data) => API.post("/query", data);

export default API;

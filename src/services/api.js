import axios from "axios";

const API = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://127.0.0.1:8000/api",

  headers: {
    Accept: "application/json",
  },
});

export const uploadReport = async (file) => {
  const formData = new FormData();

  formData.append("file", file);

  const response = await API.post(
    "/upload/",
    formData
  );

  return response.data;
};

export const getReportAnalysis = async (reportId) => {
  const response = await API.get(
    `/analysis/${reportId}`
  );

  return response.data;
};

export default API;
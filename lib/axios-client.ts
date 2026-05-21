import axios from "axios"
import { getAuthToken } from "./api"

const axiosClient = axios.create({
  // baseURL: "http://localhost:5000/api",
  baseURL: "https://vcrm-backend.onrender.com/api",
})
// https://renal-ease-backend-2.onrender.com
axiosClient.interceptors.request.use((config) => {
  const token = getAuthToken()
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default axiosClient

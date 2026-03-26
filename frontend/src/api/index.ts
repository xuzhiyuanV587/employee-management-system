import axios from 'axios'
import { ElMessage } from 'element-plus'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor: inject token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor: unwrap { code, data, message } envelope
api.interceptors.response.use(
  response => {
    const res = response.data
    // Backend wraps all responses in { code, data, message }
    if (res.code !== undefined) {
      if (res.code >= 200 && res.code < 300) {
        // Return unwrapped data
        response.data = res.data
        return response
      } else {
        // Business error
        const errMsg = res.message || '请求失败'
        ElMessage.error(errMsg)
        return Promise.reject(new Error(errMsg))
      }
    }
    return response
  },
  error => {
    const status = error.response?.status
    const msg = error.response?.data?.message || error.message || '网络错误'

    if (status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
      return Promise.reject(error)
    }

    ElMessage.error(msg)
    return Promise.reject(error)
  }
)

export default api

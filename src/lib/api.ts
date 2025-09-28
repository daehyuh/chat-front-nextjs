import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('email')
      localStorage.removeItem('role')
      window.location.href = '/login'
    } else if (error.response?.status === 400) {
      console.error('Bad Request:', error.response.data?.error || error.message)
    } else if (error.response?.status === 404) {
      console.error('Not Found:', error.response.data?.error || error.message)
    } else if (error.response?.status === 500) {
      console.error('Server Error:', error.response.data?.error || error.message)
    }
    return Promise.reject(error)
  }
)

export default api
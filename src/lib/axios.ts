import axios from 'axios'
import { useAuthStore } from '../store/authStore'

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://erp-backend-nxl1.onrender.com/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request interceptor: Attach token
api.interceptors.request.use(
    (config) => {
        if (config.data instanceof FormData && config.headers) {
            delete config.headers['Content-Type']
        }

        const { token, activeUnitId, user } = useAuthStore.getState()
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        const resolvedUnitId = activeUnitId || user?.unitId
        if (resolvedUnitId) {
            config.headers['x-unit-id'] = resolvedUnitId
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor: Handle global errors (401, etc.)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            useAuthStore.getState().logout()
            window.location.href = '/auth/login'
        }
        return Promise.reject(error)
    }
)

import api from './axios'
import { ApiResponse, AuthResponse, User } from '../types'

export const authApi = {
  register: (data: { name: string; email: string; password: string; phone?: string; role: string }) =>
    api.post<ApiResponse<AuthResponse>>('/auth/register', data).then(r => r.data.data),

  login: (data: { email: string; password: string }) =>
    api.post<ApiResponse<AuthResponse>>('/auth/login', data).then(r => r.data.data),

  me: () =>
    api.get<ApiResponse<User>>('/auth/me').then(r => r.data.data),

  verifyOtp: (data: { email: string; code: string }) =>
    api.post<ApiResponse<AuthResponse>>('/auth/verify-otp', data).then(r => r.data.data),

  resendOtp: (email: string) =>
    api.post<ApiResponse<any>>('/auth/resend-otp', { email }).then(r => r.data.data),
}

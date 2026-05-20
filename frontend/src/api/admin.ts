import api from './axios'
import { AdminStats, ApiResponse, Booking, Salon, User } from '../types'

export const adminApi = {
  getStats: () =>
    api.get<ApiResponse<AdminStats>>('/admin/stats').then(r => r.data.data),

  getSalons: (status?: string) =>
    api.get<ApiResponse<Salon[]>>('/admin/salons', { params: { status } }).then(r => r.data.data),

  approveSalon: (id: string) =>
    api.put<ApiResponse<Salon>>(`/admin/salons/${id}/approve`).then(r => r.data.data),

  rejectSalon: (id: string, reason: string) =>
    api.put<ApiResponse<Salon>>(`/admin/salons/${id}/reject`, { reason }).then(r => r.data.data),

  getUsers: () =>
    api.get<ApiResponse<User[]>>('/admin/users').then(r => r.data.data),

  getBookings: () =>
    api.get<ApiResponse<Booking[]>>('/admin/bookings').then(r => r.data.data),
}

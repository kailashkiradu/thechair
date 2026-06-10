import api from './axios'
import { ApiResponse, UserProfile, Salon } from '../types'

export const usersApi = {
  getProfile: () =>
    api.get<ApiResponse<UserProfile>>('/users/profile').then(r => r.data.data),

  updateProfile: (data: { name: string; phone?: string }) =>
    api.put<ApiResponse<UserProfile>>('/users/profile', data).then(r => r.data.data),

  addFavorite: (salonId: string) =>
    api.post<ApiResponse<void>>(`/users/favorites/${salonId}`).then(r => r.data.data),

  removeFavorite: (salonId: string) =>
    api.delete<ApiResponse<void>>(`/users/favorites/${salonId}`).then(r => r.data.data),

  getFavorites: () =>
    api.get<ApiResponse<Salon[]>>('/users/favorites').then(r => r.data.data),

  getFavoriteStatus: (salonId: string) =>
    api.get<ApiResponse<boolean>>(`/users/favorites/${salonId}/status`).then(r => r.data.data),
}

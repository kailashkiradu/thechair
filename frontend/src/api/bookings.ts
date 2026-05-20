import api from './axios'
import { ApiResponse, Booking } from '../types'

export const bookingsApi = {
  create: (data: { slotId: string; notes?: string }) =>
    api.post<ApiResponse<Booking>>('/bookings', data).then(r => r.data.data),

  getMy: () =>
    api.get<ApiResponse<Booking[]>>('/bookings/my').then(r => r.data.data),

  cancel: (id: string) =>
    api.put<ApiResponse<Booking>>(`/bookings/${id}/cancel`).then(r => r.data.data),
}

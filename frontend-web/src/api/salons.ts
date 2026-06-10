import api from './axios'
import { ApiResponse, Offering, Salon, TimeSlot } from '../types'

export const salonsApi = {
  getAll: (params?: { query?: string; latitude?: number; longitude?: number; radius?: number }) =>
    api.get<ApiResponse<Salon[]>>('/salons', { params }).then(r => r.data.data),

  getById: (id: string) =>
    api.get<ApiResponse<Salon>>(`/salons/${id}`).then(r => r.data.data),

  getServices: (id: string) =>
    api.get<ApiResponse<Offering[]>>(`/salons/${id}/services`).then(r => r.data.data),

  getSlots: (id: string, serviceId: string, date: string) =>
    api.get<ApiResponse<TimeSlot[]>>(`/salons/${id}/slots`, {
      params: { serviceId, date },
    }).then(r => r.data.data),
}

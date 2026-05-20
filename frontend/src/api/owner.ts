import api from './axios'
import { ApiResponse, Booking, Offering, Salon, TimeSlot } from '../types'

export const ownerApi = {
  getSalon: () =>
    api.get<ApiResponse<Salon>>('/owner/salon').then(r => r.data.data),

  createSalon: (data: Partial<Salon>) =>
    api.post<ApiResponse<Salon>>('/owner/salon', data).then(r => r.data.data),

  updateSalon: (data: Partial<Salon>) =>
    api.put<ApiResponse<Salon>>('/owner/salon', data).then(r => r.data.data),

  getServices: () =>
    api.get<ApiResponse<Offering[]>>('/owner/services').then(r => r.data.data),

  addService: (data: Partial<Offering>) =>
    api.post<ApiResponse<Offering>>('/owner/services', data).then(r => r.data.data),

  updateService: (id: string, data: Partial<Offering>) =>
    api.put<ApiResponse<Offering>>(`/owner/services/${id}`, data).then(r => r.data.data),

  deleteService: (id: string) =>
    api.delete<ApiResponse<void>>(`/owner/services/${id}`),

  generateSlots: (data: { offeringId: string; date: string; startTime: string; endTime: string }) =>
    api.post<ApiResponse<TimeSlot[]>>('/owner/slots/generate', data).then(r => r.data.data),

  getSlots: (date?: string) =>
    api.get<ApiResponse<TimeSlot[]>>('/owner/slots', { params: { date } }).then(r => r.data.data),

  getBookings: () =>
    api.get<ApiResponse<Booking[]>>('/owner/bookings').then(r => r.data.data),

  updateBookingStatus: (id: string, status: string) =>
    api.put<ApiResponse<Booking>>(`/owner/bookings/${id}/status`, { status }).then(r => r.data.data),
}

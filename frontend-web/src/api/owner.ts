import api from './axios'
import { ApiResponse, Booking, Offering, Salon, TimeSlot, Staff } from '../types'

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

  getStaff: () =>
    api.get<ApiResponse<Staff[]>>('/owner/staff').then(r => r.data.data),

  addStaff: (data: Partial<Staff>) =>
    api.post<ApiResponse<Staff>>('/owner/staff', data).then(r => r.data.data),

  updateStaff: (id: string, data: Partial<Staff>) =>
    api.put<ApiResponse<Staff>>(`/owner/staff/${id}`, data).then(r => r.data.data),

  toggleStaffAvailability: (id: string) =>
    api.patch<ApiResponse<Staff>>(`/owner/staff/${id}/toggle`).then(r => r.data.data),

  deleteStaff: (id: string) =>
    api.delete<ApiResponse<void>>(`/owner/staff/${id}`),

  generateSlots: (data: { offeringId: string; date: string; startTime: string; endTime: string; staffId?: string }) =>
    api.post<ApiResponse<TimeSlot[]>>('/owner/slots/generate', data).then(r => r.data.data),

  getSlots: (date?: string) =>
    api.get<ApiResponse<TimeSlot[]>>('/owner/slots', { params: { date } }).then(r => r.data.data),

  getBookings: () =>
    api.get<ApiResponse<Booking[]>>('/owner/bookings').then(r => r.data.data),

  updateBookingStatus: (id: string, status: string) =>
    api.put<ApiResponse<Booking>>(`/owner/bookings/${id}/status`, { status }).then(r => r.data.data),

  createWalkInBooking: (data: { slotId: string; customerName: string; customerPhone?: string; notes?: string }) =>
    api.post<ApiResponse<Booking>>('/owner/bookings/walk-in', data).then(r => r.data.data),
}

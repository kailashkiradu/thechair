import api from './axios'
import { ApiResponse, Waitlist } from '../types'

export const waitlistApi = {
  join: (data: {
    salonId: string
    offeringId: string
    preferredDate: string
    preferredTimeStart?: string
    preferredTimeEnd?: string
  }) => api.post<ApiResponse<Waitlist>>('/customer/waitlist', data).then(r => r.data.data),

  getMyWaitlists: () =>
    api.get<ApiResponse<Waitlist[]>>('/customer/waitlist').then(r => r.data.data),

  leaveWaitlist: (id: string) =>
    api.delete<ApiResponse<void>>(`/customer/waitlist/${id}`).then(r => r.data.data),

  getOwnerWaitlist: () =>
    api.get<ApiResponse<Waitlist[]>>('/owner/waitlist').then(r => r.data.data),
}

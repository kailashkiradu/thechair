import api from './axios'
import { ApiResponse, Review } from '../types'

export const reviewsApi = {
  submit: (data: { bookingId: string; salonRating: number; staffRating: number; comment?: string }) =>
    api.post<ApiResponse<Review>>('/reviews', data).then(r => r.data.data),

  getSalonReviews: (salonId: string) =>
    api.get<ApiResponse<Review[]>>(`/reviews/salon/${salonId}`).then(r => r.data.data),
}

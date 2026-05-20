export interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: 'CUSTOMER' | 'OWNER' | 'ADMIN'
  createdAt: string
}

export interface AuthResponse {
  token: string
  id: string
  name: string
  email: string
  role: string
}

export interface Salon {
  id: string
  name: string
  description?: string
  address: string
  city: string
  phone?: string
  email?: string
  category?: string
  imageUrl?: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'INACTIVE'
  rejectionReason?: string
  ownerId: string
  ownerName: string
  createdAt: string
}

export interface Offering {
  id: string
  salonId: string
  name: string
  description?: string
  duration: number
  price: number
  active: boolean
}

export interface TimeSlot {
  id: string
  salonId: string
  offeringId: string
  offeringName: string
  date: string
  startTime: string
  endTime: string
  booked: boolean
}

export interface Booking {
  id: string
  customerId: string
  customerName: string
  customerPhone?: string
  salonId: string
  salonName: string
  offeringId: string
  offeringName: string
  slotId: string
  date: string
  startTime: string
  endTime: string
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
  paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED'
  totalAmount: number
  notes?: string
  createdAt: string
}

export interface AdminStats {
  totalUsers: number
  totalSalons: number
  pendingSalons: number
  approvedSalons: number
  totalBookings: number
  confirmedBookings: number
  completedBookings: number
}

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
}

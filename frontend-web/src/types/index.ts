export interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: 'CUSTOMER' | 'OWNER' | 'STAFF' | 'ADMIN'
  createdAt: string
}

export interface UserProfile extends User {
  noShowCount: number
  restricted: boolean
  totalBookings: number
  cancelledBookings: number
  noShowBookings: number
}

export interface AuthResponse {
  token?: string
  id: string
  name: string
  email: string
  role: string
  otpRequired?: boolean
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
  latitude?: number
  longitude?: number
  distance?: number
}

export interface Staff {
  id: string
  salonId: string
  name: string
  specialty?: string
  photoUrl?: string
  experienceYears?: number
  averageRating: number
  available: boolean
  createdAt: string
}

export interface Review {
  id: string
  bookingId: string
  customerId: string
  customerName: string
  salonId: string
  staffId: string
  staffName: string
  salonRating: number
  staffRating: number
  comment?: string
  createdAt: string
}

export interface Offering {
  id: string
  salonId: string
  name: string
  description?: string
  duration: number
  price: number
  bufferTime?: number
  active: boolean
}

export interface Waitlist {
  id: string
  customerId: string
  customerName: string
  salonId: string
  salonName: string
  offeringId: string
  offeringName: string
  preferredDate: string
  preferredTimeStart?: string
  preferredTimeEnd?: string
  status: 'PENDING' | 'NOTIFIED' | 'BOOKED' | 'EXPIRED'
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
  staffId?: string
  staffName?: string
}

export interface Booking {
  id: string
  customerId?: string // Nullable for Walk-ins
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
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
  paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED'
  totalAmount: number
  notes?: string
  bookingType: 'ONLINE' | 'WALK_IN'
  staffId: string
  staffName: string
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

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Landing from './pages/Landing'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import VerifyOtp from './pages/auth/VerifyOtp'
import Salons from './pages/customer/Salons'
import SalonDetail from './pages/customer/SalonDetail'
import Book from './pages/customer/Book'
import MyBookings from './pages/customer/MyBookings'
import Profile from './pages/customer/Profile'
import OwnerDashboard from './pages/owner/Dashboard'
import SalonSetup from './pages/owner/SalonSetup'
import Services from './pages/owner/Services'
import Staff from './pages/owner/Staff'
import Slots from './pages/owner/Slots'
import OwnerBookings from './pages/owner/Bookings'
import Analytics from './pages/owner/Analytics'
import AdminDashboard from './pages/admin/Dashboard'
import AdminSalons from './pages/admin/Salons'
import AdminUsers from './pages/admin/Users'
import AdminBookings from './pages/admin/Bookings'

function RequireAuth({ children, role }: { children: JSX.Element; role?: string }) {
  const { isAuthenticated, isRole } = useAuthStore()
  if (!isAuthenticated()) return <Navigate to="/login" replace />
  if (role && !isRole(role)) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />

        {/* Customer */}
        <Route path="/salons" element={<Salons />} />
        <Route path="/salons/:id" element={<SalonDetail />} />
        <Route path="/salons/:id/book" element={<RequireAuth><Book /></RequireAuth>} />
        <Route path="/my-bookings" element={<RequireAuth><MyBookings /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />

        {/* Owner */}
        <Route path="/owner" element={<RequireAuth role="OWNER"><OwnerDashboard /></RequireAuth>} />
        <Route path="/owner/salon" element={<RequireAuth role="OWNER"><SalonSetup /></RequireAuth>} />
        <Route path="/owner/services" element={<RequireAuth role="OWNER"><Services /></RequireAuth>} />
        <Route path="/owner/staff" element={<RequireAuth role="OWNER"><Staff /></RequireAuth>} />
        <Route path="/owner/slots" element={<RequireAuth role="OWNER"><Slots /></RequireAuth>} />
        <Route path="/owner/bookings" element={<RequireAuth role="OWNER"><OwnerBookings /></RequireAuth>} />
        <Route path="/owner/analytics" element={<RequireAuth role="OWNER"><Analytics /></RequireAuth>} />

        {/* Admin */}
        <Route path="/admin" element={<RequireAuth role="ADMIN"><AdminDashboard /></RequireAuth>} />
        <Route path="/admin/salons" element={<RequireAuth role="ADMIN"><AdminSalons /></RequireAuth>} />
        <Route path="/admin/users" element={<RequireAuth role="ADMIN"><AdminUsers /></RequireAuth>} />
        <Route path="/admin/bookings" element={<RequireAuth role="ADMIN"><AdminBookings /></RequireAuth>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

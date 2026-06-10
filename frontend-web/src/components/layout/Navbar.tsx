import { Link, useNavigate } from 'react-router-dom'
import { Scissors, LogOut, User, Calendar, LayoutDashboard } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="sticky top-0 z-40 bg-chair-surface/90 backdrop-blur border-b border-chair-border">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <Scissors className="text-chair-accent" size={22} />
          <span>The<span className="text-chair-accent">Chair</span></span>
        </Link>

        <div className="flex items-center gap-4">
          <Link to="/salons" className="text-gray-400 hover:text-white transition-colors text-sm">
            Find Salons
          </Link>

          {isAuthenticated() ? (
            <>
              {user?.role === 'CUSTOMER' && (
                <Link to="/my-bookings" className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-1">
                  <Calendar size={15} />
                  My Bookings
                </Link>
              )}
              {user?.role === 'OWNER' && (
                <Link to="/owner" className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-1">
                  <LayoutDashboard size={15} />
                  Dashboard
                </Link>
              )}
              {user?.role === 'ADMIN' && (
                <Link to="/admin" className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-1">
                  <LayoutDashboard size={15} />
                  Admin
                </Link>
              )}
              <div className="flex items-center gap-2 bg-chair-card border border-chair-border rounded-full px-3 py-1.5 text-sm">
                <User size={14} className="text-chair-accent" />
                <span className="text-gray-300 max-w-[120px] truncate">{user?.name}</span>
              </div>
              <button onClick={handleLogout} className="text-gray-400 hover:text-red-400 transition-colors">
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-400 hover:text-white text-sm transition-colors">
                Login
              </Link>
              <Link to="/register" className="btn-primary text-sm px-4 py-2">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

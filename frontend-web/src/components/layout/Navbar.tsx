import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Scissors, LogOut, User, Calendar, LayoutDashboard, Sun, Moon } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const navigate = useNavigate()
  const [theme, setTheme] = useState(() => {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  })

  const toggleTheme = () => {
    if (theme === 'dark') {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
      setTheme('light')
    } else {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
      setTheme('dark')
    }
  }

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
          <Link to="/salons" className="text-chair-text-muted hover:text-chair-text transition-colors text-sm">
            Find Salons
          </Link>

          <button
            onClick={toggleTheme}
            className="p-1.5 text-chair-text-muted hover:text-chair-text transition-colors rounded-full hover:bg-chair-border/20 border border-chair-border/40"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {isAuthenticated() ? (
            <>
              {user?.role === 'CUSTOMER' && (
                <Link to="/my-bookings" className="text-chair-text-muted hover:text-chair-text transition-colors text-sm flex items-center gap-1">
                  <Calendar size={15} />
                  My Bookings
                </Link>
              )}
              {user?.role === 'OWNER' && (
                <Link to="/owner" className="text-chair-text-muted hover:text-chair-text transition-colors text-sm flex items-center gap-1">
                  <LayoutDashboard size={15} />
                  Dashboard
                </Link>
              )}
              {user?.role === 'ADMIN' && (
                <Link to="/admin" className="text-chair-text-muted hover:text-chair-text transition-colors text-sm flex items-center gap-1">
                  <LayoutDashboard size={15} />
                  Admin
                </Link>
              )}
              <Link to="/profile" className="flex items-center gap-2 bg-chair-card border border-chair-border hover:border-chair-accent/40 rounded-full px-3 py-1.5 text-sm transition-colors cursor-pointer">
                <User size={14} className="text-chair-accent" />
                <span className="text-chair-text max-w-[120px] truncate">{user?.name}</span>
              </Link>
              <button onClick={handleLogout} className="text-chair-text-muted hover:text-red-500 transition-colors">
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-chair-text-muted hover:text-chair-text text-sm transition-colors">
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

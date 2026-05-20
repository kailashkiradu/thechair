import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Store, Users, CalendarCheck } from 'lucide-react'
import Navbar from './Navbar'

const links = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/salons', icon: Store, label: 'Salons' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/bookings', icon: CalendarCheck, label: 'Bookings' },
]

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8 flex gap-8">
        <aside className="w-52 shrink-0">
          <nav className="flex flex-col gap-1">
            {links.map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors
                  ${pathname === to
                    ? 'bg-chair-accent text-black font-semibold'
                    : 'text-gray-400 hover:text-white hover:bg-chair-card'}`}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  )
}

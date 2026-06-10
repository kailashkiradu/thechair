import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Store, Scissors, Clock, CalendarCheck, Users } from 'lucide-react'
import Navbar from './Navbar'

const links = [
  { to: '/owner', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/owner/salon', icon: Store, label: 'My Salon' },
  { to: '/owner/services', icon: Scissors, label: 'Services' },
  { to: '/owner/staff', icon: Users, label: 'Stylists' },
  { to: '/owner/slots', icon: Clock, label: 'Slots' },
  { to: '/owner/bookings', icon: CalendarCheck, label: 'Bookings' },
]

export default function OwnerLayout({ children }: { children: ReactNode }) {
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

import { useQuery } from '@tanstack/react-query'
import { CalendarCheck, Clock, Scissors, Store } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ownerApi } from '../../api/owner'
import { useAuthStore } from '../../store/authStore'
import OwnerLayout from '../../components/layout/OwnerLayout'
import Spinner from '../../components/ui/Spinner'
import Badge from '../../components/ui/Badge'

export default function OwnerDashboard() {
  const { user } = useAuthStore()

  const { data: salon, isLoading: loadingSalon } = useQuery({
    queryKey: ['owner-salon'],
    queryFn: ownerApi.getSalon,
    retry: false,
  })

  const { data: bookings, isLoading: loadingBookings } = useQuery({
    queryKey: ['owner-bookings'],
    queryFn: ownerApi.getBookings,
    enabled: !!salon,
  })

  const recent = bookings?.slice(0, 5)

  return (
    <OwnerLayout>
      <div>
        <h1 className="text-2xl font-bold mb-1">Welcome, {user?.name}</h1>
        <p className="text-gray-400 mb-8 text-sm">Manage your salon and bookings from here.</p>

        {loadingSalon ? (
          <Spinner />
        ) : !salon ? (
          <div className="card text-center py-16">
            <Store size={40} className="mx-auto text-gray-700 mb-4" />
            <p className="text-gray-300 font-medium mb-2">No salon registered yet</p>
            <p className="text-sm text-gray-500 mb-6">Set up your salon to start accepting bookings.</p>
            <Link to="/owner/salon" className="btn-primary">Set Up My Salon</Link>
          </div>
        ) : (
          <>
            {/* Salon status card */}
            <div className="card mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-xl">{salon.name}</h2>
                  <p className="text-gray-400 text-sm mt-0.5">{salon.address}, {salon.city}</p>
                </div>
                <Badge status={salon.status} />
              </div>
              {salon.status === 'PENDING' && (
                <p className="text-yellow-400 text-sm mt-3 bg-yellow-900/20 border border-yellow-800 rounded-lg px-3 py-2">
                  Your salon is under review. Admin approval usually takes 24-48 hours.
                </p>
              )}
              {salon.status === 'REJECTED' && salon.rejectionReason && (
                <p className="text-red-400 text-sm mt-3 bg-red-900/20 border border-red-800 rounded-lg px-3 py-2">
                  Rejected: {salon.rejectionReason}
                </p>
              )}
            </div>

            {/* Quick links */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {[
                { to: '/owner/services', icon: Scissors, label: 'Manage Services' },
                { to: '/owner/slots', icon: Clock, label: 'Manage Slots' },
                { to: '/owner/bookings', icon: CalendarCheck, label: 'View Bookings' },
                { to: '/owner/salon', icon: Store, label: 'Edit Salon' },
              ].map(({ to, icon: Icon, label }) => (
                <Link key={to} to={to} className="card hover:border-chair-accent/40 transition-colors text-center py-6">
                  <Icon size={24} className="mx-auto text-chair-accent mb-2" />
                  <span className="text-sm font-medium">{label}</span>
                </Link>
              ))}
            </div>

            {/* Recent bookings */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Recent Bookings</h3>
                <Link to="/owner/bookings" className="text-sm text-chair-accent hover:underline">View all</Link>
              </div>
              {loadingBookings ? (
                <Spinner />
              ) : !recent?.length ? (
                <p className="text-gray-500 text-sm text-center py-6">No bookings yet.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {recent.map((b) => (
                    <div key={b.id} className="flex items-center justify-between py-3 border-b border-chair-border last:border-0">
                      <div>
                        <p className="font-medium text-sm">{b.customerName}</p>
                        <p className="text-xs text-gray-500">{b.offeringName} · {b.date} {b.startTime}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-chair-accent">₹{b.totalAmount}</span>
                        <Badge status={b.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </OwnerLayout>
  )
}

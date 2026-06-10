import { useQuery } from '@tanstack/react-query'
import { CalendarCheck, Clock, Scissors, Store, Users, ListPlus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ownerApi } from '../../api/owner'
import { waitlistApi } from '../../api/waitlist'
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

  const { data: waitlist, isLoading: loadingWaitlist } = useQuery({
    queryKey: ['owner-waitlist'],
    queryFn: waitlistApi.getOwnerWaitlist,
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

            {/* Analytics Stats Grid */}
            {bookings && bookings.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="card p-4 text-center border border-chair-border">
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Total Bookings</p>
                  <p className="text-3xl font-bold text-white mt-1">{bookings.length}</p>
                </div>
                <div className="card p-4 text-center border border-chair-border">
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Completed appointments</p>
                  <p className="text-3xl font-bold text-green-500 mt-1">
                    {bookings.filter(b => b.status === 'COMPLETED').length}
                  </p>
                </div>
                <div className="card p-4 text-center border border-chair-border col-span-2 md:col-span-1">
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Total Revenue</p>
                  <p className="text-3xl font-bold text-chair-accent mt-1">
                    ₹{bookings.filter(b => b.status === 'COMPLETED').reduce((sum, b) => sum + b.totalAmount, 0)}
                  </p>
                </div>
              </div>
            )}

            {/* Quick links */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { to: '/owner/services', icon: Scissors, label: 'Services' },
                { to: '/owner/staff', icon: Users, label: 'Stylists' },
                { to: '/owner/slots', icon: Clock, label: 'Slots' },
                { to: '/owner/bookings', icon: CalendarCheck, label: 'Bookings' },
              ].map(({ to, icon: Icon, label }) => (
                <Link key={to} to={to} className="card hover:border-chair-accent/40 transition-colors text-center py-6 border border-chair-border">
                  <Icon size={24} className="mx-auto text-chair-accent mb-2" />
                  <span className="text-sm font-medium">{label}</span>
                </Link>
              ))}
            </div>

            {/* Dashboard Lists: Recent Bookings & Waitlist */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              {/* Active Waitlist */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Active Waitlist</h3>
                </div>
                {loadingWaitlist ? (
                  <Spinner />
                ) : !waitlist?.length ? (
                  <p className="text-gray-500 text-sm text-center py-6">No clients on the waitlist.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {waitlist.map((w) => (
                      <div key={w.id} className="flex items-center justify-between py-3 border-b border-chair-border last:border-0">
                        <div>
                          <p className="font-medium text-sm">{w.customerName}</p>
                          <p className="text-xs text-gray-500">
                            {w.offeringName} · {w.preferredDate} 
                            {w.preferredTimeStart || w.preferredTimeEnd ? ` (${w.preferredTimeStart || 'Any'} - ${w.preferredTimeEnd || 'Any'})` : ''}
                          </p>
                        </div>
                        <Badge status={w.status} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </OwnerLayout>
  )
}

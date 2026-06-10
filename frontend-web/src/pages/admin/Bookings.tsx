import { useQuery } from '@tanstack/react-query'
import { CalendarCheck } from 'lucide-react'
import { adminApi } from '../../api/admin'
import AdminLayout from '../../components/layout/AdminLayout'
import Spinner from '../../components/ui/Spinner'
import Badge from '../../components/ui/Badge'

export default function AdminBookings() {
  const { data: bookings, isLoading } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: adminApi.getBookings,
  })

  return (
    <AdminLayout>
      <div>
        <h1 className="text-2xl font-bold mb-1">All Bookings</h1>
        <p className="text-gray-400 text-sm mb-8">Platform-wide booking activity.</p>

        {isLoading ? <Spinner /> : !bookings?.length ? (
          <div className="card text-center py-16">
            <CalendarCheck size={36} className="mx-auto text-gray-700 mb-3" />
            <p className="text-gray-400">No bookings yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {bookings.map((b) => (
              <div key={b.id} className="card">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{b.salonName}</span>
                      <span className="text-gray-500 text-xs">·</span>
                      <span className="text-chair-accent text-sm">{b.offeringName}</span>
                    </div>
                    <p className="text-sm text-gray-400">
                      Customer: {b.customerName} {b.customerPhone ? `(${b.customerPhone})` : ''}
                    </p>
                    <p className="text-sm text-gray-400">
                      {b.date} · {b.startTime} – {b.endTime}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge status={b.status} />
                    <span className="text-chair-accent font-semibold">₹{b.totalAmount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

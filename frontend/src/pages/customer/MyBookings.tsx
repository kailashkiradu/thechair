import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Calendar, Clock, Scissors } from 'lucide-react'
import toast from 'react-hot-toast'
import { bookingsApi } from '../../api/bookings'
import Navbar from '../../components/layout/Navbar'
import Spinner from '../../components/ui/Spinner'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'

export default function MyBookings() {
  const qc = useQueryClient()

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: bookingsApi.getMy,
  })

  const { mutate: cancel, isPending } = useMutation({
    mutationFn: bookingsApi.cancel,
    onSuccess: () => {
      toast.success('Booking cancelled')
      qc.invalidateQueries({ queryKey: ['my-bookings'] })
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Cancel failed'),
  })

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-8">My Bookings</h1>

        {isLoading ? (
          <Spinner />
        ) : !bookings?.length ? (
          <div className="card text-center py-16">
            <Scissors size={40} className="mx-auto text-gray-700 mb-4" />
            <p className="text-gray-400">No bookings yet.</p>
            <p className="text-sm text-gray-500 mt-1">
              <a href="/salons" className="text-chair-accent hover:underline">Browse salons</a> to book your first appointment.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {bookings.map((b) => (
              <div key={b.id} className="card">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{b.salonName}</h3>
                    <p className="text-chair-accent text-sm">{b.offeringName}</p>
                  </div>
                  <Badge status={b.status} />
                </div>

                <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} />{b.date}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} />{b.startTime} – {b.endTime}
                  </span>
                  <span className="font-semibold text-white">₹{b.totalAmount}</span>
                </div>

                {b.notes && (
                  <p className="text-sm text-gray-500 mt-2 italic">"{b.notes}"</p>
                )}

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-chair-border">
                  <Badge status={b.paymentStatus} />
                  {(b.status === 'PENDING' || b.status === 'CONFIRMED') && (
                    <Button
                      variant="danger"
                      size="sm"
                      loading={isPending}
                      onClick={() => cancel(b.id)}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

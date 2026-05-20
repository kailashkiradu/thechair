import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Calendar, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import { ownerApi } from '../../api/owner'
import OwnerLayout from '../../components/layout/OwnerLayout'
import Spinner from '../../components/ui/Spinner'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'

export default function OwnerBookings() {
  const qc = useQueryClient()

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['owner-bookings'],
    queryFn: ownerApi.getBookings,
  })

  const { mutate: updateStatus } = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      ownerApi.updateBookingStatus(id, status),
    onSuccess: () => {
      toast.success('Booking updated')
      qc.invalidateQueries({ queryKey: ['owner-bookings'] })
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  })

  return (
    <OwnerLayout>
      <div>
        <h1 className="text-2xl font-bold mb-1">Bookings</h1>
        <p className="text-gray-400 text-sm mb-8">All customer appointments for your salon.</p>

        {isLoading ? <Spinner /> : !bookings?.length ? (
          <div className="card text-center py-16">
            <Calendar size={36} className="mx-auto text-gray-700 mb-3" />
            <p className="text-gray-400">No bookings yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {bookings.map((b) => (
              <div key={b.id} className="card">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold">{b.customerName}</p>
                    <p className="text-sm text-gray-400">{b.customerPhone}</p>
                  </div>
                  <Badge status={b.status} />
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-3">
                  <span className="text-chair-accent font-medium">{b.offeringName}</span>
                  <span className="flex items-center gap-1"><Calendar size={13} />{b.date}</span>
                  <span className="flex items-center gap-1"><Clock size={13} />{b.startTime} – {b.endTime}</span>
                  <span className="font-semibold text-white">₹{b.totalAmount}</span>
                </div>

                {b.notes && <p className="text-sm text-gray-500 italic mb-3">"{b.notes}"</p>}

                {b.status === 'PENDING' && (
                  <div className="flex gap-2 pt-3 border-t border-chair-border">
                    <Button
                      size="sm"
                      onClick={() => updateStatus({ id: b.id, status: 'CONFIRMED' })}
                    >
                      Confirm
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => updateStatus({ id: b.id, status: 'CANCELLED' })}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
                {b.status === 'CONFIRMED' && (
                  <div className="pt-3 border-t border-chair-border">
                    <Button
                      size="sm"
                      onClick={() => updateStatus({ id: b.id, status: 'COMPLETED' })}
                    >
                      Mark Completed
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </OwnerLayout>
  )
}

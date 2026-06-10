import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Calendar, Clock, Plus, HelpCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { ownerApi } from '../../api/owner'
import OwnerLayout from '../../components/layout/OwnerLayout'
import Spinner from '../../components/ui/Spinner'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'

export default function OwnerBookings() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(false)
  const [walkInDate, setWalkInDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [form, setForm] = useState({
    slotId: '',
    customerName: '',
    customerPhone: '',
    notes: '',
  })

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['owner-bookings'],
    queryFn: ownerApi.getBookings,
  })

  const { data: availableSlots, isLoading: isLoadingSlots } = useQuery({
    queryKey: ['owner-slots-for-walk-in', walkInDate],
    queryFn: () => ownerApi.getSlots(walkInDate),
    enabled: modal, // Only fetch when walk-in modal is open
  })

  const { mutate: updateStatus } = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      ownerApi.updateBookingStatus(id, status),
    onSuccess: () => {
      toast.success('Booking updated')
      qc.invalidateQueries({ queryKey: ['owner-bookings'] })
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to update booking status'),
  })

  const { mutate: createWalkIn, isPending: isCreating } = useMutation({
    mutationFn: () => ownerApi.createWalkInBooking(form),
    onSuccess: () => {
      toast.success('Walk-in booking created successfully!')
      qc.invalidateQueries({ queryKey: ['owner-bookings'] })
      qc.invalidateQueries({ queryKey: ['owner-slots'] })
      setModal(false)
      setForm({ slotId: '', customerName: '', customerPhone: '', notes: '' })
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to register walk-in'),
  })

  const slotsList = availableSlots?.filter(s => !s.booked) || []

  return (
    <OwnerLayout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1">Bookings</h1>
            <p className="text-gray-400 text-sm">All customer appointments for your salon.</p>
          </div>
          <Button onClick={() => setModal(true)} size="sm">
            <Plus size={15} /> Add Walk-In
          </Button>
        </div>

        {isLoading ? <Spinner /> : !bookings?.length ? (
          <div className="card text-center py-16">
            <Calendar size={36} className="mx-auto text-gray-700 mb-3" />
            <p className="text-gray-400">No bookings yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {bookings.map((b) => (
              <div key={b.id} className="card border border-chair-border p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-lg flex items-center gap-2">
                      {b.customerName}
                      {b.bookingType === 'WALK_IN' && (
                        <span className="text-xs px-2 py-0.5 rounded bg-chair-accent/20 text-chair-accent font-normal">
                          WALK-IN
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-400">{b.customerPhone || 'No phone provided'}</p>
                  </div>
                  <Badge status={b.status} />
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-3">
                  <span className="text-chair-accent font-medium">{b.offeringName}</span>
                  <span className="flex items-center gap-1"><Calendar size={13} />{b.date}</span>
                  <span className="flex items-center gap-1"><Clock size={13} />{b.startTime} – {b.endTime}</span>
                  <span className="text-gray-400">Stylist: <strong className="text-white">{b.staffName || 'Any'}</strong></span>
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

        <Modal open={modal} onClose={() => setModal(false)} title="Register Walk-In Booking">
          <form onSubmit={(e) => { e.preventDefault(); createWalkIn() }} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-300">Date *</label>
              <input
                type="date"
                className="input-field"
                value={walkInDate}
                onChange={e => {
                  setWalkInDate(e.target.value)
                  setForm(f => ({ ...f, slotId: '' }))
                }}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-300">Select Available Slot *</label>
              {isLoadingSlots ? (
                <div className="py-2 text-sm text-gray-500 flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-chair-border border-t-chair-accent rounded-full animate-spin" />
                  Loading slots...
                </div>
              ) : !slotsList.length ? (
                <div className="py-2 text-sm text-red-400 flex items-center gap-1.5">
                  <HelpCircle size={16} /> No vacant stylist slots found for this date.
                </div>
              ) : (
                <select
                  className="input-field"
                  value={form.slotId}
                  onChange={e => setForm(f => ({ ...f, slotId: e.target.value }))}
                  required
                >
                  <option value="">Select a slot</option>
                  {slotsList.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.startTime} – {s.endTime} ({s.offeringName} | Stylist: {s.staffName || 'Any'})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <Input
              label="Customer Name *"
              value={form.customerName}
              onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))}
              required
              placeholder="e.g. Kailash"
            />

            <Input
              label="Customer Phone (Optional)"
              value={form.customerPhone}
              onChange={e => setForm(f => ({ ...f, customerPhone: e.target.value }))}
              placeholder="e.g. 9876543210"
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-300">Notes (Optional)</label>
              <textarea
                className="input-field min-h-20"
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Add walk-in details (e.g., specific request)"
              />
            </div>

            <Button type="submit" loading={isCreating} disabled={!form.slotId || !form.customerName} className="w-full mt-2">
              Block Slot & Confirm Walk-in
            </Button>
          </form>
        </Modal>
      </div>
    </OwnerLayout>
  )
}

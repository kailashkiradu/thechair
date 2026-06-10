import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Calendar, Clock, Plus, HelpCircle, LayoutList, CalendarDays, UserMinus, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import { format, addDays } from 'date-fns'
import { ownerApi } from '../../api/owner'
import OwnerLayout from '../../components/layout/OwnerLayout'
import Spinner from '../../components/ui/Spinner'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'

export default function OwnerBookings() {
  const qc = useQueryClient()
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))

  // Walk-in booking modal state
  const [modal, setModal] = useState(false)
  const [walkInDate, setWalkInDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [form, setForm] = useState({
    slotId: '',
    customerName: '',
    customerPhone: '',
    notes: '',
  })

  // Booking details modal state
  const [detailsModal, setDetailsModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null)

  // Queries
  const { data: bookings, isLoading: isLoadingBookings } = useQuery({
    queryKey: ['owner-bookings'],
    queryFn: ownerApi.getBookings,
  })

  const { data: staffList } = useQuery({
    queryKey: ['owner-staff'],
    queryFn: ownerApi.getStaff,
  })

  const { data: dailySlots, isLoading: isLoadingSlots } = useQuery({
    queryKey: ['owner-slots-for-calendar', selectedDate],
    queryFn: () => ownerApi.getSlots(selectedDate),
  })

  const { data: availableSlots, isLoading: isLoadingSlotsWalkIn } = useQuery({
    queryKey: ['owner-slots-for-walk-in', walkInDate],
    queryFn: () => ownerApi.getSlots(walkInDate),
    enabled: modal, // Only fetch when walk-in modal is open
  })

  // Mutations
  const { mutate: updateStatus } = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      ownerApi.updateBookingStatus(id, status),
    onSuccess: () => {
      toast.success('Booking status updated')
      qc.invalidateQueries({ queryKey: ['owner-bookings'] })
      qc.invalidateQueries({ queryKey: ['owner-slots-for-calendar'] })
      setDetailsModal(false)
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to update booking status'),
  })

  const { mutate: createWalkIn, isPending: isCreating } = useMutation({
    mutationFn: () => ownerApi.createWalkInBooking(form),
    onSuccess: () => {
      toast.success('Walk-in booking created successfully!')
      qc.invalidateQueries({ queryKey: ['owner-bookings'] })
      qc.invalidateQueries({ queryKey: ['owner-slots-for-calendar'] })
      setModal(false)
      setForm({ slotId: '', customerName: '', customerPhone: '', notes: '' })
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to register walk-in'),
  })

  const slotsList = availableSlots?.filter(s => !s.booked) || []

  // Date lists for slider (14 days starting today)
  const dates = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i))

  // Timeline helpers
  const timeToMinutes = (t: string) => {
    const [h, m] = t.split(':').map(Number)
    return h * 60 + m
  }
  const scheduleStartMinutes = 9 * 60 // 09:00 AM
  const scheduleEndMinutes = 21 * 60 // 09:00 PM
  const rowHeight = 85 // Pixels per hour

  const timeLabels: string[] = []
  for (let m = scheduleStartMinutes; m <= scheduleEndMinutes; m += 60) {
    const h = Math.floor(m / 60)
    timeLabels.push(`${h.toString().padStart(2, '0')}:00`)
  }

  const getBookingStyle = (startTime: string, endTime: string) => {
    const start = timeToMinutes(startTime)
    const end = timeToMinutes(endTime)
    const top = Math.max(0, start - scheduleStartMinutes) * (rowHeight / 60)
    const height = Math.max(35, end - start) * (rowHeight / 60)
    return {
      top: `${top}px`,
      height: `${height}px`,
    }
  }

  const handleEmptySlotClick = (slot: any) => {
    setWalkInDate(slot.date)
    setForm({
      slotId: slot.id,
      customerName: '',
      customerPhone: '',
      notes: '',
    })
    setModal(true)
  }

  const handleBookingClick = (booking: any) => {
    setSelectedBooking(booking)
    setDetailsModal(true)
  }

  const dailyBookings = bookings?.filter(b => b.date === selectedDate) || []
  const isLoading = isLoadingBookings || isLoadingSlots

  return (
    <OwnerLayout>
      <div className="flex flex-col h-full">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1">Bookings & Scheduler</h1>
            <p className="text-gray-400 text-sm">Monitor and manage appointments in list or calendar timeline views.</p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle Switcher */}
            <div className="bg-chair-surface border border-chair-border p-1 rounded-lg flex items-center gap-1">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  viewMode === 'list' ? 'bg-chair-accent text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <LayoutList size={14} />
                List
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  viewMode === 'calendar' ? 'bg-chair-accent text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <CalendarDays size={14} />
                Timeline
              </button>
            </div>

            <Button onClick={() => setModal(true)} size="sm">
              <Plus size={15} /> Add Walk-In
            </Button>
          </div>
        </div>

        {/* Date Selector for Calendar view */}
        {viewMode === 'calendar' && (
          <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-thin scrollbar-thumb-chair-border">
            {dates.map((d) => {
              const val = format(d, 'yyyy-MM-dd')
              const isSelected = selectedDate === val
              return (
                <button
                  key={val}
                  onClick={() => setSelectedDate(val)}
                  className={`flex flex-col items-center px-4 py-2.5 rounded-xl border transition-all shrink-0 min-w-[70px] ${
                    isSelected
                      ? 'border-chair-accent bg-chair-accent/15 text-chair-accent shadow-md shadow-chair-accent/5'
                      : 'border-chair-border text-gray-400 hover:border-chair-accent/30 hover:text-white'
                  }`}
                >
                  <span className="text-[10px] uppercase tracking-wider font-semibold opacity-70">{format(d, 'EEE')}</span>
                  <span className="font-bold text-lg mt-0.5">{format(d, 'd')}</span>
                  <span className="text-[9px] opacity-60 mt-0.5">{format(d, 'MMM')}</span>
                </button>
              )
            })}
          </div>
        )}

        {/* Loading Spinner */}
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <Spinner />
          </div>
        ) : viewMode === 'list' ? (
          /* LIST VIEW */
          !bookings?.length ? (
            <div className="card text-center py-16">
              <Calendar size={36} className="mx-auto text-gray-700 mb-3" />
              <p className="text-gray-400">No bookings yet.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {bookings.map((b) => (
                <div key={b.id} className="card border border-chair-border p-4 hover:border-chair-accent/25 transition-colors">
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

                  <div className="flex items-center gap-2 pt-3 border-t border-chair-border">
                    {b.status === 'PENDING' && (
                      <>
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
                      </>
                    )}
                    {b.status === 'CONFIRMED' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => updateStatus({ id: b.id, status: 'COMPLETED' })}
                        >
                          Mark Completed
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => updateStatus({ id: b.id, status: 'NO_SHOW' })}
                          className="flex items-center gap-1"
                        >
                          <UserMinus size={14} />
                          No-Show
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => updateStatus({ id: b.id, status: 'CANCELLED' })}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* CALENDAR TIMELINE VIEW */
          !staffList?.length ? (
            <div className="card text-center py-16">
              <Users size={36} className="mx-auto text-gray-700 mb-3" />
              <p className="text-gray-400">No stylists registered.</p>
              <p className="text-sm text-gray-500 mt-1">Add stylists in the Stylist page to enable the scheduler.</p>
            </div>
          ) : (
            <div className="flex-1 overflow-x-auto border border-chair-border rounded-xl bg-chair-card/20 backdrop-blur-md shadow-2xl">
              <div className="min-w-[850px] flex flex-col">
                {/* Columns Header Row */}
                <div className="flex border-b border-chair-border bg-chair-surface/50 sticky top-0 z-30 backdrop-blur-md">
                  <div className="w-20 shrink-0 border-r border-chair-border p-3 text-center text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center justify-center">
                    Time
                  </div>
                  {staffList.map((staff) => (
                    <div key={staff.id} className="flex-1 min-w-[200px] border-r border-chair-border last:border-r-0 p-3 text-center">
                      <p className="font-bold text-sm text-white">{staff.name}</p>
                      <p className="text-[10px] text-chair-accent mt-0.5 tracking-wide font-medium">{staff.specialty || 'Generalist'}</p>
                    </div>
                  ))}
                </div>

                {/* Timeline Grid Body */}
                <div className="relative flex" style={{ height: `${(timeLabels.length * rowHeight)}px` }}>
                  {/* Left-side Time Labels Column */}
                  <div className="w-20 shrink-0 border-r border-chair-border bg-chair-surface/10 select-none relative h-full">
                    {timeLabels.map((time, idx) => (
                      <div
                        key={time}
                        className="absolute left-0 right-0 text-center text-xs text-gray-400 font-semibold"
                        style={{ top: `${idx * rowHeight}px`, height: `${rowHeight}px`, lineHeight: '24px' }}
                      >
                        {time}
                      </div>
                    ))}
                  </div>

                  {/* Stylists Scheduler Tracks */}
                  {staffList.map((staff) => {
                    const stylistSlots = dailySlots?.filter(s => s.staffId === staff.id) || []
                    const freeSlots = stylistSlots.filter(s => !s.booked)
                    const stylistBookings = dailyBookings.filter(b => b.staffId === staff.id)

                    return (
                      <div key={staff.id} className="flex-1 min-w-[200px] border-r border-chair-border last:border-r-0 relative h-full bg-chair-card/5">
                        {/* Grid lines */}
                        {timeLabels.map((_, idx) => (
                          <div
                            key={idx}
                            className="absolute left-0 right-0 border-b border-chair-border/25 pointer-events-none"
                            style={{ top: `${idx * rowHeight}px`, height: `${rowHeight}px` }}
                          />
                        ))}

                        {/* Available Slots */}
                        {freeSlots.map((slot) => (
                          <button
                            key={slot.id}
                            onClick={() => handleEmptySlotClick(slot)}
                            className="absolute left-2.5 right-2.5 p-2 rounded-xl border border-dashed border-green-800/40 bg-green-950/5 hover:bg-green-950/20 text-left transition-colors z-10 flex flex-col justify-between overflow-hidden group shadow-sm animate-fade-in"
                            style={getBookingStyle(slot.startTime, slot.endTime)}
                          >
                            <div className="w-full">
                              <p className="font-bold text-[10px] text-green-400 group-hover:text-green-300 truncate">Available</p>
                              <p className="text-[9px] text-gray-400 truncate mt-0.5">{slot.offeringName}</p>
                            </div>
                            <span className="text-[8px] text-gray-500 font-bold tracking-tight mt-1">{slot.startTime} - {slot.endTime}</span>
                          </button>
                        ))}

                        {/* Bookings Overlay */}
                        {stylistBookings.map((b) => {
                          const style = getBookingStyle(b.startTime, b.endTime)
                          let statusTheme = 'border-blue-800/80 bg-blue-950/30 text-blue-300'
                          if (b.status === 'PENDING') statusTheme = 'border-yellow-800/80 bg-yellow-950/30 text-yellow-300 animate-pulse'
                          if (b.status === 'COMPLETED') statusTheme = 'border-green-800 bg-green-950/30 text-green-300'
                          if (b.status === 'CANCELLED' || b.status === 'NO_SHOW') statusTheme = 'border-red-950 bg-red-950/15 text-red-400/80 line-through opacity-70'

                          return (
                            <div
                              key={b.id}
                              onClick={() => handleBookingClick(b)}
                              className={`absolute left-2.5 right-2.5 p-2.5 rounded-xl border backdrop-blur-sm cursor-pointer transition-all hover:scale-[1.02] hover:z-20 z-10 flex flex-col justify-between overflow-hidden shadow-lg ${statusTheme}`}
                              style={style}
                            >
                              <div className="w-full">
                                <p className="font-extrabold text-xs truncate text-white">{b.customerName}</p>
                                <p className="text-[9px] opacity-80 truncate mt-0.5 font-medium">{b.offeringName}</p>
                              </div>
                              <div className="flex items-center justify-between mt-1 text-[8px] font-bold">
                                <span>{b.startTime} - {b.endTime}</span>
                                <span className="uppercase text-[7px] px-1 rounded bg-black/45 tracking-widest">{b.status}</span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        )}

        {/* Booking Details Modal */}
        <Modal open={detailsModal} onClose={() => setDetailsModal(false)} title="Appointment Details">
          {selectedBooking && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-chair-border">
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedBooking.customerName}</h3>
                  <p className="text-sm text-gray-400 mt-0.5">{selectedBooking.customerPhone || 'No phone number provided'}</p>
                </div>
                <Badge status={selectedBooking.status} />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Service</p>
                  <p className="font-semibold text-white mt-0.5">{selectedBooking.offeringName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Stylist</p>
                  <p className="font-semibold text-white mt-0.5">{selectedBooking.staffName || 'Any'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Date & Time</p>
                  <p className="font-semibold text-white mt-0.5">{selectedBooking.date} ({selectedBooking.startTime} - {selectedBooking.endTime})</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Price</p>
                  <p className="font-semibold text-chair-accent mt-0.5">₹{selectedBooking.totalAmount}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Booking Type</p>
                  <p className="font-semibold text-white mt-0.5 uppercase">{selectedBooking.bookingType}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Payment Status</p>
                  <div className="mt-0.5">
                    <Badge status={selectedBooking.paymentStatus} />
                  </div>
                </div>
              </div>

              {selectedBooking.notes && (
                <div className="bg-chair-surface border border-chair-border rounded-xl p-3">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Customer Notes</p>
                  <p className="text-sm text-gray-300 mt-1 italic">"{selectedBooking.notes}"</p>
                </div>
              )}

              {/* Status Action Controls */}
              <div className="flex flex-wrap gap-2 pt-4 border-t border-chair-border mt-2">
                {selectedBooking.status === 'PENDING' && (
                  <>
                    <Button
                      onClick={() => updateStatus({ id: selectedBooking.id, status: 'CONFIRMED' })}
                      className="flex-1"
                    >
                      Confirm Booking
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => updateStatus({ id: selectedBooking.id, status: 'CANCELLED' })}
                      className="flex-1"
                    >
                      Cancel Booking
                    </Button>
                  </>
                )}
                {selectedBooking.status === 'CONFIRMED' && (
                  <>
                    <Button
                      onClick={() => updateStatus({ id: selectedBooking.id, status: 'COMPLETED' })}
                      className="flex-1"
                    >
                      Mark Completed
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => updateStatus({ id: selectedBooking.id, status: 'NO_SHOW' })}
                      className="flex-1 flex items-center justify-center gap-1.5"
                    >
                      <UserMinus size={15} />
                      Mark No-Show
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => updateStatus({ id: selectedBooking.id, status: 'CANCELLED' })}
                      className="flex-1"
                    >
                      Cancel Booking
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </Modal>

        {/* Register Walk-In Modal */}
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
              {isLoadingSlotsWalkIn ? (
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

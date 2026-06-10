import { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Clock, CheckCircle, ListPlus } from 'lucide-react'
import toast from 'react-hot-toast'
import { salonsApi } from '../../api/salons'
import { bookingsApi } from '../../api/bookings'
import { waitlistApi } from '../../api/waitlist'
import Navbar from '../../components/layout/Navbar'
import Spinner from '../../components/ui/Spinner'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'

export default function Book() {
  const { id: salonId } = useParams<{ id: string }>()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const serviceId = params.get('serviceId') ?? ''
  const date = params.get('date') ?? ''
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [notes, setNotes] = useState('')

  // Waitlist States
  const [waitlistModal, setWaitlistModal] = useState(false)
  const [prefTimeStart, setPrefTimeStart] = useState('')
  const [prefTimeEnd, setPrefTimeEnd] = useState('')

  const { data: slots, isLoading } = useQuery({
    queryKey: ['slots', salonId, serviceId, date],
    queryFn: () => salonsApi.getSlots(salonId!, serviceId, date),
    enabled: !!salonId && !!serviceId && !!date,
  })

  const { mutate: book, isPending } = useMutation({
    mutationFn: () => bookingsApi.create({ slotId: selectedSlot!, notes }),
    onSuccess: () => {
      toast.success('Booking confirmed!')
      qc.invalidateQueries({ queryKey: ['my-bookings'] })
      navigate('/my-bookings')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Booking failed')
    },
  })

  const { mutate: joinWaitlist, isPending: isJoiningWaitlist } = useMutation({
    mutationFn: () => waitlistApi.join({
      salonId: salonId!,
      offeringId: serviceId,
      preferredDate: date,
      preferredTimeStart: prefTimeStart || undefined,
      preferredTimeEnd: prefTimeEnd || undefined,
    }),
    onSuccess: () => {
      toast.success('Successfully joined the waitlist!')
      setWaitlistModal(false)
      qc.invalidateQueries({ queryKey: ['my-waitlists'] })
      navigate('/my-bookings?tab=waitlists')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to join waitlist')
    },
  })

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-2">Choose a Slot</h1>
        <p className="text-gray-400 text-sm mb-8">Date: <span className="text-white">{date}</span></p>

        {isLoading ? (
          <Spinner />
        ) : !slots?.length ? (
          <div className="card text-center py-12 flex flex-col items-center">
            <Clock size={36} className="text-gray-600 mb-3" />
            <p className="text-gray-400 mb-2">No available slots for this date.</p>
            <p className="text-sm text-gray-500 mb-6">Try selecting a different date or join the waitlist to be notified of openings.</p>
            <Button
              variant="secondary"
              onClick={() => setWaitlistModal(true)}
              className="flex items-center gap-2"
            >
              <ListPlus size={16} />
              Join Waitlist
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3 mb-8">
              {Array.from(new Set(slots?.map(s => s.startTime) || [])).sort().map((time) => {
                const isSelected = selectedTime === time
                return (
                  <button
                    key={time}
                    onClick={() => {
                      setSelectedTime(time)
                      setSelectedSlot(null) // reset stylist selection on time change
                    }}
                    className={`p-3 rounded-lg border text-center transition-colors
                      ${isSelected
                        ? 'border-chair-accent bg-chair-accent/10 text-chair-accent font-semibold'
                        : 'border-chair-border hover:border-chair-accent/50 text-chair-text-muted hover:text-chair-text'}`}
                  >
                    <div className="text-sm">{time}</div>
                  </button>
                )
              })}
            </div>

            {/* Stylist Selector */}
            {selectedTime && (
              <div className="flex flex-col gap-3 mb-8">
                <label className="text-sm font-semibold text-chair-text">Select an Available Stylist *</label>
                <div className="flex flex-col gap-2">
                  {slots.filter(s => s.startTime === selectedTime).map((slot) => {
                    const isSelected = selectedSlot === slot.id
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => setSelectedSlot(slot.id)}
                        className={`flex items-center justify-between p-3.5 rounded-xl border transition-all text-left ${
                          isSelected
                            ? 'border-chair-accent bg-chair-accent/5'
                            : 'border-chair-border hover:border-chair-accent/30 bg-chair-card/50'
                        }`}
                      >
                        <div>
                          <p className="font-bold text-sm text-chair-text">
                            {slot.staffName || 'Any Available Stylist'}
                          </p>
                          <p className="text-xs text-chair-text-muted mt-0.5">
                            Shift: {slot.startTime} – {slot.endTime}
                          </p>
                        </div>
                        <div className="w-5 h-5 rounded-full border border-chair-border flex items-center justify-center shrink-0">
                          {isSelected && (
                            <div className="w-3 h-3 rounded-full bg-chair-accent" />
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {selectedSlot && (
              <div className="card mb-6">
                <label className="text-sm font-medium text-chair-text-muted block mb-2">
                  Notes (optional)
                </label>
                <textarea
                  className="input-field resize-none bg-chair-surface/50"
                  rows={3}
                  placeholder="Any special requests..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            )}

            <Button
              className="w-full"
              disabled={!selectedSlot}
              loading={isPending}
              onClick={() => book()}
            >
              <CheckCircle size={16} />
              Confirm Booking
            </Button>
          </>
        )}
      </div>

      {/* Waitlist Modal */}
      <Modal open={waitlistModal} onClose={() => setWaitlistModal(false)} title="Join Waitlist">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-400">
            Get notified immediately if another client cancels their appointment. 
            You can optionally restrict notification to a specific time slot range.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-300">From Time (optional)</label>
              <input
                type="time"
                className="input-field"
                value={prefTimeStart}
                onChange={e => setPrefTimeStart(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-300">To Time (optional)</label>
              <input
                type="time"
                className="input-field"
                value={prefTimeEnd}
                onChange={e => setPrefTimeEnd(e.target.value)}
              />
            </div>
          </div>

          <Button
            className="w-full mt-4"
            loading={isJoiningWaitlist}
            onClick={() => joinWaitlist()}
          >
            <ListPlus size={16} />
            Join Waitlist
          </Button>
        </div>
      </Modal>
    </div>
  )
}

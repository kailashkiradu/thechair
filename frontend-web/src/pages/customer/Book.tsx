import { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Clock, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { salonsApi } from '../../api/salons'
import { bookingsApi } from '../../api/bookings'
import Navbar from '../../components/layout/Navbar'
import Spinner from '../../components/ui/Spinner'
import Button from '../../components/ui/Button'

export default function Book() {
  const { id: salonId } = useParams<{ id: string }>()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const serviceId = params.get('serviceId') ?? ''
  const date = params.get('date') ?? ''
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [notes, setNotes] = useState('')

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

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-2">Choose a Slot</h1>
        <p className="text-gray-400 text-sm mb-8">Date: <span className="text-white">{date}</span></p>

        {isLoading ? (
          <Spinner />
        ) : !slots?.length ? (
          <div className="card text-center py-12">
            <Clock size={36} className="mx-auto text-gray-600 mb-3" />
            <p className="text-gray-400">No available slots for this date.</p>
            <p className="text-sm text-gray-500 mt-1">Try selecting a different date.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3 mb-8">
              {slots.map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => setSelectedSlot(slot.id)}
                  className={`p-3 rounded-lg border text-center transition-colors
                    ${selectedSlot === slot.id
                      ? 'border-chair-accent bg-chair-accent/10 text-chair-accent'
                      : 'border-chair-border hover:border-chair-accent/50 text-gray-300'}`}
                >
                  <div className="font-semibold text-sm">{slot.startTime}</div>
                  <div className="text-xs text-gray-500">to {slot.endTime}</div>
                </button>
              ))}
            </div>

            {selectedSlot && (
              <div className="card mb-6">
                <label className="text-sm font-medium text-gray-300 block mb-2">
                  Notes (optional)
                </label>
                <textarea
                  className="input-field resize-none"
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
    </div>
  )
}

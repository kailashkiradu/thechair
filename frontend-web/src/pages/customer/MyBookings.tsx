import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Calendar, Clock, Scissors, Star, ListPlus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { bookingsApi } from '../../api/bookings'
import { reviewsApi } from '../../api/reviews'
import { waitlistApi } from '../../api/waitlist'
import Navbar from '../../components/layout/Navbar'
import Spinner from '../../components/ui/Spinner'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'

export default function MyBookings() {
  const qc = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'bookings'

  const [reviewModal, setReviewModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<any>(null)
  const [salonRating, setSalonRating] = useState(5)
  const [staffRating, setStaffRating] = useState(5)
  const [comment, setComment] = useState('')

  const { data: bookings, isLoading: isBookingsLoading } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: bookingsApi.getMy,
    enabled: activeTab === 'bookings',
  })

  const { data: waitlists, isLoading: isWaitlistsLoading } = useQuery({
    queryKey: ['my-waitlists'],
    queryFn: waitlistApi.getMyWaitlists,
    enabled: activeTab === 'waitlists',
  })

  const { mutate: cancel, isPending } = useMutation({
    mutationFn: bookingsApi.cancel,
    onSuccess: () => {
      toast.success('Booking cancelled')
      qc.invalidateQueries({ queryKey: ['my-bookings'] })
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Cancel failed'),
  })

  const { mutate: leaveWaitlist, isPending: isLeavingWaitlist } = useMutation({
    mutationFn: waitlistApi.leaveWaitlist,
    onSuccess: () => {
      toast.success('Removed from waitlist')
      qc.invalidateQueries({ queryKey: ['my-waitlists'] })
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to leave waitlist'),
  })

  const { mutate: submitReview, isPending: isSubmitting } = useMutation({
    mutationFn: () => reviewsApi.submit({
      bookingId: selectedBooking.id,
      salonRating,
      staffRating,
      comment
    }),
    onSuccess: () => {
      toast.success('Thank you for your review!')
      qc.invalidateQueries({ queryKey: ['my-bookings'] })
      setReviewModal(false)
      setComment('')
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to submit review')
  })

  const openReviewModal = (booking: any) => {
    setSelectedBooking(booking)
    setSalonRating(5)
    setStaffRating(5)
    setComment('')
    setReviewModal(true)
  }

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab })
  }

  const isLoading = activeTab === 'bookings' ? isBookingsLoading : isWaitlistsLoading

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-6">My Appointments</h1>

        {/* Tabs */}
        <div className="flex border-b border-chair-border mb-8">
          <button
            onClick={() => handleTabChange('bookings')}
            className={`pb-4 px-6 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'bookings'
                ? 'border-chair-accent text-chair-accent'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Appointments
          </button>
          <button
            onClick={() => handleTabChange('waitlists')}
            className={`pb-4 px-6 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'waitlists'
                ? 'border-chair-accent text-chair-accent'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Waitlists
          </button>
        </div>

        {isLoading ? (
          <Spinner />
        ) : activeTab === 'bookings' ? (
          !bookings?.length ? (
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
                <div key={b.id} className="card border border-chair-border p-4">
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
                    <span className="text-gray-400">Stylist: <strong className="text-white">{b.staffName || 'Any'}</strong></span>
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
                    {b.status === 'COMPLETED' && (
                      <Button
                        size="sm"
                        onClick={() => openReviewModal(b)}
                      >
                        Leave a Review
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          !waitlists?.length ? (
            <div className="card text-center py-16">
              <ListPlus size={40} className="mx-auto text-gray-700 mb-4" />
              <p className="text-gray-400">No active waitlists.</p>
              <p className="text-sm text-gray-500 mt-1">
                You can join a waitlist from a salon's booking page when no slots are available.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {waitlists.map((w) => (
                <div key={w.id} className="card border border-chair-border p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{w.salonName}</h3>
                      <p className="text-chair-accent text-sm">{w.offeringName}</p>
                    </div>
                    <Badge status={w.status} />
                  </div>

                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-400">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={14} />{w.preferredDate}
                    </span>
                    {(w.preferredTimeStart || w.preferredTimeEnd) && (
                      <span className="flex items-center gap-1.5">
                        <Clock size={14} />
                        {w.preferredTimeStart || 'Anytime'} – {w.preferredTimeEnd || 'Anytime'}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-end mt-4 pt-4 border-t border-chair-border">
                    {w.status === 'PENDING' || w.status === 'NOTIFIED' ? (
                      <Button
                        variant="danger"
                        size="sm"
                        loading={isLeavingWaitlist}
                        onClick={() => leaveWaitlist(w.id)}
                        className="flex items-center gap-1.5"
                      >
                        <Trash2 size={14} />
                        Leave Waitlist
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Review Modal */}
        <Modal open={reviewModal} onClose={() => setReviewModal(false)} title="Write a Review">
          {selectedBooking && (
            <form onSubmit={(e) => { e.preventDefault(); submitReview() }} className="flex flex-col gap-4">
              <div>
                <p className="text-sm text-gray-400">Rate your experience at</p>
                <h4 className="font-semibold text-lg text-white">{selectedBooking.salonName}</h4>
              </div>

              {/* Salon Rating */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-300">Rate the Salon *</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setSalonRating(star)}
                      className="text-yellow-500 transition-transform hover:scale-110"
                    >
                      <Star size={24} fill={star <= salonRating ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Staff Rating */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-300">
                  Rate the Stylist ({selectedBooking.staffName || 'Any'}) *
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setStaffRating(star)}
                      className="text-yellow-500 transition-transform hover:scale-110"
                    >
                      <Star size={24} fill={star <= staffRating ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-300">Comment (Optional)</label>
                <textarea
                  className="input-field min-h-24"
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Share details of your experience..."
                />
              </div>

              <Button type="submit" loading={isSubmitting} className="w-full mt-2">
                Submit Review
              </Button>
            </form>
          )}
        </Modal>
      </div>
    </div>
  )
}

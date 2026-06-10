import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MapPin, Phone, Mail, Clock, ChevronRight, Scissors, Star, Heart } from 'lucide-react'
import { format, addDays } from 'date-fns'
import toast from 'react-hot-toast'
import { salonsApi } from '../../api/salons'
import { reviewsApi } from '../../api/reviews'
import { usersApi } from '../../api/users'
import { useAuthStore } from '../../store/authStore'
import Navbar from '../../components/layout/Navbar'
import Spinner from '../../components/ui/Spinner'
import Button from '../../components/ui/Button'

export default function SalonDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { isAuthenticated } = useAuthStore()
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))

  const { data: salon, isLoading: loadingSalon } = useQuery({
    queryKey: ['salon', id],
    queryFn: () => salonsApi.getById(id!),
    enabled: !!id,
  })

  const { data: services, isLoading: loadingServices } = useQuery({
    queryKey: ['salon-services', id],
    queryFn: () => salonsApi.getServices(id!),
    enabled: !!id,
  })

  const { data: reviews } = useQuery({
    queryKey: ['salon-reviews', id],
    queryFn: () => reviewsApi.getSalonReviews(id!),
    enabled: !!id,
  })

  const { data: isFavorite } = useQuery({
    queryKey: ['favorite-status', id],
    queryFn: () => usersApi.getFavoriteStatus(id!),
    enabled: !!id && isAuthenticated(),
  })

  const { mutate: toggleFavorite } = useMutation({
    mutationFn: () => isFavorite ? usersApi.removeFavorite(id!) : usersApi.addFavorite(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['favorite-status', id] })
      qc.invalidateQueries({ queryKey: ['my-favorites'] })
      toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Action failed')
    },
  })

  const averageRating = reviews?.length
    ? (reviews.reduce((acc, r) => acc + r.salonRating, 0) / reviews.length).toFixed(1)
    : null

  const dates = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i))

  if (loadingSalon) return <div className="min-h-screen"><Navbar /><Spinner /></div>
  if (!salon) return <div className="min-h-screen"><Navbar /><p className="text-center py-20 text-gray-500">Salon not found</p></div>

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="card mb-6">
          <div className="flex gap-6">
            <div className="w-24 h-24 bg-chair-surface rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
              {salon.imageUrl
                ? <img src={salon.imageUrl} alt={salon.name} className="w-full h-full object-cover" />
                : <Scissors size={28} className="text-gray-600" />
              }
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold">{salon.name}</h1>
                  <div className="flex items-center gap-3 mt-0.5">
                    {salon.category && (
                      <span className="text-sm text-chair-accent">{salon.category}</span>
                    )}
                    {averageRating && (
                      <span className="flex items-center gap-1 text-xs text-yellow-500 font-semibold bg-yellow-500/10 px-2 py-0.5 rounded">
                        ★ {averageRating} ({reviews?.length})
                      </span>
                    )}
                  </div>
                </div>

                {/* Favorite Heart Toggle Button */}
                {isAuthenticated() && (
                  <button
                    onClick={() => toggleFavorite()}
                    className={`p-2.5 rounded-full border transition-all ${
                      isFavorite
                        ? 'border-red-500/30 bg-red-500/10 text-red-500 hover:bg-red-500/25'
                        : 'border-chair-border hover:border-red-500/40 text-gray-400 hover:text-red-400'
                    }`}
                  >
                    <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-400">
                <span className="flex items-center gap-1"><MapPin size={13} />{salon.address}, {salon.city}</span>
                {salon.phone && <span className="flex items-center gap-1"><Phone size={13} />{salon.phone}</span>}
                {salon.email && <span className="flex items-center gap-1"><Mail size={13} />{salon.email}</span>}
              </div>
              {salon.description && (
                <p className="text-gray-400 text-sm mt-2">{salon.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="card mb-6">
          <h2 className="font-semibold text-lg mb-4">Select a Service</h2>
          {loadingServices ? (
            <Spinner />
          ) : !services?.length ? (
            <p className="text-gray-500 text-sm">No services listed yet.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {services.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedService(s.id)}
                  className={`p-4 rounded-lg border text-left transition-colors
                    ${selectedService === s.id
                      ? 'border-chair-accent bg-chair-accent/10'
                      : 'border-chair-border hover:border-chair-accent/50'}`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-medium">{s.name}</span>
                    <span className="text-chair-accent font-semibold">₹{s.price}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                    <Clock size={11} />
                    {s.duration} min
                  </div>
                  {s.description && <p className="text-xs text-gray-500 mt-1">{s.description}</p>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Date picker */}
        {selectedService && (
          <div className="card mb-6">
            <h2 className="font-semibold text-lg mb-4">Select a Date</h2>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {dates.map((d) => {
                const val = format(d, 'yyyy-MM-dd')
                return (
                  <button
                    key={val}
                    onClick={() => setSelectedDate(val)}
                    className={`flex flex-col items-center px-4 py-3 rounded-lg border transition-colors shrink-0
                      ${selectedDate === val
                        ? 'border-chair-accent bg-chair-accent/10 text-chair-accent'
                        : 'border-chair-border hover:border-chair-accent/50 text-gray-400'}`}
                  >
                    <span className="text-xs">{format(d, 'EEE')}</span>
                    <span className="font-bold text-lg">{format(d, 'd')}</span>
                    <span className="text-xs">{format(d, 'MMM')}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {selectedService && selectedDate && (
          <Button
            className="w-full mb-8"
            onClick={() => navigate(`/salons/${id}/book?serviceId=${selectedService}&date=${selectedDate}`)}
          >
            View Available Slots <ChevronRight size={16} />
          </Button>
        )}

        {/* Reviews Section */}
        <div className="card">
          <h2 className="font-semibold text-lg mb-4">Customer Reviews</h2>
          {!reviews?.length ? (
            <p className="text-gray-500 text-sm">No reviews yet for this salon.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {reviews.map((r) => (
                <div key={r.id} className="border-b border-chair-border pb-4 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-medium text-sm text-white">{r.customerName}</span>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
                        <span className="flex items-center gap-0.5 text-yellow-500">
                          {Array.from({ length: r.salonRating }).map((_, i) => (
                            <Star key={i} size={10} fill="currentColor" className="text-yellow-500" />
                          ))}
                        </span>
                        <span>•</span>
                        <span>Stylist: {r.staffName} (★{r.staffRating})</span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">{format(new Date(r.createdAt), 'MMM d, yyyy')}</span>
                  </div>
                  {r.comment && <p className="text-sm text-gray-300 italic">"{r.comment}"</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

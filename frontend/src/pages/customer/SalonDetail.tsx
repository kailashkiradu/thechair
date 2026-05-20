import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { MapPin, Phone, Mail, Clock, ChevronRight, Scissors } from 'lucide-react'
import { format, addDays } from 'date-fns'
import { salonsApi } from '../../api/salons'
import Navbar from '../../components/layout/Navbar'
import Spinner from '../../components/ui/Spinner'
import Button from '../../components/ui/Button'

export default function SalonDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
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
                  {salon.category && (
                    <span className="text-sm text-chair-accent">{salon.category}</span>
                  )}
                </div>
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
            className="w-full"
            onClick={() => navigate(`/salons/${id}/book?serviceId=${selectedService}&date=${selectedDate}`)}
          >
            View Available Slots <ChevronRight size={16} />
          </Button>
        )}
      </div>
    </div>
  )
}

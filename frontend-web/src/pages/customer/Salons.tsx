import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, MapPin, Scissors, Navigation, Compass } from 'lucide-react'
import toast from 'react-hot-toast'
import { salonsApi } from '../../api/salons'
import Navbar from '../../components/layout/Navbar'
import Spinner from '../../components/ui/Spinner'
import Badge from '../../components/ui/Badge'

export default function Salons() {
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  
  // Geolocation Search States
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null)
  const [radius, setRadius] = useState<number | null>(null)
  const [useLocation, setUseLocation] = useState(false)

  const { data: salons, isLoading } = useQuery({
    queryKey: ['salons', search, coords, radius],
    queryFn: () => salonsApi.getAll({
      query: search || undefined,
      latitude: coords?.latitude,
      longitude: coords?.longitude,
      radius: radius || undefined
    }),
  })

  const handleLocationToggle = () => {
    if (useLocation) {
      setUseLocation(false)
      setCoords(null)
      setRadius(null)
    } else {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude })
          setUseLocation(true)
          toast.success('Current location activated! Results sorted by proximity.')
        },
        () => {
          toast.error('Failed to access location. Please check browser permissions.')
        }
      )
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-extrabold mb-2 text-chair-text">Find a Salon</h1>
        <p className="text-chair-text-muted mb-8 text-sm">Browse verified salons and branches in Chennai. Filter by your proximity.</p>

        <div className="flex flex-col gap-4 mb-8">
          <form
            onSubmit={(e) => { e.preventDefault(); setSearch(query) }}
            className="flex gap-3 max-w-xl"
          >
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-chair-text-muted" />
              <input
                className="input-field pl-10 bg-chair-card/50"
                placeholder="Search by name, area, or category..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary px-6">Search</button>
          </form>

          {/* Geolocation Filter Controls */}
          <div className="flex flex-wrap items-center gap-3.5 max-w-xl">
            <button
              type="button"
              onClick={handleLocationToggle}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                useLocation
                  ? 'bg-chair-accent text-white border-chair-accent shadow-sm'
                  : 'bg-chair-card border-chair-border text-chair-text hover:border-chair-accent/40'
              }`}
            >
              <Navigation size={13} className={useLocation ? 'animate-pulse' : ''} />
              {useLocation ? 'Location Active' : 'Filter by Proximity'}
            </button>

            {useLocation && (
              <div className="flex items-center gap-2 bg-chair-card border border-chair-border rounded-xl px-3 py-1.5 transition-all animate-fadeIn">
                <Compass size={13} className="text-chair-accent" />
                <select
                  className="bg-transparent border-0 text-xs text-chair-text focus:ring-0 p-0 font-medium cursor-pointer"
                  value={radius ?? ''}
                  onChange={(e) => setRadius(e.target.value ? parseFloat(e.target.value) : null)}
                >
                  <option value="" className="bg-chair-card text-chair-text">Any Proximity</option>
                  <option value="5" className="bg-chair-card text-chair-text">Within 5 km</option>
                  <option value="10" className="bg-chair-card text-chair-text">Within 10 km</option>
                  <option value="25" className="bg-chair-card text-chair-text">Within 25 km</option>
                  <option value="50" className="bg-chair-card text-chair-text">Within 50 km</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {isLoading ? (
          <Spinner />
        ) : !salons?.length ? (
          <div className="text-center py-20 text-gray-500">
            <Scissors size={40} className="mx-auto mb-4 opacity-30" />
            <p>No salons found. Try a different search.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {salons.map((salon) => (
              <Link
                key={salon.id}
                to={`/salons/${salon.id}`}
                className="card hover:border-chair-accent/40 hover:-translate-y-0.5 transition-all group block"
              >
                <div className="h-36 bg-chair-surface rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                  {salon.imageUrl ? (
                    <img src={salon.imageUrl} alt={salon.name} className="w-full h-full object-cover" />
                  ) : (
                    <Scissors size={32} className="text-gray-700 group-hover:text-chair-accent transition-colors" />
                  )}
                </div>
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-semibold text-lg text-chair-text">{salon.name}</h3>
                  {salon.category && (
                    <span className="text-xs bg-chair-surface border border-chair-border rounded px-2 py-0.5 text-chair-text-muted font-medium">
                      {salon.category}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-sm text-chair-text-muted mb-3">
                  <div className="flex items-center gap-1 truncate max-w-[70%]">
                    <MapPin size={13} className="shrink-0" />
                    <span className="truncate">{salon.address}, {salon.city}</span>
                  </div>
                  {salon.distance !== undefined && (
                    <span className="text-[11px] font-bold text-chair-accent bg-chair-accent/10 px-2 py-0.5 rounded-full shrink-0 flex items-center gap-0.5">
                      📍 {salon.distance} km
                    </span>
                  )}
                </div>
                {salon.description && (
                  <p className="text-sm text-chair-text-muted/80 line-clamp-2">{salon.description}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

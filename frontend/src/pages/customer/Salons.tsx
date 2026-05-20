import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, MapPin, Scissors } from 'lucide-react'
import { salonsApi } from '../../api/salons'
import Navbar from '../../components/layout/Navbar'
import Spinner from '../../components/ui/Spinner'
import Badge from '../../components/ui/Badge'

export default function Salons() {
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')

  const { data: salons, isLoading } = useQuery({
    queryKey: ['salons', search],
    queryFn: () => salonsApi.getAll(search || undefined),
  })

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-2">Find a Salon</h1>
        <p className="text-gray-400 mb-8">Browse verified salons in Chennai and book your slot.</p>

        <form
          onSubmit={(e) => { e.preventDefault(); setSearch(query) }}
          className="flex gap-3 mb-10 max-w-xl"
        >
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              className="input-field pl-10"
              placeholder="Search by name, area, or category..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary px-5">Search</button>
        </form>

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
                  <h3 className="font-semibold text-lg">{salon.name}</h3>
                  {salon.category && (
                    <span className="text-xs bg-chair-surface border border-chair-border rounded px-2 py-0.5 text-gray-400">
                      {salon.category}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-400 mb-3">
                  <MapPin size={13} />
                  {salon.address}, {salon.city}
                </div>
                {salon.description && (
                  <p className="text-sm text-gray-500 line-clamp-2">{salon.description}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

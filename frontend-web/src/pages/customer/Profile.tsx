import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { User, Phone, Mail, Calendar, Heart, ShieldAlert, Award, ShieldCheck, Pencil, Scissors } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { usersApi } from '../../api/users'
import { useAuthStore } from '../../store/authStore'
import Navbar from '../../components/layout/Navbar'
import Spinner from '../../components/ui/Spinner'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import { Link } from 'react-router-dom'

export default function Profile() {
  const qc = useQueryClient()
  const { user, token, setAuth } = useAuthStore()
  const [editModal, setEditModal] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '' })

  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ['profile'],
    queryFn: usersApi.getProfile,
  })

  const { data: favorites, isLoading: loadingFavorites } = useQuery({
    queryKey: ['my-favorites'],
    queryFn: usersApi.getFavorites,
  })

  const { mutate: updateProfile, isPending: updating } = useMutation({
    mutationFn: () => usersApi.updateProfile(form),
    onSuccess: (updatedUser) => {
      toast.success('Profile updated successfully!')
      // Update global auth store
      setAuth(token!, {
        ...user!,
        name: updatedUser.name,
      })
      qc.invalidateQueries({ queryKey: ['profile'] })
      setEditModal(false)
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update profile')
    },
  })

  const { mutate: removeFavorite } = useMutation({
    mutationFn: usersApi.removeFavorite,
    onSuccess: () => {
      toast.success('Removed from favorites')
      qc.invalidateQueries({ queryKey: ['my-favorites'] })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to remove favorite')
    },
  })

  const openEditModal = () => {
    if (profile) {
      setForm({ name: profile.name, phone: profile.phone || '' })
      setEditModal(true)
    }
  }

  const getWarningMeterColor = (count: number) => {
    if (count === 1) return 'bg-yellow-500'
    if (count === 2) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const joinedDate = profile?.createdAt ? format(new Date(profile.createdAt), 'MMMM d, yyyy') : ''

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-extrabold text-white mb-8">My Profile</h1>

        {loadingProfile ? (
          <Spinner />
        ) : !profile ? (
          <div className="card text-center py-12">
            <p className="text-gray-400">Failed to load profile details.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Personal details & Security Meter */}
            <div className="flex flex-col gap-6">
              {/* Profile Card */}
              <div className="card p-6 border border-chair-border flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-chair-accent/10 border-2 border-chair-accent flex items-center justify-center mb-4 text-chair-accent shadow-lg shadow-chair-accent/5">
                  <User size={36} />
                </div>
                <h2 className="text-xl font-bold text-white mb-0.5">{profile.name}</h2>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-chair-surface border border-chair-border text-chair-accent tracking-wider uppercase">
                  {profile.role}
                </span>

                <div className="w-full border-t border-chair-border/40 my-5 pt-5 flex flex-col gap-3.5 text-left text-sm text-gray-400">
                  <div className="flex items-center gap-2.5">
                    <Mail size={16} className="text-gray-500 shrink-0" />
                    <span className="truncate text-gray-300">{profile.email}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Phone size={16} className="text-gray-500 shrink-0" />
                    <span className="text-gray-300">{profile.phone || 'No phone number linked'}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Calendar size={16} className="text-gray-500 shrink-0" />
                    <span className="text-gray-300">Joined {joinedDate}</span>
                  </div>
                </div>

                <Button onClick={openEditModal} size="sm" variant="secondary" className="w-full mt-2 flex items-center justify-center gap-1.5">
                  <Pencil size={14} /> Edit Profile
                </Button>
              </div>

              {/* Warning & Restrictions Meter */}
              <div className="card p-6 border border-chair-border">
                <h3 className="font-bold text-base text-white mb-4 flex items-center gap-2">
                  {profile.restricted ? (
                    <ShieldAlert className="text-red-500" size={18} />
                  ) : (
                    <ShieldCheck className="text-chair-accent" size={18} />
                  )}
                  Account Status
                </h3>

                {profile.restricted ? (
                  <div className="p-3.5 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-xs leading-relaxed">
                    <strong className="text-red-400 block mb-1">Restricted Account</strong>
                    Your account has been locked from scheduling online appointments due to 3 or more no-shows. Please contact the salon admin to restore booking access.
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">No-Show Warnings</span>
                      <span className="font-bold text-white">{profile.noShowCount} / 3</span>
                    </div>

                    {/* Progress Bar Meter */}
                    <div className="w-full h-2 rounded bg-chair-surface overflow-hidden">
                      <div
                        className={`h-full rounded transition-all duration-500 ${getWarningMeterColor(profile.noShowCount)}`}
                        style={{ width: `${(profile.noShowCount / 3) * 100}%` }}
                      />
                    </div>

                    {profile.noShowCount === 0 ? (
                      <p className="text-[11px] text-gray-500 leading-normal">
                        Good standing! You have no warnings. Always remember to cancel bookings ahead of time if you cannot make it.
                      </p>
                    ) : profile.noShowCount === 1 ? (
                      <p className="text-[11px] text-yellow-500/85 leading-normal">
                        You have 1 warning. Accounts with 3 no-shows will be locked from booking appointments online.
                      </p>
                    ) : (
                      <p className="text-[11px] text-orange-500/85 leading-normal font-medium">
                        Critical Warning: 2 no-shows! One more missed appointment will lock your account from online bookings.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Statistics Grid & Favorites list */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="card p-4 border border-chair-border text-center">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Total Bookings</p>
                  <p className="text-2xl font-extrabold text-white mt-1.5">{profile.totalBookings ?? 0}</p>
                </div>
                <div className="card p-4 border border-chair-border text-center">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Completed</p>
                  <p className="text-2xl font-extrabold text-green-500 mt-1.5">
                    {((profile.totalBookings ?? 0) - (profile.cancelledBookings ?? 0) - (profile.noShowBookings ?? 0))}
                  </p>
                </div>
                <div className="card p-4 border border-chair-border text-center">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Cancelled</p>
                  <p className="text-2xl font-extrabold text-red-400 mt-1.5">{profile.cancelledBookings ?? 0}</p>
                </div>
                <div className="card p-4 border border-chair-border text-center">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">No-shows</p>
                  <p className="text-2xl font-extrabold text-yellow-500 mt-1.5">{profile.noShowBookings ?? 0}</p>
                </div>
              </div>

              {/* Favorites list */}
              <div className="card p-6 border border-chair-border flex-1">
                <h3 className="font-bold text-lg text-white mb-6 flex items-center gap-2">
                  <Heart className="text-red-500 fill-red-500" size={20} />
                  Favorite Salons
                </h3>

                {loadingFavorites ? (
                  <Spinner />
                ) : !favorites?.length ? (
                  <div className="text-center py-16 flex flex-col items-center">
                    <Heart size={36} className="text-gray-700 mb-3" />
                    <p className="text-gray-400 text-sm mb-1 font-medium">No favorite salons yet</p>
                    <p className="text-xs text-gray-500 mb-5">Keep track of your go-to salons by adding them to favorites.</p>
                    <Link to="/salons" className="btn-primary text-xs px-4 py-2">
                      Find Salons
                    </Link>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {favorites.map((s) => (
                      <div key={s.id} className="border border-chair-border rounded-xl p-4 bg-chair-surface/20 flex gap-4 hover:border-chair-accent/30 transition-all group relative">
                        <Link to={`/salons/${s.id}`} className="w-16 h-16 rounded-lg bg-chair-surface flex items-center justify-center overflow-hidden shrink-0">
                          {s.imageUrl ? (
                            <img src={s.imageUrl} alt={s.name} className="w-full h-full object-cover" />
                          ) : (
                            <Scissors size={20} className="text-gray-600" />
                          )}
                        </Link>
                        <div className="flex-1 min-w-0 pr-8">
                          <Link to={`/salons/${s.id}`} className="font-bold text-white text-sm group-hover:text-chair-accent transition-colors block truncate">
                            {s.name}
                          </Link>
                          <p className="text-[10px] text-chair-accent mt-0.5 font-medium">{s.category || 'Beauty Salon'}</p>
                          <p className="text-xs text-gray-400 truncate mt-1">{s.address}, {s.city}</p>
                        </div>

                        {/* Heart icon button to remove from favorites */}
                        <button
                          onClick={() => removeFavorite(s.id)}
                          className="absolute top-4 right-4 text-red-500 hover:text-gray-400 transition-colors p-1"
                          title="Remove from favorites"
                        >
                          <Heart size={16} className="fill-red-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      <Modal open={editModal} onClose={() => setEditModal(false)} title="Edit Profile Details">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            updateProfile()
          }}
          className="flex flex-col gap-4"
        >
          <Input
            label="Name *"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
            placeholder="e.g. Kailash Kiradu"
          />

          <Input
            label="Phone Number"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            placeholder="e.g. 9876543210"
          />

          <Button type="submit" loading={updating} className="w-full mt-2">
            Save Changes
          </Button>
        </form>
      </Modal>
    </div>
  )
}

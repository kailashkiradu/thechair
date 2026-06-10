import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Trash2, Plus, Calendar, Clock, Camera, Image } from 'lucide-react'
import toast from 'react-hot-toast'
import { ownerApi } from '../../api/owner'
import OwnerLayout from '../../components/layout/OwnerLayout'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'
import Modal from '../../components/ui/Modal'

const CATEGORIES = ['UNISEX', 'MENS', 'WOMENS', 'SPA', 'BARBERSHOP']

export default function SalonSetup() {
  const qc = useQueryClient()
  const [activeTab, setActiveTab] = useState<'details' | 'gallery' | 'exceptions'>('details')
  const [form, setForm] = useState({
    name: '', description: '', address: '', city: '', phone: '', email: '', category: 'UNISEX', imageUrl: '',
  })

  // Gallery states
  const [galleryModal, setGalleryModal] = useState(false)
  const [galleryForm, setGalleryForm] = useState({ imageUrl: '', imageType: 'INTERIOR', description: '' })

  // Exceptions states
  const [exceptionModal, setExceptionModal] = useState(false)
  const [exceptionForm, setExceptionForm] = useState({ exceptionDate: '', isClosed: true, openTime: '', closeTime: '', reason: '' })

  const { data: salon, isLoading } = useQuery({
    queryKey: ['owner-salon'],
    queryFn: ownerApi.getSalon,
    retry: false,
  })

  // Gallery queries & mutations
  const { data: galleryItems, isLoading: loadingGallery } = useQuery({
    queryKey: ['owner-gallery'],
    queryFn: ownerApi.getGalleryItems,
    enabled: activeTab === 'gallery'
  })

  const { mutate: addGallery, isPending: addingGallery } = useMutation({
    mutationFn: ownerApi.addGalleryItem,
    onSuccess: () => {
      toast.success('Gallery photo added!')
      qc.invalidateQueries({ queryKey: ['owner-gallery'] })
      setGalleryModal(false)
      setGalleryForm({ imageUrl: '', imageType: 'INTERIOR', description: '' })
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to add image'),
  })

  const { mutate: deleteGallery } = useMutation({
    mutationFn: ownerApi.deleteGalleryItem,
    onSuccess: () => {
      toast.success('Image removed')
      qc.invalidateQueries({ queryKey: ['owner-gallery'] })
    },
    onError: () => toast.error('Failed to remove image'),
  })

  // Exceptions queries & mutations
  const { data: exceptions, isLoading: loadingExceptions } = useQuery({
    queryKey: ['owner-exceptions'],
    queryFn: ownerApi.getSalonExceptions,
    enabled: activeTab === 'exceptions'
  })

  const { mutate: addException, isPending: addingException } = useMutation({
    mutationFn: () => ownerApi.addSalonException({
      exceptionDate: exceptionForm.exceptionDate,
      isClosed: exceptionForm.isClosed,
      openTime: exceptionForm.isClosed ? null : exceptionForm.openTime,
      closeTime: exceptionForm.isClosed ? null : exceptionForm.closeTime,
      reason: exceptionForm.reason
    }),
    onSuccess: () => {
      toast.success('Salon exception added!')
      qc.invalidateQueries({ queryKey: ['owner-exceptions'] })
      setExceptionModal(false)
      setExceptionForm({ exceptionDate: '', isClosed: true, openTime: '', closeTime: '', reason: '' })
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to add exception'),
  })

  const { mutate: deleteException } = useMutation({
    mutationFn: ownerApi.deleteSalonException,
    onSuccess: () => {
      toast.success('Exception removed')
      qc.invalidateQueries({ queryKey: ['owner-exceptions'] })
    },
    onError: () => toast.error('Failed to remove exception'),
  })

  useEffect(() => {
    if (salon) setForm({
      name: salon.name ?? '',
      description: salon.description ?? '',
      address: salon.address ?? '',
      city: salon.city ?? '',
      phone: salon.phone ?? '',
      email: salon.email ?? '',
      category: salon.category ?? 'UNISEX',
      imageUrl: salon.imageUrl ?? '',
    })
  }, [salon])

  const { mutate: save, isPending } = useMutation({
    mutationFn: () => salon ? ownerApi.updateSalon(form) : ownerApi.createSalon(form),
    onSuccess: () => {
      toast.success(salon ? 'Salon updated!' : 'Salon registered! Awaiting approval.')
      qc.invalidateQueries({ queryKey: ['owner-salon'] })
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  })

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }))

  if (isLoading) return <OwnerLayout><Spinner /></OwnerLayout>

  return (
    <OwnerLayout>
      <div>
        <h1 className="text-2xl font-bold mb-1">{salon ? salon.name : 'Register Your Salon'}</h1>
        <p className="text-gray-400 text-sm mb-6">Configure your salon details, manage portfolio gallery, and exceptions schedule.</p>

        {/* Tab selection bar */}
        <div className="flex border-b border-chair-border mb-6">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors
              ${activeTab === 'details' ? 'border-chair-accent text-chair-accent' : 'border-transparent text-gray-400 hover:text-white'}`}
          >
            Salon Details
          </button>
          <button
            onClick={() => setActiveTab('gallery')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors
              ${activeTab === 'gallery' ? 'border-chair-accent text-chair-accent' : 'border-transparent text-gray-400 hover:text-white'}`}
          >
            Gallery Showcase
          </button>
          <button
            onClick={() => setActiveTab('exceptions')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors
              ${activeTab === 'exceptions' ? 'border-chair-accent text-chair-accent' : 'border-transparent text-gray-400 hover:text-white'}`}
          >
            Holidays & Closed Days
          </button>
        </div>

        {/* Tab 1: Details */}
        {activeTab === 'details' && (
          <form onSubmit={(e) => { e.preventDefault(); save() }} className="card flex flex-col gap-4 max-w-lg">
            <Input label="Salon Name *" value={form.name} onChange={set('name')} required placeholder="e.g. Style Studio" />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-300">Description</label>
              <textarea
                className="input-field resize-none"
                rows={3}
                value={form.description}
                onChange={set('description')}
                placeholder="Brief description of your salon..."
              />
            </div>

            <Input label="Address *" value={form.address} onChange={set('address')} required placeholder="123 Anna Salai" />
            <Input label="City *" value={form.city} onChange={set('city')} required placeholder="Chennai" />
            <Input label="Phone" type="tel" value={form.phone} onChange={set('phone')} placeholder="9876543210" />
            <Input label="Email" type="email" value={form.email} onChange={set('email')} placeholder="salon@example.com" />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-300">Category</label>
              <select
                className="input-field"
                value={form.category}
                onChange={set('category')}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <Input label="Image URL" value={form.imageUrl} onChange={set('imageUrl')} placeholder="https://..." />

            <Button type="submit" loading={isPending} className="w-full mt-2">
              {salon ? 'Save Changes' : 'Register Salon'}
            </Button>
          </form>
        )}

        {/* Tab 2: Gallery */}
        {activeTab === 'gallery' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold">Gallery Photos</h2>
                <p className="text-gray-400 text-sm">Manage image uploads showcasing your salon interior, styling work, and spa areas.</p>
              </div>
              <Button onClick={() => setGalleryModal(true)} size="sm">
                <Plus size={15} /> Add Image
              </Button>
            </div>

            {loadingGallery ? <Spinner /> : !galleryItems?.length ? (
              <div className="card text-center py-12">
                <Image size={36} className="mx-auto text-gray-700 mb-3" />
                <p className="text-gray-400 font-medium">No showcase photos added yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {galleryItems.map((item: any) => (
                  <div key={item.id} className="card p-2 border border-chair-border flex flex-col group relative overflow-hidden">
                    <div className="aspect-[4/3] rounded bg-chair-surface overflow-hidden">
                      <img src={item.imageUrl} alt={item.description} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <div className="mt-2 flex-1">
                      <span className="text-[10px] uppercase font-bold text-chair-accent tracking-wider bg-chair-surface border border-chair-border px-1.5 py-0.5 rounded">
                        {item.imageType}
                      </span>
                      {item.description && <p className="text-xs text-gray-400 mt-1 truncate">{item.description}</p>}
                    </div>
                    <button
                      onClick={() => {
                        if (confirm('Delete this image?')) deleteGallery(item.id)
                      }}
                      className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white rounded p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Exceptions */}
        {activeTab === 'exceptions' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold">Closed Days & Working Hours Exceptions</h2>
                <p className="text-gray-400 text-sm">Override regular business hours for holidays, closures, or emergency events.</p>
              </div>
              <Button onClick={() => setExceptionModal(true)} size="sm">
                <Plus size={15} /> Add Exception
              </Button>
            </div>

            {loadingExceptions ? <Spinner /> : !exceptions?.length ? (
              <div className="card text-center py-12">
                <Calendar size={36} className="mx-auto text-gray-700 mb-3" />
                <p className="text-gray-400 font-medium">No working exceptions registered.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3 max-w-xl">
                {exceptions.map((exc: any) => (
                  <div key={exc.id} className="card p-4 border border-chair-border flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{exc.exceptionDate}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium border
                          ${exc.closed
                            ? 'bg-red-900/30 text-red-500 border-red-900/50'
                            : 'bg-green-950/30 text-green-500 border-green-900/50'}`}>
                          {exc.closed ? 'CLOSED' : `OPEN: ${exc.openTime.substring(0, 5)} - ${exc.closeTime.substring(0, 5)}`}
                        </span>
                        {exc.reason && <span className="text-xs text-gray-400">({exc.reason})</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm('Remove this exception?')) deleteException(exc.id)
                      }}
                      className="text-gray-400 hover:text-red-500 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Gallery Modal */}
        <Modal open={galleryModal} onClose={() => setGalleryModal(false)} title="Add Gallery Image">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              addGallery(galleryForm)
            }}
            className="flex flex-col gap-4"
          >
            <Input
              label="Image URL *"
              value={galleryForm.imageUrl}
              onChange={(e) => setGalleryForm((f) => ({ ...f, imageUrl: e.target.value }))}
              required
              placeholder="https://images.unsplash.com/..."
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-300">Category *</label>
              <select
                className="input-field"
                value={galleryForm.imageType}
                onChange={(e) => setGalleryForm((f) => ({ ...f, imageType: e.target.value }))}
              >
                {['INTERIOR', 'BEFORE_AFTER', 'HAIR', 'NAILS', 'SPA'].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <Input
              label="Description"
              value={galleryForm.description}
              onChange={(e) => setGalleryForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="e.g. Clean interior lounge"
            />
            <Button type="submit" loading={addingGallery} className="w-full mt-2">
              Add Photo
            </Button>
          </form>
        </Modal>

        {/* Exception Modal */}
        <Modal open={exceptionModal} onClose={() => setExceptionModal(false)} title="Add Calendar Exception">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              addException()
            }}
            className="flex flex-col gap-4"
          >
            <Input
              type="date"
              label="Exception Date *"
              value={exceptionForm.exceptionDate}
              onChange={(e) => setExceptionForm((f) => ({ ...f, exceptionDate: e.target.value }))}
              required
            />
            <div className="flex items-center gap-2 my-1">
              <input
                type="checkbox"
                id="isClosed"
                checked={exceptionForm.isClosed}
                onChange={(e) => setExceptionForm((f) => ({ ...f, isClosed: e.target.checked }))}
                className="rounded border-chair-border text-chair-accent focus:ring-chair-accent bg-chair-surface"
              />
              <label htmlFor="isClosed" className="text-sm text-gray-300 font-medium">Salon is closed all day</label>
            </div>

            {!exceptionForm.isClosed && (
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="time"
                  label="Opening Time *"
                  value={exceptionForm.openTime}
                  onChange={(e) => setExceptionForm((f) => ({ ...f, openTime: e.target.value }))}
                  required
                />
                <Input
                  type="time"
                  label="Closing Time *"
                  value={exceptionForm.closeTime}
                  onChange={(e) => setExceptionForm((f) => ({ ...f, closeTime: e.target.value }))}
                  required
                />
              </div>
            )}

            <Input
              label="Reason / Notes"
              value={exceptionForm.reason}
              onChange={(e) => setExceptionForm((f) => ({ ...f, reason: e.target.value }))}
              placeholder="e.g. Diwali Holiday, Renovation"
            />

            <Button type="submit" loading={addingException} className="w-full mt-2">
              Create Exception
            </Button>
          </form>
        </Modal>
      </div>
    </OwnerLayout>
  )
}

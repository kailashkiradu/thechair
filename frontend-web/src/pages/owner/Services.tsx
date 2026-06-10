import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, Scissors, Layers } from 'lucide-react'
import toast from 'react-hot-toast'
import { ownerApi } from '../../api/owner'
import { Offering } from '../../types'
import OwnerLayout from '../../components/layout/OwnerLayout'
import Spinner from '../../components/ui/Spinner'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'

const emptyForm = { name: '', description: '', duration: 30, price: 0 }

export default function Services() {
  const qc = useQueryClient()
  const [activeTab, setActiveTab] = useState<'single' | 'combo'>('single')

  // Single service modal state
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Offering | null>(null)
  const [form, setForm] = useState(emptyForm)

  // Combo package modal state
  const [packageModal, setPackageModal] = useState(false)
  const [editingPackage, setEditingPackage] = useState<any | null>(null)
  const [packageForm, setPackageForm] = useState({
    name: '', description: '', price: 0, offeringIds: [] as string[]
  })

  // Queries
  const { data: services, isLoading } = useQuery({
    queryKey: ['owner-services'],
    queryFn: ownerApi.getServices,
  })

  const { data: packages, isLoading: loadingPackages } = useQuery({
    queryKey: ['owner-packages'],
    queryFn: ownerApi.getServicePackages,
    enabled: activeTab === 'combo'
  })

  // Single service mutations
  const { mutate: save, isPending } = useMutation({
    mutationFn: () => editing
      ? ownerApi.updateService(editing.id, form)
      : ownerApi.addService(form),
    onSuccess: () => {
      toast.success(editing ? 'Service updated!' : 'Service added!')
      qc.invalidateQueries({ queryKey: ['owner-services'] })
      setModal(false)
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  })

  const { mutate: del } = useMutation({
    mutationFn: ownerApi.deleteService,
    onSuccess: () => {
      toast.success('Service removed')
      qc.invalidateQueries({ queryKey: ['owner-services'] })
    },
  })

  // Combo package mutations
  const { mutate: savePackage, isPending: savingPackage } = useMutation({
    mutationFn: () => editingPackage
      ? ownerApi.updateServicePackage(editingPackage.id, packageForm)
      : ownerApi.addServicePackage(packageForm),
    onSuccess: () => {
      toast.success(editingPackage ? 'Combo package updated!' : 'Combo package added!')
      qc.invalidateQueries({ queryKey: ['owner-packages'] })
      setPackageModal(false)
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to save package'),
  })

  const { mutate: deletePackage } = useMutation({
    mutationFn: ownerApi.deleteServicePackage,
    onSuccess: () => {
      toast.success('Combo package removed')
      qc.invalidateQueries({ queryKey: ['owner-packages'] })
    },
    onError: () => toast.error('Failed to remove combo package'),
  })

  // Modal helpers
  const openAdd = () => { setEditing(null); setForm(emptyForm); setModal(true) }
  const openEdit = (s: Offering) => {
    setEditing(s)
    setForm({ name: s.name, description: s.description ?? '', duration: s.duration, price: s.price })
    setModal(true)
  }

  const openAddPackage = () => {
    setEditingPackage(null)
    setPackageForm({ name: '', description: '', price: 0, offeringIds: [] })
    setPackageModal(true)
  }

  const openEditPackage = (pkg: any) => {
    setEditingPackage(pkg)
    setPackageForm({
      name: pkg.name,
      description: pkg.description ?? '',
      price: pkg.price,
      offeringIds: pkg.offerings.map((o: any) => o.id)
    })
    setPackageModal(true)
  }

  const toggleOfferingSelection = (offeringId: string) => {
    setPackageForm(f => {
      const ids = f.offeringIds.includes(offeringId)
        ? f.offeringIds.filter(id => id !== offeringId)
        : [...f.offeringIds, offeringId]
      return { ...f, offeringIds: ids }
    })
  }

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }))

  const activeServices = services?.filter(s => s.active) ?? []

  return (
    <OwnerLayout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Services & Packages</h1>
            <p className="text-gray-400 text-sm mt-0.5">Manage what offerings and combo package deals your salon sells.</p>
          </div>
          {activeTab === 'single' ? (
            <Button onClick={openAdd} size="sm">
              <Plus size={15} /> Add Service
            </Button>
          ) : (
            <Button onClick={openAddPackage} size="sm" disabled={activeServices.length === 0}>
              <Plus size={15} /> Create Combo
            </Button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-chair-border mb-6">
          <button
            onClick={() => setActiveTab('single')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors
              ${activeTab === 'single' ? 'border-chair-accent text-chair-accent' : 'border-transparent text-gray-400 hover:text-white'}`}
          >
            Single Offerings
          </button>
          <button
            onClick={() => setActiveTab('combo')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors
              ${activeTab === 'combo' ? 'border-chair-accent text-chair-accent' : 'border-transparent text-gray-400 hover:text-white'}`}
          >
            Combo Packages
          </button>
        </div>

        {/* Tab 1: Single Offerings */}
        {activeTab === 'single' && (
          isLoading ? <Spinner /> : !activeServices.length ? (
            <div className="card text-center py-16">
              <Scissors size={36} className="mx-auto text-gray-700 mb-3" />
              <p className="text-gray-400 mb-4">No services added yet.</p>
              <Button onClick={openAdd} size="sm"><Plus size={15} /> Add First Service</Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {activeServices.map((s) => (
                <div key={s.id} className="card flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{s.name}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{s.duration} min · ₹{s.price}</p>
                    {s.description && <p className="text-xs text-gray-600 mt-1">{s.description}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(s)} className="p-2 text-gray-400 hover:text-white transition-colors">
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this service?')) del(s.id)
                      }}
                      className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Tab 2: Combo Packages */}
        {activeTab === 'combo' && (
          loadingPackages ? <Spinner /> : !packages?.length ? (
            <div className="card text-center py-16">
              <Layers size={36} className="mx-auto text-gray-700 mb-3" />
              <p className="text-gray-400 mb-4">No combo packages configured yet.</p>
              <Button onClick={openAddPackage} size="sm" disabled={activeServices.length === 0}>
                <Plus size={15} /> Create First Package
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {packages.map((pkg: any) => (
                <div key={pkg.id} className="card border border-chair-border p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-lg text-white">{pkg.name}</h3>
                    {pkg.description && <p className="text-sm text-gray-400 mt-1">{pkg.description}</p>}
                    <div className="flex items-center gap-3 mt-3">
                      <span className="text-sm text-chair-accent font-semibold">₹{pkg.price}</span>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-500">{pkg.duration} mins total</span>
                    </div>
                    {/* Offerings list */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {pkg.offerings.map((o: any) => (
                        <span key={o.id} className="text-[10px] bg-chair-surface border border-chair-border text-gray-300 px-2 py-0.5 rounded">
                          {o.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => openEditPackage(pkg)} className="p-2 text-gray-400 hover:text-white transition-colors">
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Delete this combo package?')) deletePackage(pkg.id)
                      }}
                      className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Single Service Modal */}
        <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Service' : 'Add Service'}>
          <form onSubmit={(e) => { e.preventDefault(); save() }} className="flex flex-col gap-4">
            <Input label="Service Name *" value={form.name} onChange={set('name')} required placeholder="e.g. Haircut" />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-300">Description</label>
              <textarea className="input-field resize-none" rows={2} value={form.description} onChange={set('description')} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Duration (min) *" type="number" min={15} value={form.duration} onChange={set('duration')} required />
              <Input label="Price (₹) *" type="number" min={1} value={form.price} onChange={set('price')} required />
            </div>
            <Button type="submit" loading={isPending} className="w-full">
              {editing ? 'Save Changes' : 'Add Service'}
            </Button>
          </form>
        </Modal>

        {/* Combo Package Modal */}
        <Modal open={packageModal} onClose={() => setPackageModal(false)} title={editingPackage ? 'Edit Combo Package' : 'Create Combo Package'}>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (packageForm.offeringIds.length < 2) {
                toast.error('Select at least 2 services for the combo package')
                return
              }
              savePackage()
            }}
            className="flex flex-col gap-4"
          >
            <Input
              label="Package Name *"
              value={packageForm.name}
              onChange={(e) => setPackageForm((f) => ({ ...f, name: e.target.value }))}
              required
              placeholder="e.g. Bridal Makeover Combo"
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-300">Description</label>
              <textarea
                className="input-field resize-none"
                rows={2}
                value={packageForm.description}
                onChange={(e) => setPackageForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="e.g. Complete styling, facial, and nail makeover"
              />
            </div>
            <Input
              label="Combo Price (₹) *"
              type="number"
              min={1}
              value={packageForm.price}
              onChange={(e) => setPackageForm((f) => ({ ...f, price: parseFloat(e.target.value) || 0 }))}
              required
            />

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-300">Select Services (At least 2) *</label>
              <div className="max-h-48 overflow-y-auto border border-chair-border rounded bg-chair-surface p-2 flex flex-col gap-1.5">
                {activeServices.map((s) => {
                  const selected = packageForm.offeringIds.includes(s.id)
                  return (
                    <div
                      key={s.id}
                      onClick={() => toggleOfferingSelection(s.id)}
                      className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors text-sm
                        ${selected ? 'bg-chair-accent/25 border border-chair-accent text-white' : 'hover:bg-chair-card border border-transparent text-gray-400'}`}
                    >
                      <span>{s.name} ({s.duration} min)</span>
                      <span className="font-semibold text-xs">₹{s.price}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            <Button type="submit" loading={savingPackage} className="w-full mt-2">
              {editingPackage ? 'Save Combo' : 'Create Combo'}
            </Button>
          </form>
        </Modal>
      </div>
    </OwnerLayout>
  )
}

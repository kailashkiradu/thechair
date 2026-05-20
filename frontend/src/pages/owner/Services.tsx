import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, Scissors } from 'lucide-react'
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
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Offering | null>(null)
  const [form, setForm] = useState(emptyForm)

  const { data: services, isLoading } = useQuery({
    queryKey: ['owner-services'],
    queryFn: ownerApi.getServices,
  })

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

  const openAdd = () => { setEditing(null); setForm(emptyForm); setModal(true) }
  const openEdit = (s: Offering) => {
    setEditing(s)
    setForm({ name: s.name, description: s.description ?? '', duration: s.duration, price: s.price })
    setModal(true)
  }

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }))

  return (
    <OwnerLayout>
      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Services</h1>
            <p className="text-gray-400 text-sm mt-0.5">Manage what your salon offers.</p>
          </div>
          <Button onClick={openAdd} size="sm">
            <Plus size={15} /> Add Service
          </Button>
        </div>

        {isLoading ? <Spinner /> : !services?.length ? (
          <div className="card text-center py-16">
            <Scissors size={36} className="mx-auto text-gray-700 mb-3" />
            <p className="text-gray-400 mb-4">No services added yet.</p>
            <Button onClick={openAdd} size="sm"><Plus size={15} /> Add First Service</Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {services.filter(s => s.active).map((s) => (
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
                  <button onClick={() => del(s.id)} className="p-2 text-gray-400 hover:text-red-400 transition-colors">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

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
      </div>
    </OwnerLayout>
  )
}

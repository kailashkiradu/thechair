import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { ownerApi } from '../../api/owner'
import OwnerLayout from '../../components/layout/OwnerLayout'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'

const CATEGORIES = ['UNISEX', 'MENS', 'WOMENS', 'SPA', 'BARBERSHOP']

export default function SalonSetup() {
  const qc = useQueryClient()
  const [form, setForm] = useState({
    name: '', description: '', address: '', city: '', phone: '', email: '', category: 'UNISEX', imageUrl: '',
  })

  const { data: salon, isLoading } = useQuery({
    queryKey: ['owner-salon'],
    queryFn: ownerApi.getSalon,
    retry: false,
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
        <h1 className="text-2xl font-bold mb-1">{salon ? 'Edit Salon' : 'Register Your Salon'}</h1>
        <p className="text-gray-400 text-sm mb-8">
          {salon ? 'Update your salon details.' : 'Fill in your salon details. Admin will review and approve within 24-48 hours.'}
        </p>

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
      </div>
    </OwnerLayout>
  )
}

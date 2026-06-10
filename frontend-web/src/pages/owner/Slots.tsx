import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import { format, addDays } from 'date-fns'
import { ownerApi } from '../../api/owner'
import OwnerLayout from '../../components/layout/OwnerLayout'
import Spinner from '../../components/ui/Spinner'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Badge from '../../components/ui/Badge'

export default function Slots() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [form, setForm] = useState({
    offeringId: '', date: format(new Date(), 'yyyy-MM-dd'), startTime: '09:00', endTime: '18:00', staffId: '',
  })

  const { data: services } = useQuery({
    queryKey: ['owner-services'],
    queryFn: ownerApi.getServices,
  })

  const { data: staffList } = useQuery({
    queryKey: ['owner-staff'],
    queryFn: ownerApi.getStaff,
  })

  const { data: slots, isLoading } = useQuery({
    queryKey: ['owner-slots', selectedDate],
    queryFn: () => ownerApi.getSlots(selectedDate),
  })

  const { mutate: generate, isPending } = useMutation({
    mutationFn: () => ownerApi.generateSlots(form),
    onSuccess: (slots) => {
      toast.success(`${slots.length} slots generated!`)
      qc.invalidateQueries({ queryKey: ['owner-slots'] })
      setModal(false)
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  })

  const dates = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i))
  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }))

  return (
    <OwnerLayout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Slots</h1>
            <p className="text-gray-400 text-sm mt-0.5">Generate and manage appointment slots.</p>
          </div>
          <Button onClick={() => setModal(true)} size="sm">
            <Plus size={15} /> Generate Slots
          </Button>
        </div>

        {/* Date tabs */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-6">
          {dates.map((d) => {
            const val = format(d, 'yyyy-MM-dd')
            return (
              <button
                key={val}
                onClick={() => setSelectedDate(val)}
                className={`flex flex-col items-center px-3 py-2 rounded-lg border transition-colors shrink-0 text-xs
                  ${selectedDate === val
                    ? 'border-chair-accent bg-chair-accent/10 text-chair-accent'
                    : 'border-chair-border text-gray-400 hover:border-chair-accent/40'}`}
              >
                <span>{format(d, 'EEE')}</span>
                <span className="font-bold text-base">{format(d, 'd')}</span>
              </button>
            )
          })}
        </div>

        {isLoading ? <Spinner /> : !slots?.length ? (
          <div className="card text-center py-12">
            <Clock size={36} className="mx-auto text-gray-700 mb-3" />
            <p className="text-gray-400 mb-4">No slots for {selectedDate}.</p>
            <Button size="sm" onClick={() => { setForm(f => ({ ...f, date: selectedDate })); setModal(true) }}>
              <Plus size={15} /> Generate Slots for This Date
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {slots.map((slot) => (
              <div
                key={slot.id}
                className={`p-3 rounded-lg border text-sm
                  ${slot.booked
                    ? 'border-chair-border bg-chair-surface opacity-60'
                    : 'border-green-800/60 bg-green-900/10'}`}
              >
                <div className="font-semibold">{slot.startTime} – {slot.endTime}</div>
                <div className="text-xs text-gray-500 mt-0.5">{slot.offeringName}</div>
                <div className="text-xs text-chair-accent mt-0.5">Stylist: {slot.staffName || 'Any'}</div>
                <div className="mt-2">
                  <Badge status={slot.booked ? 'CANCELLED' : 'APPROVED'} />
                </div>
              </div>
            ))}
          </div>
        )}

        <Modal open={modal} onClose={() => setModal(false)} title="Generate Slots">
          <form onSubmit={(e) => { e.preventDefault(); generate() }} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-300">Service *</label>
              <select className="input-field" value={form.offeringId} onChange={set('offeringId')} required>
                <option value="">Select a service</option>
                {services?.filter(s => s.active).map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.duration} min)</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-300">Assign Stylist (Optional)</label>
              <select className="input-field" value={form.staffId} onChange={set('staffId')}>
                <option value="">Any Available Stylist</option>
                {staffList?.filter(s => s.available).map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.specialty || 'General'})</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-300">Date *</label>
              <input
                type="date"
                className="input-field"
                value={form.date}
                min={format(new Date(), 'yyyy-MM-dd')}
                onChange={set('date')}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-300">Start Time *</label>
                <input type="time" className="input-field" value={form.startTime} onChange={set('startTime')} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-300">End Time *</label>
                <input type="time" className="input-field" value={form.endTime} onChange={set('endTime')} required />
              </div>
            </div>
            <p className="text-xs text-gray-500">Slots are auto-generated based on service duration.</p>
            <Button type="submit" loading={isPending} className="w-full">Generate</Button>
          </form>
        </Modal>
      </div>
    </OwnerLayout>
  )
}

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Users, ToggleLeft, ToggleRight, Trash2, Edit2, Calendar, Camera } from 'lucide-react'
import toast from 'react-hot-toast'
import { ownerApi } from '../../api/owner'
import OwnerLayout from '../../components/layout/OwnerLayout'
import Spinner from '../../components/ui/Spinner'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'

const STAFF_PRESETS = [
  { url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80', label: 'Female 1' },
  { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80', label: 'Male 1' },
  { url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80', label: 'Female 2' },
  { url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80', label: 'Male 2' },
  { url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=300&q=80', label: 'Female 3' },
  { url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80', label: 'Male 3' },
]

export default function Staff() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '', specialty: '', experienceYears: 1, photoUrl: ''
  })

  // Leaves management states
  const [selectedStaff, setSelectedStaff] = useState<any | null>(null)
  const [leavesModal, setLeavesModal] = useState(false)
  const [leaveForm, setLeaveForm] = useState({
    leaveDate: '', isFullDay: true, startTime: '', endTime: '', reason: ''
  })

  const { data: staffList, isLoading } = useQuery({
    queryKey: ['owner-staff'],
    queryFn: ownerApi.getStaff,
  })

  const { data: leavesList, refetch: refetchLeaves, isLoading: leavesLoading } = useQuery({
    queryKey: ['staff-leaves', selectedStaff?.id],
    queryFn: () => selectedStaff ? ownerApi.getStaffLeaves(selectedStaff.id) : Promise.resolve([]),
    enabled: !!selectedStaff
  })

  const { mutate: save, isPending } = useMutation({
    mutationFn: (data: typeof form) => {
      if (editingId) {
        return ownerApi.updateStaff(editingId, data)
      }
      return ownerApi.addStaff(data)
    },
    onSuccess: () => {
      toast.success(editingId ? 'Stylist updated!' : 'Stylist added!')
      qc.invalidateQueries({ queryKey: ['owner-staff'] })
      setModal(false)
      resetForm()
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to save stylist'),
  })

  const { mutate: toggleAvailability } = useMutation({
    mutationFn: ownerApi.toggleStaffAvailability,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['owner-staff'] })
      toast.success('Availability updated')
    },
    onError: () => toast.error('Failed to update availability'),
  })

  const { mutate: remove } = useMutation({
    mutationFn: ownerApi.deleteStaff,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['owner-staff'] })
      toast.success('Stylist removed')
    },
    onError: () => toast.error('Failed to remove stylist'),
  })

  const { mutate: logLeave, isPending: loggingLeave } = useMutation({
    mutationFn: (data: typeof leaveForm) => {
      if (!selectedStaff) throw new Error("No stylist selected")
      return ownerApi.addStaffLeave(selectedStaff.id, {
        leaveDate: data.leaveDate,
        startTime: data.isFullDay ? null : data.startTime,
        endTime: data.isFullDay ? null : data.endTime,
        reason: data.reason
      })
    },
    onSuccess: () => {
      toast.success('Leave logged successfully')
      refetchLeaves()
      setLeaveForm({ leaveDate: '', isFullDay: true, startTime: '', endTime: '', reason: '' })
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to log leave')
  })

  const { mutate: removeLeave } = useMutation({
    mutationFn: (leaveId: string) => ownerApi.deleteStaffLeave(leaveId),
    onSuccess: () => {
      toast.success('Leave removed')
      refetchLeaves()
    },
    onError: () => toast.error('Failed to remove leave')
  })

  const resetForm = () => {
    setForm({ name: '', specialty: '', experienceYears: 1, photoUrl: '' })
    setEditingId(null)
  }

  const handleEdit = (s: any) => {
    setEditingId(s.id)
    setForm({
      name: s.name,
      specialty: s.specialty || '',
      experienceYears: s.experienceYears || 1,
      photoUrl: s.photoUrl || ''
    })
    setModal(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this stylist?')) {
      remove(id)
    }
  }

  return (
    <OwnerLayout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Stylists & Staff</h1>
            <p className="text-gray-400 text-sm mt-0.5">Manage your salon's stylists, availability, and scheduled leaves.</p>
          </div>
          <Button onClick={() => { resetForm(); setModal(true) }} size="sm">
            <Plus size={15} /> Add Stylist
          </Button>
        </div>

        {isLoading ? <Spinner /> : !staffList?.length ? (
          <div className="card text-center py-12">
            <Users size={36} className="mx-auto text-gray-700 mb-3" />
            <p className="text-gray-400">No stylists registered yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {staffList.map((s) => (
              <div key={s.id} className="card flex items-start gap-4 p-4 border border-chair-border hover:border-chair-accent/40 transition-colors">
                <div className="w-14 h-14 rounded-full bg-chair-surface border border-chair-border flex items-center justify-center shrink-0 overflow-hidden">
                  {s.photoUrl ? (
                    <img src={s.photoUrl} alt={s.name} className="w-full h-full object-cover" />
                  ) : (
                    <Users size={24} className="text-gray-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-lg truncate">{s.name}</h2>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => handleEdit(s)} className="text-gray-400 hover:text-white p-1">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(s.id)} className="text-gray-400 hover:text-red-500 p-1">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-chair-accent mt-0.5">{s.specialty || 'General Hairstylist'}</p>
                  <p className="text-xs text-gray-400 mt-1">{s.experienceYears} Years Experience</p>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-chair-border">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setSelectedStaff(s)
                        setLeavesModal(true)
                      }}
                    >
                      <Calendar size={14} /> Leaves
                    </Button>
                    <button
                      onClick={() => toggleAvailability(s.id)}
                      className={`flex items-center gap-1 text-sm font-medium transition-colors
                        ${s.available ? 'text-green-500' : 'text-red-500'}`}
                    >
                      {s.available ? (
                        <>
                          <ToggleRight size={20} className="text-green-500" /> Available
                        </>
                      ) : (
                        <>
                          <ToggleLeft size={20} className="text-red-500" /> Unavailable
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Modal open={modal} onClose={() => setModal(false)} title={editingId ? 'Edit Stylist' : 'Add Stylist'}>
          <form onSubmit={(e) => { e.preventDefault(); save(form) }} className="flex flex-col gap-4">
            <Input
              label="Full Name *"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
            />
            <Input
              label="Specialty (e.g., Hair Coloring, Haircuts)"
              value={form.specialty}
              onChange={e => setForm(f => ({ ...f, specialty: e.target.value }))}
              placeholder="e.g. Master Stylist, Color expert"
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-chair-text-muted">Experience (Years)</label>
              <input
                type="number"
                min="0"
                className="input-field"
                value={form.experienceYears}
                onChange={e => setForm(f => ({ ...f, experienceYears: parseInt(e.target.value) || 0 }))}
              />
            </div>

            {/* Photo preview & Presets */}
            <div className="flex flex-col gap-2.5">
              <label className="text-sm font-medium text-chair-text-muted">Profile Photo</label>
              {form.photoUrl ? (
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-chair-accent shadow mx-auto group">
                  <img src={form.photoUrl} alt="Stylist preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, photoUrl: '' }))}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-semibold"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full border border-dashed border-chair-border bg-chair-surface/30 flex flex-col items-center justify-center text-chair-text-muted gap-1 mx-auto">
                  <Camera size={20} />
                  <span className="text-[10px]">No Photo</span>
                </div>
              )}

              <Input
                label="Photo URL"
                value={form.photoUrl}
                onChange={e => setForm(f => ({ ...f, photoUrl: e.target.value }))}
                placeholder="https://images.unsplash.com/..."
              />

              <div className="flex flex-col gap-1.5 mt-1">
                <span className="text-[10px] text-chair-text-muted uppercase tracking-wider font-bold">Select Stylist Photo Preset:</span>
                <div className="grid grid-cols-6 gap-2">
                  {STAFF_PRESETS.map((preset) => (
                    <button
                      key={preset.url}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, photoUrl: preset.url }))}
                      className="border border-chair-border hover:border-chair-accent/40 rounded-full overflow-hidden aspect-square transition-all hover:scale-105"
                      title={preset.label}
                    >
                      <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Button type="submit" loading={isPending} className="w-full mt-2">
              {editingId ? 'Update Stylist' : 'Onboard Stylist'}
            </Button>
          </form>
        </Modal>

        <Modal
          open={leavesModal}
          onClose={() => {
            setLeavesModal(false)
            setSelectedStaff(null)
          }}
          title={`Manage Leaves - ${selectedStaff?.name}`}
        >
          <div className="flex flex-col gap-6 max-h-[75vh] overflow-y-auto pr-1">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                logLeave(leaveForm)
              }}
              className="flex flex-col gap-3 p-4 bg-chair-surface rounded-lg border border-chair-border"
            >
              <h3 className="font-semibold text-sm text-chair-accent">Log New Leave</h3>
              <Input
                type="date"
                label="Date *"
                value={leaveForm.leaveDate}
                onChange={(e) => setLeaveForm((f) => ({ ...f, leaveDate: e.target.value }))}
                required
              />
              <div className="flex items-center gap-2 my-1">
                <input
                  type="checkbox"
                  id="isFullDay"
                  checked={leaveForm.isFullDay}
                  onChange={(e) => setLeaveForm((f) => ({ ...f, isFullDay: e.target.checked }))}
                  className="rounded border-chair-border text-chair-accent focus:ring-chair-accent bg-chair-surface"
                />
                <label htmlFor="isFullDay" className="text-sm text-gray-300">Full Day Leave</label>
              </div>

              {!leaveForm.isFullDay && (
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="time"
                    label="Start Time *"
                    value={leaveForm.startTime}
                    onChange={(e) => setLeaveForm((f) => ({ ...f, startTime: e.target.value }))}
                    required
                  />
                  <Input
                    type="time"
                    label="End Time *"
                    value={leaveForm.endTime}
                    onChange={(e) => setLeaveForm((f) => ({ ...f, endTime: e.target.value }))}
                    required
                  />
                </div>
              )}

              <Input
                label="Reason / Notes"
                value={leaveForm.reason}
                onChange={(e) => setLeaveForm((f) => ({ ...f, reason: e.target.value }))}
                placeholder="e.g. Personal emergency, Vacation"
              />

              <Button type="submit" loading={loggingLeave} size="sm" className="mt-2 w-full">
                Log Leave
              </Button>
            </form>

            <div>
              <h3 className="font-semibold text-sm text-gray-300 mb-3">Scheduled Leaves</h3>
              {leavesLoading ? (
                <Spinner />
              ) : !leavesList?.length ? (
                <p className="text-xs text-gray-500">No leaves logged for this stylist.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {leavesList.map((l: any) => (
                    <div key={l.id} className="flex items-center justify-between p-3 bg-chair-card border border-chair-border rounded-lg text-sm">
                      <div>
                        <div className="font-medium text-white">{l.leaveDate}</div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {l.startTime && l.endTime ? `${l.startTime.substring(0, 5)} - ${l.endTime.substring(0, 5)}` : 'Full Day'}
                        </div>
                        {l.reason && <div className="text-xs text-chair-accent mt-1">{l.reason}</div>}
                      </div>
                      <button
                        onClick={() => removeLeave(l.id)}
                        className="text-gray-400 hover:text-red-500 p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Modal>
      </div>
    </OwnerLayout>
  )
}

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircle, XCircle, Store } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminApi } from '../../api/admin'
import AdminLayout from '../../components/layout/AdminLayout'
import Spinner from '../../components/ui/Spinner'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'

const STATUSES = ['ALL', 'PENDING', 'APPROVED', 'REJECTED']

export default function AdminSalons() {
  const qc = useQueryClient()
  const [filter, setFilter] = useState('ALL')
  const [rejectModal, setRejectModal] = useState<{ id: string; name: string } | null>(null)
  const [reason, setReason] = useState('')

  const { data: salons, isLoading } = useQuery({
    queryKey: ['admin-salons', filter],
    queryFn: () => adminApi.getSalons(filter === 'ALL' ? undefined : filter),
  })

  const { mutate: approve } = useMutation({
    mutationFn: adminApi.approveSalon,
    onSuccess: () => { toast.success('Salon approved!'); qc.invalidateQueries({ queryKey: ['admin-salons'] }) },
  })

  const { mutate: reject, isPending: rejecting } = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => adminApi.rejectSalon(id, reason),
    onSuccess: () => {
      toast.success('Salon rejected')
      qc.invalidateQueries({ queryKey: ['admin-salons'] })
      setRejectModal(null)
      setReason('')
    },
  })

  return (
    <AdminLayout>
      <div>
        <h1 className="text-2xl font-bold mb-1">Salons</h1>
        <p className="text-gray-400 text-sm mb-6">Approve or reject salon registrations.</p>

        <div className="flex gap-2 mb-6">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-1.5 rounded-full text-sm border transition-colors
                ${filter === s ? 'border-chair-accent bg-chair-accent/10 text-chair-accent' : 'border-chair-border text-gray-400 hover:text-white'}`}
            >
              {s}
            </button>
          ))}
        </div>

        {isLoading ? <Spinner /> : !salons?.length ? (
          <div className="card text-center py-16">
            <Store size={36} className="mx-auto text-gray-700 mb-3" />
            <p className="text-gray-400">No salons in this category.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {salons.map((s) => (
              <div key={s.id} className="card">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold">{s.name}</h3>
                      <Badge status={s.status} />
                    </div>
                    <p className="text-sm text-gray-400">{s.address}, {s.city}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Owner: {s.ownerName} · {s.category}</p>
                    {s.rejectionReason && (
                      <p className="text-xs text-red-400 mt-1">Reason: {s.rejectionReason}</p>
                    )}
                  </div>
                  {s.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => approve(s.id)}>
                        <CheckCircle size={14} /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => setRejectModal({ id: s.id, name: s.name })}
                      >
                        <XCircle size={14} /> Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <Modal
          open={!!rejectModal}
          onClose={() => { setRejectModal(null); setReason('') }}
          title={`Reject "${rejectModal?.name}"`}
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-300">Rejection Reason *</label>
              <textarea
                className="input-field resize-none"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain why the salon is being rejected..."
              />
            </div>
            <Button
              variant="danger"
              loading={rejecting}
              className="w-full"
              disabled={!reason.trim()}
              onClick={() => rejectModal && reject({ id: rejectModal.id, reason })}
            >
              Reject Salon
            </Button>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  )
}

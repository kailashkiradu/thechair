import { useQuery } from '@tanstack/react-query'
import { Users, Store, CheckCircle, CalendarCheck } from 'lucide-react'
import { adminApi } from '../../api/admin'
import AdminLayout from '../../components/layout/AdminLayout'
import Spinner from '../../components/ui/Spinner'

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: adminApi.getStats,
  })

  const cards = stats ? [
    { icon: Users, label: 'Total Users', value: stats.totalUsers, color: 'text-blue-400' },
    { icon: Store, label: 'Total Salons', value: stats.totalSalons, color: 'text-purple-400' },
    { icon: Store, label: 'Pending Approval', value: stats.pendingSalons, color: 'text-yellow-400' },
    { icon: CheckCircle, label: 'Approved Salons', value: stats.approvedSalons, color: 'text-green-400' },
    { icon: CalendarCheck, label: 'Total Bookings', value: stats.totalBookings, color: 'text-chair-accent' },
    { icon: CheckCircle, label: 'Completed Bookings', value: stats.completedBookings, color: 'text-green-400' },
  ] : []

  return (
    <AdminLayout>
      <div>
        <h1 className="text-2xl font-bold mb-1">Admin Dashboard</h1>
        <p className="text-gray-400 text-sm mb-8">Platform overview and statistics.</p>

        {isLoading ? (
          <Spinner />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {cards.map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="card">
                <Icon size={22} className={`${color} mb-3`} />
                <div className="text-3xl font-bold mb-1">{value}</div>
                <div className="text-sm text-gray-400">{label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

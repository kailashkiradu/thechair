import { useQuery } from '@tanstack/react-query'
import { Users } from 'lucide-react'
import { adminApi } from '../../api/admin'
import AdminLayout from '../../components/layout/AdminLayout'
import Spinner from '../../components/ui/Spinner'
import Badge from '../../components/ui/Badge'

const roleBadge: Record<string, string> = {
  ADMIN: 'bg-purple-900/40 text-purple-400 border-purple-800',
  OWNER: 'bg-blue-900/40 text-blue-400 border-blue-800',
  CUSTOMER: 'bg-gray-800 text-gray-300 border-gray-700',
}

export default function AdminUsers() {
  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: adminApi.getUsers,
  })

  return (
    <AdminLayout>
      <div>
        <h1 className="text-2xl font-bold mb-1">Users</h1>
        <p className="text-gray-400 text-sm mb-8">All registered users on the platform.</p>

        {isLoading ? <Spinner /> : !users?.length ? (
          <div className="card text-center py-16">
            <Users size={36} className="mx-auto text-gray-700 mb-3" />
            <p className="text-gray-400">No users found.</p>
          </div>
        ) : (
          <div className="card overflow-hidden p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-chair-border">
                  <th className="text-left px-6 py-3 text-gray-400 font-medium">Name</th>
                  <th className="text-left px-6 py-3 text-gray-400 font-medium">Email</th>
                  <th className="text-left px-6 py-3 text-gray-400 font-medium">Phone</th>
                  <th className="text-left px-6 py-3 text-gray-400 font-medium">Role</th>
                  <th className="text-left px-6 py-3 text-gray-400 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.id} className={`border-b border-chair-border last:border-0 ${i % 2 === 0 ? '' : 'bg-chair-surface/50'}`}>
                    <td className="px-6 py-3 font-medium">{u.name}</td>
                    <td className="px-6 py-3 text-gray-400">{u.email}</td>
                    <td className="px-6 py-3 text-gray-400">{u.phone ?? '—'}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${roleBadge[u.role]}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-500 text-xs">
                      {new Date(u.createdAt).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

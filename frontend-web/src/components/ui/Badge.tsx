const colors: Record<string, string> = {
  PENDING: 'bg-yellow-900/40 text-yellow-400 border-yellow-800',
  APPROVED: 'bg-green-900/40 text-green-400 border-green-800',
  REJECTED: 'bg-red-900/40 text-red-400 border-red-800',
  INACTIVE: 'bg-gray-800 text-gray-400 border-gray-700',
  CONFIRMED: 'bg-blue-900/40 text-blue-400 border-blue-800',
  COMPLETED: 'bg-green-900/40 text-green-400 border-green-800',
  CANCELLED: 'bg-red-900/40 text-red-400 border-red-800',
  PAID: 'bg-green-900/40 text-green-400 border-green-800',
  REFUNDED: 'bg-purple-900/40 text-purple-400 border-purple-800',
  NOTIFIED: 'bg-indigo-900/40 text-indigo-400 border-indigo-800',
  BOOKED: 'bg-green-900/40 text-green-400 border-green-800',
  EXPIRED: 'bg-gray-800 text-gray-500 border-gray-700',
  NO_SHOW: 'bg-red-900/40 text-red-400 border-red-800',
}

export default function Badge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
        ${colors[status] ?? 'bg-gray-800 text-gray-400 border-gray-700'}`}
    >
      {status}
    </span>
  )
}

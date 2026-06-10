import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format, subDays } from 'date-fns'
import { Download, Calendar, BarChart3, TrendingUp, TrendingDown, Users, DollarSign, Award, Percent } from 'lucide-react'
import toast from 'react-hot-toast'
import { ownerApi } from '../../api/owner'
import OwnerLayout from '../../components/layout/OwnerLayout'
import Spinner from '../../components/ui/Spinner'
import Button from '../../components/ui/Button'

export default function Analytics() {
  const [rangeMode, setRangeMode] = useState<'7' | '30' | 'custom'>('30')
  const [dates, setDates] = useState({
    startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
  })

  // Date handlers
  const handleRangeChange = (mode: '7' | '30' | 'custom') => {
    setRangeMode(mode)
    if (mode === '7') {
      setDates({
        startDate: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd'),
      })
    } else if (mode === '30') {
      setDates({
        startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd'),
      })
    }
  }

  // API Queries
  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ['analytics-summary', dates.startDate, dates.endDate],
    queryFn: () => ownerApi.getAnalyticsSummary(dates.startDate, dates.endDate),
  })

  const { data: trend, isLoading: loadingTrend } = useQuery({
    queryKey: ['analytics-trend', dates.startDate, dates.endDate],
    queryFn: () => ownerApi.getAnalyticsRevenueTrend(dates.startDate, dates.endDate),
  })

  const { data: stylists, isLoading: loadingStylists } = useQuery({
    queryKey: ['analytics-stylists', dates.startDate, dates.endDate],
    queryFn: () => ownerApi.getAnalyticsStylistPerformance(dates.startDate, dates.endDate),
  })

  const { data: services, isLoading: loadingServices } = useQuery({
    queryKey: ['analytics-services', dates.startDate, dates.endDate],
    queryFn: () => ownerApi.getAnalyticsServicePopularity(dates.startDate, dates.endDate),
  })

  const handleExport = async () => {
    try {
      const blob = await ownerApi.exportAnalyticsCsv(dates.startDate, dates.endDate)
      const url = window.URL.createObjectURL(new Blob([blob]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `bookings-report-${dates.startDate}-to-${dates.endDate}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('Report downloaded successfully!')
    } catch (err) {
      toast.error('Failed to download CSV report')
    }
  }

  const isLoading = loadingSummary || loadingTrend || loadingStylists || loadingServices

  // Revenue SVG Calculations
  const maxRevenue = trend ? Math.max(...trend.map(t => t.revenue), 100) : 100
  const trendPoints = trend
    ? trend.map((item, index) => {
        const x = trend.length > 1 ? (index / (trend.length - 1)) * 430 + 45 : 250
        const y = 160 - (item.revenue / maxRevenue) * 125
        return { x, y, date: item.date, revenue: item.revenue }
      })
    : []

  const trendLinePath = trendPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const trendAreaPath = trendPoints.length > 0
    ? `${trendLinePath} L ${trendPoints[trendPoints.length - 1].x} 160 L ${trendPoints[0].x} 160 Z`
    : ''

  const maxServiceBookings = services ? Math.max(...services.map(s => s.bookingsCount), 1) : 1

  return (
    <OwnerLayout>
      <div className="flex flex-col gap-6">
        {/* Header & Date Selector */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Business Analytics</h1>
            <p className="text-chair-text-muted text-sm mt-0.5">Track revenue, stylist booking count, and download CSV reports.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Range Selectors */}
            <div className="flex bg-chair-surface/50 border border-chair-border p-1 rounded-lg">
              {(['7', '30', 'custom'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => handleRangeChange(m)}
                  className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${
                    rangeMode === m
                      ? 'bg-chair-accent text-white shadow-sm'
                      : 'text-chair-text-muted hover:text-chair-text'
                  }`}
                >
                  {m === '7' ? '7 Days' : m === '30' ? '30 Days' : 'Custom'}
                </button>
              ))}
            </div>

            {/* Custom Dates Inputs */}
            {rangeMode === 'custom' && (
              <div className="flex items-center gap-2 animate-fadeIn">
                <input
                  type="date"
                  className="input-field py-1.5 px-3 text-xs w-32 bg-chair-card"
                  value={dates.startDate}
                  onChange={(e) => setDates((d) => ({ ...d, startDate: e.target.value }))}
                />
                <span className="text-chair-text-muted text-xs">to</span>
                <input
                  type="date"
                  className="input-field py-1.5 px-3 text-xs w-32 bg-chair-card"
                  value={dates.endDate}
                  onChange={(e) => setDates((d) => ({ ...d, endDate: e.target.value }))}
                />
              </div>
            )}

            <Button onClick={handleExport} size="sm" variant="secondary" className="flex items-center gap-1.5">
              <Download size={14} /> Export CSV
            </Button>
          </div>
        </div>

        {isLoading ? (
          <Spinner />
        ) : (
          <>
            {/* KPI Summary Deck */}
            {summary && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Total Revenue */}
                <div className="card p-4 relative overflow-hidden group hover:border-chair-accent/40 transition-colors">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold text-chair-text-muted uppercase tracking-wider">Total Revenue</span>
                    <span className="p-1 rounded-lg bg-chair-accent/10 text-chair-accent">
                      <DollarSign size={16} />
                    </span>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-2xl font-bold text-chair-text">₹{summary.totalRevenue.toLocaleString()}</h3>
                    <p className="text-[10px] text-green-500 font-semibold mt-1 flex items-center gap-0.5">
                      <TrendingUp size={10} /> Completed bookings
                    </p>
                  </div>
                </div>

                {/* Total Bookings */}
                <div className="card p-4 relative overflow-hidden group hover:border-chair-accent/40 transition-colors">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold text-chair-text-muted uppercase tracking-wider">Total Bookings</span>
                    <span className="p-1 rounded-lg bg-blue-500/10 text-blue-500">
                      <BarChart3 size={16} />
                    </span>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-2xl font-bold text-chair-text">{summary.totalBookings}</h3>
                    <p className="text-[10px] text-chair-text-muted mt-1">
                      {summary.completedBookings} Completed · {summary.cancelledBookings} Cancelled
                    </p>
                  </div>
                </div>

                {/* Avg Ticket Size */}
                <div className="card p-4 relative overflow-hidden group hover:border-chair-accent/40 transition-colors">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold text-chair-text-muted uppercase tracking-wider">Avg Ticket Size</span>
                    <span className="p-1 rounded-lg bg-emerald-500/10 text-emerald-500">
                      <Award size={16} />
                    </span>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-2xl font-bold text-chair-text">₹{summary.averageOrderValue}</h3>
                    <p className="text-[10px] text-chair-text-muted mt-1">Average per customer</p>
                  </div>
                </div>

                {/* No-Shows / Waitlist */}
                <div className="card p-4 relative overflow-hidden group hover:border-chair-accent/40 transition-colors">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold text-chair-text-muted uppercase tracking-wider">Active Demand</span>
                    <span className="p-1 rounded-lg bg-red-500/10 text-red-500">
                      <Users size={16} />
                    </span>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-2xl font-bold text-chair-text">
                      {summary.waitlistCount} <span className="text-sm font-medium text-chair-text-muted">Waitlisted</span>
                    </h3>
                    {summary.noShowBookings > 0 ? (
                      <p className="text-[10px] text-red-500 font-semibold mt-1 flex items-center gap-0.5">
                        <TrendingDown size={10} /> {summary.noShowBookings} No-show accounts
                      </p>
                    ) : (
                      <p className="text-[10px] text-green-500 font-semibold mt-1 flex items-center gap-0.5">
                        Perfect attendance history
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Middle Grid: Revenue curve & Popular Services */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Revenue Trend SVG line chart */}
              <div className="card lg:col-span-2 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-base text-chair-text">Revenue Timeline Trend</h3>
                  <span className="text-[11px] font-bold bg-chair-accent/15 text-chair-accent px-2 py-0.5 rounded-full">
                    Max: ₹{maxRevenue.toLocaleString()}
                  </span>
                </div>

                <div className="relative w-full h-[200px] mt-2">
                  {trendPoints.length > 0 ? (
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 500 180" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="rgb(var(--chair-accent))" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="rgb(var(--chair-accent))" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* X grid lines */}
                      {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
                        <line
                          key={ratio}
                          x1={45 + ratio * 430}
                          y1="10"
                          x2={45 + ratio * 430}
                          y2="160"
                          stroke="rgb(var(--chair-border))"
                          strokeDasharray="4 4"
                          strokeWidth="1"
                        />
                      ))}

                      {/* Y Grid lines */}
                      {[10, 50, 90, 130, 160].map((yVal) => (
                        <line
                          key={yVal}
                          x1="45"
                          y1={yVal}
                          x2="475"
                          y2={yVal}
                          stroke="rgb(var(--chair-border))"
                          strokeDasharray="4 4"
                          strokeWidth="1"
                        />
                      ))}

                      {/* Filled Area */}
                      {trendAreaPath && (
                        <path d={trendAreaPath} fill="url(#revGradient)" />
                      )}

                      {/* Smooth Line */}
                      {trendLinePath && (
                        <path
                          d={trendLinePath}
                          fill="none"
                          stroke="rgb(var(--chair-accent))"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                      )}

                      {/* Dots on nodes */}
                      {trendPoints.map((pt, idx) => (
                        <circle
                          key={idx}
                          cx={pt.x}
                          cy={pt.y}
                          r="4"
                          className="fill-chair-surface stroke-chair-accent hover:r-5 cursor-pointer transition-all"
                          strokeWidth="2.5"
                        >
                          <title>{`${pt.date}: ₹${pt.revenue}`}</title>
                        </circle>
                      ))}

                      {/* Axis labels */}
                      <text x="35" y="164" fill="currentColor" className="text-chair-text-muted text-[8px] text-right font-bold" textAnchor="end">₹0</text>
                      <text x="35" y="15" fill="currentColor" className="text-chair-text-muted text-[8px] text-right font-bold" textAnchor="end">₹{maxRevenue >= 1000 ? (maxRevenue / 1000).toFixed(0) + 'k' : maxRevenue}</text>
                    </svg>
                  ) : (
                    <div className="h-full flex items-center justify-center text-chair-text-muted text-xs">
                      No data to chart.
                    </div>
                  )}
                </div>

                {/* SVG dates axis labels */}
                {trendPoints.length > 0 && (
                  <div className="flex justify-between px-10 text-[9px] font-semibold text-chair-text-muted">
                    <span>{trendPoints[0].date.substring(5)}</span>
                    <span>{trendPoints[Math.floor(trendPoints.length / 2)].date.substring(5)}</span>
                    <span>{trendPoints[trendPoints.length - 1].date.substring(5)}</span>
                  </div>
                )}
              </div>

              {/* Service Popularity bar chart list */}
              <div className="card flex flex-col gap-4">
                <h3 className="font-semibold text-base text-chair-text">Top Service Offerings</h3>

                {!services?.length ? (
                  <p className="text-chair-text-muted text-xs text-center py-12">No service demand history.</p>
                ) : (
                  <div className="flex flex-col gap-3.5 mt-2">
                    {services.slice(0, 5).map((srv) => {
                      const percent = (srv.bookingsCount / maxServiceBookings) * 100
                      return (
                        <div key={srv.serviceId} className="flex flex-col gap-1.5">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-chair-text truncate max-w-[65%]">{srv.serviceName}</span>
                            <span className="text-chair-text-muted shrink-0">{srv.bookingsCount} bookings</span>
                          </div>
                          {/* Progress bar container */}
                          <div className="w-full h-2 rounded bg-chair-surface border border-chair-border overflow-hidden">
                            <div
                              style={{ width: `${percent}%` }}
                              className="h-full bg-gradient-to-r from-chair-accent to-chair-accent-dark rounded-r transition-all duration-500"
                            />
                          </div>
                          <span className="text-[10px] font-bold text-chair-accent self-end">₹{srv.totalRevenue.toLocaleString()}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Stylists Leaderboard Table */}
            <div className="card">
              <h3 className="font-semibold text-base text-chair-text mb-4">Stylists performance board</h3>
              {!stylists?.length ? (
                <p className="text-chair-text-muted text-xs text-center py-8">No stylist performance logs found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-chair-border text-chair-text-muted text-xs font-bold uppercase tracking-wider">
                        <th className="pb-3 pl-2">Stylist Name</th>
                        <th className="pb-3 text-center">Total Bookings</th>
                        <th className="pb-3 text-center">Completed Work</th>
                        <th className="pb-3 text-center">Completion %</th>
                        <th className="pb-3 text-right pr-2">Revenue Generated</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-chair-border">
                      {stylists.map((st) => {
                        const rate = st.bookingsCount > 0 ? Math.round((st.completedCount / st.bookingsCount) * 100) : 0
                        return (
                          <tr key={st.staffId} className="hover:bg-chair-surface/30 transition-colors">
                            <td className="py-3.5 pl-2 font-semibold text-chair-text">{st.staffName}</td>
                            <td className="py-3.5 text-center text-chair-text-muted">{st.bookingsCount}</td>
                            <td className="py-3.5 text-center text-chair-text-muted">{st.completedCount}</td>
                            <td className="py-3.5 text-center font-medium">
                              <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                                rate >= 80 
                                  ? 'bg-green-900/20 text-green-500 border-green-800/40' 
                                  : rate >= 50
                                  ? 'bg-amber-900/20 text-amber-500 border-amber-800/40'
                                  : 'bg-red-900/20 text-red-500 border-red-800/40'
                              }`}>
                                {rate}%
                              </span>
                            </td>
                            <td className="py-3.5 text-right font-extrabold text-chair-accent pr-2">₹{st.totalRevenue.toLocaleString()}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </OwnerLayout>
  )
}

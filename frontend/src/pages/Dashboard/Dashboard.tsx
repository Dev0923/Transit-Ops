import { useMemo, useState, useEffect, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { tripService } from '../../services/tripService'
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts'
import { PlusIcon, AlertIcon, RouteIcon, WrenchIcon, UsersIcon, FuelIcon, ShieldIcon, ChevronDownIcon, ClockIcon } from './icons'
import {
  ROLES,
  ROLE_LABEL,
  roleTag,
  KPIS,
  utilizationTrend,
  vehicleStatus,
  costTrend,
  safetyScores,
  licenseAlerts,
  compliance,
  quickActions,
  activity,
  type RoleId,
  type Kpi,
} from './data'

/* --------------------------------------------------------------- */

const accentMap: Record<Kpi['accent'], { fg: string; bg: string }> = {
  navy: { fg: 'text-navy-800', bg: 'bg-navy-50' },
  teal: { fg: 'text-teal-700', bg: 'bg-teal-50' },
  amber: { fg: 'text-amber-600', bg: 'bg-amber-50' },
  red: { fg: 'text-red-600', bg: 'bg-red-50' },
}

function RoleChip({ roles }: { roles: RoleId[] }) {
  return (
    <span className="rounded-full bg-navy-50 px-2 py-0.5 font-mono text-[10px] font-medium tracking-tight text-navy-600">
      {roleTag(roles)}
    </span>
  )
}

function Card({
  title,
  roles,
  children,
  className = '',
  action,
}: {
  title?: string
  roles?: RoleId[]
  children: ReactNode
  className?: string
  action?: ReactNode
}) {
  return (
    <section className={`rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-navy-900/[0.04] ${className}`}>
      {(title || roles) && (
        <header className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-[14px] font-semibold text-navy-900">{title}</h3>
          <div className="flex items-center gap-2">
            {action}
            {roles && <RoleChip roles={roles} />}
          </div>
        </header>
      )}
      {children}
    </section>
  )
}

function TrendPill({ trend, good = true }: { trend: number; good?: boolean }) {
  const positive = trend >= 0
  const isGood = positive === good
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${
        isGood ? 'bg-teal-50 text-teal-700' : 'bg-red-50 text-red-600'
      }`}
    >
      <span className="text-[9px]">{positive ? '▲' : '▼'}</span>
      {Math.abs(trend)}%
    </span>
  )
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  onChange: (v: string) => void
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-medium text-slate-500">{label}</span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-full appearance-none rounded-lg border border-slate-300 bg-white pl-3 pr-8 text-[13px] font-medium text-navy-900 outline-none transition hover:border-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-500/15 sm:w-40"
        >
          {options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
    </label>
  )
}

function ChartTooltip({ active, payload, label, unit = '' }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[12px] shadow-lg">
      <p className="mb-1 font-semibold text-navy-900">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="flex items-center gap-1.5 text-slate-600">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color || p.fill }} />
          <span className="capitalize">{p.name}:</span>
          <span className="font-semibold text-navy-900">
            {p.value}
            {unit}
          </span>
        </p>
      ))}
    </div>
  )
}

/* --------------------------------------------------------------- */

const activityIcon: Record<string, { icon: typeof RouteIcon; cls: string }> = {
  trip: { icon: RouteIcon, cls: 'bg-navy-50 text-navy-700' },
  shop: { icon: WrenchIcon, cls: 'bg-amber-50 text-amber-600' },
  license: { icon: AlertIcon, cls: 'bg-red-50 text-red-600' },
  driver: { icon: UsersIcon, cls: 'bg-teal-50 text-teal-700' },
  fuel: { icon: FuelIcon, cls: 'bg-navy-50 text-navy-700' },
}

/* --------------------------------------------------------------- */

import useAuth from '../../hooks/useAuth'

function DriverDashboard({ user }: { user: any }) {
  const navigate = useNavigate()
  const [trips, setTrips] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchTrips() {
    try {
      const res = await tripService.getAll()
      setTrips(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTrips()
  }, [])

  async function acceptTrip(id: string) {
    try {
      await tripService.update(id, { driverId: user.id, status: 'SCHEDULED' })
      fetchTrips()
    } catch (err) {
      console.error(err)
      alert('Failed to accept trip.')
    }
  }

  async function completeTrip(id: string) {
    try {
      await tripService.update(id, { status: 'COMPLETED' })
      fetchTrips()
    } catch (err) {
      console.error(err)
      alert('Failed to mark trip as completed.')
    }
  }

  const myTrips = trips.filter((t) => t.driverId === user.id)
  const openTrips = trips.filter((t) => t.driverId === null && t.status === 'DRAFT')

  const activeTrips = myTrips.filter((t) => t.status === 'IN_PROGRESS' || t.status === 'SCHEDULED')
  const pendingTrips = myTrips.filter((t) => t.status === 'DRAFT')
  
  const currentActiveTrip = myTrips.find((t) => t.status === 'IN_PROGRESS' || t.status === 'SCHEDULED')
  
  const recentActivity = [...myTrips].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 4)

  if (loading) return <div className="p-8 text-center text-slate-500">Loading your dashboard...</div>

  return (
    <div className="font-sans text-navy-950">
      <div className="border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
        <div className="mx-auto max-w-[1440px]">
          <p className="text-[12px] font-medium text-amber-600 bg-amber-50 rounded-full px-3 py-1 inline-block">
            Driver Dashboard — all data below is scoped to the logged-in driver only, except the Open Trips pool which is shared across all drivers.
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6">
        {currentActiveTrip && (
          <div className="mb-6 animate-form-in rounded-xl border border-teal-200 bg-teal-50 px-5 py-4 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[12px] font-medium uppercase tracking-wider text-teal-800">Currently on</p>
              <h2 className="mt-1 text-[18px] font-bold text-teal-950">Trip #{currentActiveTrip.id.slice(0, 6)} &rarr; {currentActiveTrip.origin} to {currentActiveTrip.destination}</h2>
            </div>
            <button
              onClick={() => completeTrip(currentActiveTrip.id)}
              className="rounded-lg bg-teal-600 px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition hover:bg-teal-700"
            >
              Mark as Completed
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-6">
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-navy-50 text-navy-700">
                <RouteIcon className="h-5 w-5" />
              </span>
              <p className="text-[12.5px] font-medium text-slate-500">My Active Trips <span className="ml-1 text-[10px] text-slate-400 font-normal">(Scoped to current driver)</span></p>
            </div>
            <p className="text-[28px] font-bold text-navy-950">{activeTrips.length}</p>
          </div>
          
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-amber-50 text-amber-600">
                <ClockIcon className="h-5 w-5" />
              </span>
              <p className="text-[12.5px] font-medium text-slate-500">My Pending Trips <span className="ml-1 text-[10px] text-slate-400 font-normal">(Scoped to current driver)</span></p>
            </div>
            <p className="text-[28px] font-bold text-navy-950">{pendingTrips.length}</p>
          </div>
        </div>

        <section className="mb-6 rounded-xl border border-slate-200 bg-white shadow-sm">
          <header className="border-b border-slate-100 px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <h2 className="text-[16px] font-bold text-navy-900">🚚 Open Trips</h2>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">{openTrips.length} available</span>
            </div>
          </header>
          <div className="p-5">
            {openTrips.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">No open trips right now. Check back soon or create your own trip.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {openTrips.map(t => (
                  <div key={t.id} className="rounded-lg border border-slate-200 p-4 shadow-sm bg-slate-50/50 flex flex-col justify-between gap-4">
                    <div>
                      <p className="font-semibold text-navy-900 mb-1">{t.origin} &rarr; {t.destination}</p>
                      <p className="text-[12px] text-slate-500">Cargo: {t.cargoWeight ? `${t.cargoWeight} kg` : 'N/A'}</p>
                      <p className="text-[12px] text-slate-500">Distance: {t.distance ? `${t.distance} km` : 'N/A'}</p>
                    </div>
                    <button onClick={() => acceptTrip(t.id)} className="w-full rounded-lg bg-amber-500 hover:bg-amber-600 text-white py-2 text-[13px] font-semibold transition">
                      Accept Trip
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="mt-4 text-[11.5px] text-slate-400 italic text-center">
              Shared across all Drivers — first to click 'Accept' claims it. Accepting a trip assigns you and locks in your availability.
            </p>
          </div>
        </section>

        <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-[15px] font-semibold text-navy-900">Quick Actions</h2>
          <button onClick={() => navigate('/trips')} className="inline-flex items-center gap-1.5 rounded-lg bg-navy-800 px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-navy-900">
            <PlusIcon className="h-4 w-4 text-teal-400" />
            Create Trip
          </button>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <header className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-[15px] font-semibold text-navy-900">My Recent Activity <span className="ml-1 text-[11px] font-normal text-slate-400">(Scoped to current driver only)</span></h2>
          </header>
          <div className="p-5">
            {recentActivity.length === 0 ? (
              <p className="text-[13px] text-slate-500">No recent activity yet.</p>
            ) : (
              <ul className="space-y-4">
                {recentActivity.map((a, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-0.5 grid h-6 w-6 place-items-center rounded-full bg-navy-50 text-navy-700">
                      <RouteIcon className="h-3.5 w-3.5" />
                    </span>
                    <div>
                      <p className="text-[13.5px] font-medium text-navy-900">You updated Trip #{a.id.slice(0, 6)}</p>
                      <p className="text-[12px] text-slate-500">Status is now {a.status}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const role = (user?.role || 'DRIVER') as RoleId

  const [vehicleType, setVehicleType] = useState('All Vehicle Types')
  const [status, setStatus] = useState('All Statuses')
  const [region, setRegion] = useState('All Regions')

  const kpis = useMemo(() => KPIS.filter((k) => k.roles.includes(role)), [role])
  const actions = useMemo(() => quickActions.filter((a) => a.roles.includes(role)), [role])

  const can = {
    utilTrend: role === 'ADMIN' || role === 'MANAGER',
    statusDonut: role === 'ADMIN' || role === 'MANAGER',
    costTrend: role === 'ADMIN' || role === 'MANAGER',
    safety: role === 'ADMIN' || role === 'MANAGER',
    compliance: role === 'ADMIN' || role === 'MANAGER',
    license: role === 'ADMIN' || role === 'MANAGER' || role === 'ADMIN' || role === 'MANAGER',
  }

  if (role === 'DRIVER') {
    return <DriverDashboard user={user} />
  }

  if (role === 'UNASSIGNED') {
    return (
      <div className="font-sans text-navy-950 mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm text-center">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-amber-50 text-amber-500">
            <AlertIcon className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-navy-900">Account Pending Approval</h2>
          <p className="mt-2 text-[14px] text-slate-500">Your account is currently under review by an administrator. You will gain access to the dashboard once a role is assigned.</p>
          
          <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-6 text-left">
            <h3 className="mb-4 text-lg font-semibold text-navy-900">Your Profile</h3>
            <div className="grid grid-cols-1 gap-4 text-[13px] sm:grid-cols-2">
              <div>
                <span className="mb-1 block font-medium text-slate-500">Name</span>
                <span className="font-semibold text-navy-900">{user?.name}</span>
              </div>
              <div>
                <span className="mb-1 block font-medium text-slate-500">Email</span>
                <span className="font-semibold text-navy-900">{user?.email}</span>
              </div>
              <div>
                <span className="mb-1 block font-medium text-slate-500">Phone</span>
                <span className="font-semibold text-navy-900">{user?.phone || 'Not provided'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="font-sans text-navy-950">
      {/* ===== Filters bar ===== */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-end gap-3 px-4 py-3 sm:px-6">
          <Select
            label="Vehicle Type"
            value={vehicleType}
            onChange={setVehicleType}
            options={['All Vehicle Types', 'Truck', 'Van', 'Bike', 'Car']}
          />
          <Select
            label="Status"
            value={status}
            onChange={setStatus}
            options={['All Statuses', 'Available', 'On Trip', 'In Shop', 'Retired']}
          />
          <Select
            label="Region"
            value={region}
            onChange={setRegion}
            options={['All Regions', 'Region A', 'Region B', 'Region C', 'Region D']}
          />
          <p className="ml-auto self-center text-[12px] text-slate-400">
            Viewing as <span className="font-semibold text-navy-700">{ROLE_LABEL[role]}</span> · sections adapt to role
          </p>
        </div>
      </div>

      {/* ===== Body ===== */}
      <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          {/* --- Left column --- */}
          <div className="flex flex-col gap-6">
            {/* KPI grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {kpis.map((k) => {
                const a = accentMap[k.accent]
                const Icon = k.icon
                return (
                  <div
                    key={k.key}
                    className="group rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-navy-900/[0.04] transition hover:-translate-y-0.5 hover:shadow-md hover:shadow-navy-900/[0.08]"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className={`grid h-9 w-9 place-items-center rounded-lg ${a.bg} ${a.fg}`}>
                        <Icon className="h-5 w-5" />
                      </span>
                      <TrendPill trend={k.trend} good={k.trendGood ?? true} />
                    </div>
                    <p className="text-[28px] font-bold leading-none tracking-tight text-navy-950">{k.value}</p>
                    <p className="mt-2 text-[12.5px] font-medium text-slate-500">{k.label}</p>
                  </div>
                )
              })}
            </div>

            {/* Quick actions */}
            {actions.length > 0 && (
              <Card title="Quick Actions" roles={quickActions.flatMap((a) => a.roles).filter((v, i, s) => s.indexOf(v) === i)}>
                <div className="flex flex-wrap gap-2.5">
                  {actions.map((a) => (
                    <button
                      key={a.key}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-navy-800 px-3.5 py-2 text-[13px] font-semibold text-white shadow-sm transition hover:bg-navy-900 focus-visible:ring-4 focus-visible:ring-navy-800/25"
                    >
                      <PlusIcon className="h-4 w-4 text-teal-400" />
                      {a.label}
                    </button>
                  ))}
                </div>
              </Card>
            )}

            {/* Charts grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {can.utilTrend && (
                <Card title="Fleet Utilization — Last 30 Days" roles={['ADMIN', 'MANAGER']} className="lg:col-span-2">
                  <div className="h-[240px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={utilizationTrend} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
                        <defs>
                          <linearGradient id="utilFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#0d9488" stopOpacity={0.28} />
                            <stop offset="100%" stopColor="#0d9488" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#eef2f6" vertical={false} />
                        <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval={4} />
                        <YAxis domain={[50, 95]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} unit="%" />
                        <Tooltip content={<ChartTooltip unit="%" />} />
                        <Area type="monotone" dataKey="utilization" stroke="#0d9488" strokeWidth={2.5} fill="url(#utilFill)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              )}

              {can.statusDonut && (
                <Card title="Vehicle Status Breakdown" roles={['ADMIN', 'MANAGER']}>
                  <div className="flex items-center gap-4">
                    <div className="h-[180px] w-[180px] shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={vehicleStatus} dataKey="value" innerRadius={54} outerRadius={80} paddingAngle={2} stroke="none">
                            {vehicleStatus.map((s) => (
                              <Cell key={s.name} fill={s.color} />
                            ))}
                          </Pie>
                          <Tooltip content={<ChartTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <ul className="flex-1 space-y-2.5">
                      {vehicleStatus.map((s) => (
                        <li key={s.name} className="flex items-center gap-2 text-[13px]">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                          <span className="text-slate-600">{s.name}</span>
                          <span className="ml-auto font-semibold text-navy-900">{s.value}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
              )}

              {can.costTrend && (
                <Card
                  title="Operational Cost — Fuel vs Maintenance"
                  roles={['ADMIN', 'MANAGER']}
                  className={can.statusDonut ? '' : 'lg:col-span-2'}
                >
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={costTrend} margin={{ top: 6, right: 8, left: -20, bottom: 0 }} barGap={4}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#eef2f6" vertical={false} />
                        <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} unit="k" />
                        <Tooltip content={<ChartTooltip unit="k" />} cursor={{ fill: '#f1f5f9' }} />
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                        <Bar dataKey="fuel" name="Fuel" fill="#1e3a5f" radius={[4, 4, 0, 0]} maxBarSize={22} />
                        <Bar dataKey="maintenance" name="Maintenance" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={22} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              )}

              {can.safety && (
                <Card title="Driver Safety Scores" roles={['ADMIN', 'MANAGER']}>
                  <ul className="space-y-3">
                    {safetyScores.map((d) => {
                      const tone = d.score >= 90 ? '#0d9488' : d.score >= 75 ? '#f59e0b' : '#ef4444'
                      return (
                        <li key={d.name} className="flex items-center gap-3 text-[13px]">
                          <span className="w-28 shrink-0 truncate text-slate-600">{d.name}</span>
                          <span className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                            <span className="block h-full rounded-full" style={{ width: `${d.score}%`, background: tone }} />
                          </span>
                          <span className="w-8 text-right font-semibold text-navy-900">{d.score}</span>
                        </li>
                      )
                    })}
                  </ul>
                </Card>
              )}

              {can.compliance && (
                <Card title="Driver Compliance" roles={['ADMIN', 'MANAGER']} action={<ShieldIcon className="h-4 w-4 text-teal-600" />}>
                  <div className="grid grid-cols-2 gap-4">
                    {compliance.map((c) => (
                      <div key={c.label} className="rounded-lg bg-navy-50/60 p-3">
                        <div className="flex items-baseline gap-1">
                          <span className="text-[22px] font-bold text-navy-900">{c.value}</span>
                          <span className="text-[12px] font-semibold text-slate-400">%</span>
                        </div>
                        <p className="mt-0.5 text-[12px] text-slate-500">{c.label}</p>
                        <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-slate-200">
                          <span
                            className="block h-full rounded-full bg-teal-600"
                            style={{ width: `${c.value}%` }}
                          />
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {can.license && (
                <Card
                  title="License Expiry Alerts"
                  roles={['ADMIN', 'MANAGER']}
                  className={can.safety || can.statusDonut ? '' : 'lg:col-span-2'}
                >
                  <ul className="divide-y divide-slate-100">
                    {licenseAlerts.map((l) => {
                      const red = l.days <= 10
                      return (
                        <li key={l.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                          <span
                            className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
                              red ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                            }`}
                          >
                            <AlertIcon className="h-4 w-4" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[13px] font-medium text-navy-900">{l.name}</span>
                            <span className="block font-mono text-[11px] text-slate-400">{l.id}</span>
                          </span>
                          <span
                            className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                              red ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {l.days}d left
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                </Card>
              )}
            </div>
          </div>

          {/* --- Right sidebar: activity feed --- */}
          <Card title="Recent Activity" roles={ROLES.map((r) => r.id)} className="h-fit xl:sticky xl:top-24">
            <ul className="space-y-1">
              {activity.map((ev) => {
                const conf = activityIcon[ev.type]
                const Icon = conf.icon
                return (
                  <li key={ev.id} className="flex gap-3 rounded-lg p-2 transition hover:bg-slate-50">
                    <span className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg ${conf.cls}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[12.5px] leading-snug text-navy-800">{ev.text}</span>
                      <span className="mt-0.5 block text-[11px] text-slate-400">{ev.time}</span>
                    </span>
                  </li>
                )
              })}
            </ul>
          </Card>
        </div>
      </main>
    </div>
  )
}

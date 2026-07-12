import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import { driverService } from '../../services/driverService'
import api from '../../services/api'

/* ---- Icons ---- */
function TruckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M3 6.5A1.5 1.5 0 0 1 4.5 5h8A1.5 1.5 0 0 1 14 6.5V16H3V6.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M14 9h3.6a1.5 1.5 0 0 1 1.24.66L21 12.9V16h-7V9Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="7" cy="17.5" r="1.9" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17" cy="17.5" r="1.9" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

function CameraIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

function IdCardIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="8" cy="11" r="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M5 17c0-1.7 1.3-3 3-3s3 1.3 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="14" y1="9" x2="19" y2="9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="14" y1="13" x2="19" y2="13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 7.5v5.5M12 16.2v.1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M4.5 12.5 9 17l10.5-11" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* ---- Constants ---- */
const LICENSE_CATEGORIES = ['LMV', 'HMV', 'MCWG', 'Trailer'] as const

const STEPS = [
  { label: 'Photo', icon: CameraIcon },
  { label: 'License Details', icon: IdCardIcon },
  { label: 'Review', icon: CheckIcon },
]

/* ---- Component ---- */
export default function DriverOnboarding() {
  const { user, login } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState(0)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoBase64, setPhotoBase64] = useState<string | null>(null)
  const [licenseNumber, setLicenseNumber] = useState('')
  const [licenseCategory, setLicenseCategory] = useState<string>(LICENSE_CATEGORIES[0])
  const [licenseExpiry, setLicenseExpiry] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  /* ---- Photo handling ---- */
  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setError('Photo must be under 5 MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      setPhotoPreview(result)
      setPhotoBase64(result)
      setError(null)
    }
    reader.readAsDataURL(file)
  }

  /* ---- Validation ---- */
  function canAdvance() {
    if (step === 0) return !!photoBase64
    if (step === 1) return licenseNumber.trim().length >= 5 && licenseExpiry !== ''
    return true
  }

  /* ---- Submit ---- */
  async function handleSubmit() {
    setSubmitting(true)
    setError(null)
    try {
      await driverService.onboard({
        licenseNumber: licenseNumber.trim(),
        licenseCategory,
        licenseExpiry,
        photoData: photoBase64,
      })
      // Refresh user data from /me
      const res = await api.get('/auth/me')
      const token = localStorage.getItem('token')!
      login(token, res.data.user)
      navigate('/dashboard', { replace: true })
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-teal-500/5 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-[500px] w-[500px] rounded-full bg-navy-900/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg">
        {/* Logo */}
        <div className="mb-8 flex items-center justify-center gap-2.5">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-navy-900 shadow-lg shadow-navy-900/20">
            <TruckIcon className="h-5 w-5 text-teal-400" />
          </div>
          <span className="text-[22px] font-bold tracking-tight text-navy-950">
            Transit<span className="text-teal-600">Ops</span>
          </span>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/5">
          {/* Header */}
          <div className="mb-6 text-center">
            <h1 className="text-xl font-bold text-navy-950">Complete Your Driver Profile</h1>
            <p className="mt-1 text-sm text-slate-500">
              Hi{user?.name ? ` ${user.name.split(' ')[0]}` : ''}, please provide your details to get started.
            </p>
          </div>

          {/* Step indicator */}
          <div className="mb-8 flex items-center justify-center gap-1">
            {STEPS.map((s, i) => {
              const done = i < step
              const active = i === step
              return (
                <div key={s.label} className="flex items-center">
                  <div className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold transition-all duration-300 ${
                    done ? 'bg-teal-50 text-teal-700' : active ? 'bg-navy-900 text-white' : 'bg-slate-100 text-slate-400'
                  }`}>
                    <s.icon className="h-3.5 w-3.5" />
                    {s.label}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`mx-1 h-px w-6 transition-colors duration-300 ${done ? 'bg-teal-400' : 'bg-slate-200'}`} />
                  )}
                </div>
              )
            })}
          </div>

          {/* ---- Step 0: Photo ---- */}
          {step === 0 && (
            <div className="flex flex-col items-center gap-5">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="group relative h-40 w-40 overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 transition hover:border-teal-500 hover:bg-teal-50/40 focus:outline-none focus:ring-4 focus:ring-teal-500/20"
              >
                {photoPreview ? (
                  <img src={photoPreview} alt="Photo preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-400 group-hover:text-teal-600">
                    <CameraIcon className="h-8 w-8" />
                    <span className="text-[12px] font-medium">Upload Photo</span>
                  </div>
                )}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
              <p className="text-[12px] text-slate-400">JPG, PNG or WebP — max 5 MB</p>
              {photoPreview && (
                <button
                  type="button"
                  onClick={() => { setPhotoPreview(null); setPhotoBase64(null) }}
                  className="text-[12px] font-medium text-red-500 hover:underline"
                >
                  Remove &amp; re-upload
                </button>
              )}
            </div>
          )}

          {/* ---- Step 1: License Details ---- */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="licenseNumber" className="text-[13px] font-medium text-navy-900">License Number</label>
                <input
                  id="licenseNumber"
                  type="text"
                  placeholder="e.g. DL-0420110149646"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-[14px] text-navy-950 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-500/15"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="licenseCategory" className="text-[13px] font-medium text-navy-900">License Category</label>
                <select
                  id="licenseCategory"
                  value={licenseCategory}
                  onChange={(e) => setLicenseCategory(e.target.value)}
                  className="h-11 w-full appearance-none rounded-lg border border-slate-300 bg-white px-3.5 text-[14px] font-medium text-navy-950 outline-none transition hover:border-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-500/15"
                >
                  {LICENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="licenseExpiry" className="text-[13px] font-medium text-navy-900">License Expiry Date</label>
                <input
                  id="licenseExpiry"
                  type="date"
                  value={licenseExpiry}
                  onChange={(e) => setLicenseExpiry(e.target.value)}
                  className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-[14px] text-navy-950 outline-none transition hover:border-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-500/15"
                />
              </div>
            </div>
          )}

          {/* ---- Step 2: Review ---- */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                {photoPreview && (
                  <img src={photoPreview} alt="Your photo" className="h-16 w-16 rounded-xl object-cover ring-2 ring-white shadow" />
                )}
                <div>
                  <p className="text-sm font-semibold text-navy-950">{user?.name}</p>
                  <p className="text-[12px] text-slate-500">{user?.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-[11px] font-medium text-slate-400">License Number</p>
                  <p className="text-[13px] font-semibold text-navy-900">{licenseNumber}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-[11px] font-medium text-slate-400">Category</p>
                  <p className="text-[13px] font-semibold text-navy-900">{licenseCategory}</p>
                </div>
                <div className="col-span-2 rounded-lg bg-slate-50 p-3">
                  <p className="text-[11px] font-medium text-slate-400">Expiry Date</p>
                  <p className="text-[13px] font-semibold text-navy-900">
                    {licenseExpiry ? new Date(licenseExpiry).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-[13px] font-medium text-red-700 ring-1 ring-inset ring-red-200">
              <AlertIcon className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Navigation buttons */}
          <div className="mt-8 flex items-center justify-between gap-3">
            {step > 0 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="h-11 rounded-lg border border-slate-300 px-5 text-[13.5px] font-semibold text-navy-900 transition hover:bg-slate-50"
              >
                Back
              </button>
            ) : <div />}

            {step < 2 ? (
              <button
                type="button"
                disabled={!canAdvance()}
                onClick={() => { setError(null); setStep(step + 1) }}
                className="h-11 rounded-lg bg-navy-900 px-6 text-[13.5px] font-semibold text-white shadow-lg shadow-navy-900/20 transition hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmit}
                className="h-11 rounded-lg bg-teal-600 px-6 text-[13.5px] font-semibold text-white shadow-lg shadow-teal-600/20 transition hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Submitting…
                  </span>
                ) : (
                  'Complete Onboarding'
                )}
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-[11.5px] text-slate-400">
          © 2026 TransitOps · Fleet Management Platform
        </p>
      </div>
    </div>
  )
}

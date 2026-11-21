import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/common/Button'
import { ArrowLeft, LoaderCircle, Lock, ShieldCheck } from '../components/common/icons'
import { LogoMark } from '../components/common/Logo'
import { ROLE_LABEL, useAuth } from '../context/AuthContext'
import { getOrg } from '../data/organizations'
import { cn } from '../lib/cn'

type Mode = 'signin' | 'signup'

export function LoginPage() {
  const auth = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [contact, setContact] = useState('')
  const [consent, setConsent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    document.title = 'Staff sign in · KaDaan'
  }, [])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setNotice(null)
    if (mode === 'signup') {
      if (fullName.trim().length < 2) return setError('Enter your full name.')
      if (!/^09\d{9}$/.test(contact.trim())) return setError('Enter a mobile number like 09171234567.')
      if (password.length < 8) return setError('Use at least 8 characters for your password.')
      if (!consent) return setError('Please agree to the Data Privacy notice.')
    }
    setBusy(true)
    try {
      if (mode === 'signin') {
        await auth.signIn(email, password)
        navigate('/map')
      } else {
        const { needsConfirmation } = await auth.signUp({ email, password, fullName, contactNumber: contact })
        if (needsConfirmation) {
          setNotice('Check your email and open the confirmation link, then sign in here.')
          setMode('signin')
        } else navigate('/map')
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.'
      setError(msg === 'Invalid login credentials' ? 'Wrong email or password.' : msg)
    } finally {
      setBusy(false)
    }
  }

  const signedIn = auth.session && auth.profile

  return (
    <div className="flex min-h-dvh items-center justify-center bg-canvas px-4 py-10">
      <div className="w-full max-w-[400px]">
        <Link to="/map" className="mb-6 inline-flex items-center gap-1.5 text-[15px] font-medium text-forest dark:text-brand">
          <ArrowLeft className="size-4" weight="bold" /> Back to the map
        </Link>
        <div className="card p-6 sm:p-7">
          <LogoMark className="size-12 rounded-[13px]" />
          <h1 className="mt-4 text-[26px] leading-tight font-bold">{signedIn ? 'You’re signed in' : 'Staff sign in'}</h1>
          <p className="mt-1.5 text-[15px] text-muted">
            {signedIn
              ? 'Your account details are below.'
              : 'For barangay, ICTPMO and ICDRRMO personnel and partner agencies. Road users don’t need an account.'}
          </p>

          {!auth.available && (
            <p className="mt-5 rounded-xl bg-amber-50 px-3.5 py-3 text-[14px] text-amber-800">
              Sign in needs the online backend. This copy of KaDaan is running in local mode.
            </p>
          )}

          {signedIn ? (
            <div className="mt-5 space-y-4">
              <dl className="overflow-hidden rounded-[16px] bg-fill text-[15px]">
                {[
                  ['Name', auth.profile!.full_name],
                  ['Email', auth.session!.user.email ?? ''],
                  ['Role', ROLE_LABEL[auth.profile!.role]],
                  ['Office', getOrg(auth.profile!.office_id)?.name ?? auth.profile!.office_id],
                ].map(([k, v], i) => (
                  <div key={k} className={cn('flex justify-between gap-4 px-4 py-3', i > 0 && 'border-t border-line')}>
                    <dt className="text-muted">{k}</dt>
                    <dd className="text-right font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
              {auth.profile!.role === 'pending' && (
                <p className="rounded-xl bg-amber-50 px-3.5 py-3 text-[14px] text-amber-800">
                  Your account is waiting for an admin to give you a role. Until then you can use KaDaan like any road user.
                </p>
              )}
              <div className="grid gap-2">
                <Button variant="ink" size="lg" onClick={() => navigate('/map')}>
                  Go to the map
                </Button>
                <Button variant="secondary" size="lg" onClick={() => void auth.signOut()}>
                  Sign out
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div role="tablist" className="mt-5 grid grid-cols-2 rounded-full bg-fill p-0.5">
                {(['signin', 'signup'] as Mode[]).map((m) => (
                  <button
                    key={m}
                    role="tab"
                    aria-selected={mode === m}
                    onClick={() => {
                      setMode(m)
                      setError(null)
                    }}
                    className={cn('h-9 cursor-pointer rounded-full text-[14px] font-semibold transition', mode === m ? 'bg-elevated shadow-card' : 'text-muted')}
                  >
                    {m === 'signin' ? 'Sign in' : 'Create account'}
                  </button>
                ))}
              </div>

              <form onSubmit={submit} className="mt-5 space-y-3.5" noValidate>
                {mode === 'signup' && (
                  <>
                    <Field label="Full name" value={fullName} onChange={setFullName} autoComplete="name" />
                    <Field label="Mobile number" value={contact} onChange={setContact} autoComplete="tel" inputMode="tel" placeholder="09171234567" />
                  </>
                )}
                <Field label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" />
                <Field
                  label="Password"
                  type="password"
                  value={password}
                  onChange={setPassword}
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                />
                {mode === 'signup' && (
                  <label className="flex cursor-pointer gap-2.5 text-[13px] leading-snug text-muted">
                    <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 size-4 accent-[var(--color-forest)]" />
                    I agree that KaDaan keeps my name and mobile number for my staff account, under the Data Privacy Act of 2012.
                  </label>
                )}
                {error && <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-[14px] text-red-700">{error}</p>}
                {notice && <p className="rounded-xl bg-mint px-3.5 py-2.5 text-[14px] text-forest dark:text-brand">{notice}</p>}
                <Button type="submit" variant="ink" size="lg" className="w-full" disabled={busy || !auth.available}>
                  {busy ? <LoaderCircle className="size-5 animate-spin" /> : <Lock className="size-4" weight="bold" />}
                  {mode === 'signin' ? 'Sign in' : 'Create account'}
                </Button>
              </form>
              {mode === 'signup' && (
                <p className="mt-4 flex gap-2 text-[13px] leading-snug text-muted">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0" />
                  New accounts can’t change reports until an admin gives them a role. The very first account becomes the admin.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  ...rest
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  autoComplete?: string
  inputMode?: 'tel' | 'email' | 'text'
  placeholder?: string
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[14px] font-medium">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="input" {...rest} />
    </label>
  )
}

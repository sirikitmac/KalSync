import type { Session } from '@supabase/supabase-js'
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import type { OrgId } from '../types/report'

export type StaffRole = 'admin' | 'personnel' | 'partner' | 'pending'

export interface Profile {
  id: string
  full_name: string
  contact_number: string
  role: StaffRole
  office_id: OrgId
  barangay: string | null
}

interface AuthValue {
  /** False when the app runs without the Supabase backend (local mode). */
  available: boolean
  loading: boolean
  session: Session | null
  profile: Profile | null
  /** Admin or personnel: may verify, close, resolve and send alerts. */
  isStaff: boolean
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (input: { email: string; password: string; fullName: string; contactNumber: string }) => Promise<{ needsConfirmation: boolean }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(Boolean(supabase))

  useEffect(() => {
    if (!supabase) return
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      if (!data.session) setLoading(false)
    })
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])

  const userId = session?.user.id
  useEffect(() => {
    if (!supabase || !userId) {
      setProfile(null)
      return
    }
    let live = true
    setLoading(true)
    void supabase
      .from('profiles')
      .select('id, full_name, contact_number, role, office_id, barangay')
      .eq('id', userId)
      .maybeSingle()
      .then(({ data }) => {
        if (!live) return
        setProfile((data as Profile | null) ?? null)
        setLoading(false)
      })
    return () => {
      live = false
    }
  }, [userId])

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) throw new Error('Sign in needs the online backend.')
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (error) throw error
  }, [])

  const signUp = useCallback(async ({ email, password, fullName, contactNumber }: { email: string; password: string; fullName: string; contactNumber: string }) => {
    if (!supabase) throw new Error('Sign up needs the online backend.')
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: fullName.trim(), contact_number: contactNumber.trim() },
        emailRedirectTo: `${window.location.origin}/login`,
      },
    })
    if (error) throw error
    return { needsConfirmation: !data.session }
  }, [])

  const signOut = useCallback(async () => {
    await supabase?.auth.signOut()
    setProfile(null)
  }, [])

  const value = useMemo<AuthValue>(() => {
    const role = profile?.role
    return {
      available: Boolean(supabase),
      loading,
      session,
      profile,
      isStaff: role === 'admin' || role === 'personnel',
      isAdmin: role === 'admin',
      signIn,
      signUp,
      signOut,
    }
  }, [loading, session, profile, signIn, signUp, signOut])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

export const ROLE_LABEL: Record<StaffRole, string> = {
  admin: 'Admin',
  personnel: 'Personnel',
  partner: 'Partner agency',
  pending: 'Waiting for access',
}

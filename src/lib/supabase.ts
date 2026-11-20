import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/**
 * Null when the env vars are missing: the app then runs in local (browser-only)
 * mode, so the prototype keeps working without a backend.
 */
export const supabase: SupabaseClient | null = url && key ? createClient(url, key) : null

export const PHOTO_BUCKET = 'report-photos'

export const photoUrl = (path: string) =>
  supabase ? supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path).data.publicUrl : null

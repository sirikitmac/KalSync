import { useEffect, useState } from 'react'
import { reportService } from '../services/reportService'

/** Resolves an IndexedDB (`img:`) or Supabase Storage (`sb:`) image key to an object URL. Demo `scene:` keys return null (rendered as illustrations). */
export function useReportImage(imageKey?: string) {
  const [url, setUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(Boolean(imageKey && /^(img|sb):/.test(imageKey)))

  useEffect(() => {
    if (!imageKey || !/^(img|sb):/.test(imageKey)) {
      setUrl(null)
      setLoading(false)
      return
    }
    let objectUrl: string | null = null
    let cancelled = false
    setLoading(true)
    reportService
      .getImageBlob(imageKey)
      .then((blob) => {
        if (cancelled || !blob) return
        objectUrl = URL.createObjectURL(blob)
        setUrl(objectUrl)
      })
      .catch(() => setUrl(null))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [imageKey])

  return { url, loading }
}

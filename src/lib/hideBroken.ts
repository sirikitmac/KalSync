import type { SyntheticEvent } from 'react'

/** Hides an image that failed to load instead of showing the broken-image icon. */
export const hideBroken = (e: SyntheticEvent<HTMLImageElement>) => {
  e.currentTarget.style.visibility = 'hidden'
}

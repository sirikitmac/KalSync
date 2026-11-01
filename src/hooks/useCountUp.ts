import { useEffect, useRef, useState } from 'react'

/** Animates a number toward `target` whenever it changes. */
export function useCountUp(target: number, duration = 600) {
  const [value, setValue] = useState(target)
  const from = useRef(target)

  useEffect(() => {
    const start = performance.now()
    const initial = from.current
    if (initial === target) return
    let raf = 0
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setValue(Math.round(initial + (target - initial) * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
      else from.current = target
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      from.current = target
    }
  }, [target, duration])

  return value
}

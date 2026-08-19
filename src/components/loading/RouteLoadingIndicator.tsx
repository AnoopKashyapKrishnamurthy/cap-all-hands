'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { usePathname, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

const ROUTE_START_EVENT = 'cap:route-start'

export function startRouteTransition() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(ROUTE_START_EVENT))
  }
}

function isInternalNavigation(event: MouseEvent, anchor: HTMLAnchorElement) {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    anchor.target === '_blank' ||
    anchor.hasAttribute('download')
  ) {
    return false
  }

  const destination = new URL(anchor.href, window.location.href)
  const current = new URL(window.location.href)

  return (
    destination.origin === current.origin &&
    `${destination.pathname}${destination.search}` !==
      `${current.pathname}${current.search}`
  )
}

export default function RouteLoadingIndicator() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const reduceMotion = useReducedMotion()
  const [visible, setVisible] = useState(false)
  const delayRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const safetyRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimers = useCallback(() => {
    if (delayRef.current) clearTimeout(delayRef.current)
    if (safetyRef.current) clearTimeout(safetyRef.current)
    delayRef.current = null
    safetyRef.current = null
  }, [])

  const finish = useCallback(() => {
    clearTimers()
    setVisible(false)
  }, [clearTimers])

  const start = useCallback(() => {
    clearTimers()
    delayRef.current = setTimeout(() => setVisible(true), 100)
    safetyRef.current = setTimeout(() => setVisible(false), 10_000)
  }, [clearTimers])

  useEffect(() => finish(), [pathname, searchParams, finish])

  useEffect(() => {
    const onDocumentClick = (event: MouseEvent) => {
      const target = event.target
      if (!(target instanceof Element)) return
      const anchor = target.closest('a')
      if (anchor instanceof HTMLAnchorElement && isInternalNavigation(event, anchor)) {
        start()
      }
    }

    const onManualStart = () => start()
    document.addEventListener('click', onDocumentClick, true)
    window.addEventListener(ROUTE_START_EVENT, onManualStart)

    return () => {
      document.removeEventListener('click', onDocumentClick, true)
      window.removeEventListener(ROUTE_START_EVENT, onManualStart)
      clearTimers()
    }
  }, [clearTimers, start])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5 origin-left bg-gradient-to-r from-orange-400 via-blue-500 to-indigo-500 shadow-[0_0_10px_rgba(59,130,246,0.45)]"
          initial={{ opacity: 0, scaleX: 0.08 }}
          animate={
            reduceMotion
              ? { opacity: 1, scaleX: 0.75 }
              : { opacity: 1, scaleX: [0.08, 0.62, 0.82] }
          }
          exit={{ opacity: 0, scaleX: 1 }}
          transition={{ duration: reduceMotion ? 0 : 0.65, ease: 'easeOut' }}
          role="progressbar"
          aria-label="Loading the next page"
        >
          <span className="sr-only" aria-live="polite">
            Loading the next page
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

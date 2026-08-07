'use client'

import { useCallback, useEffect, useState } from 'react'

export interface SpinnerParticipant {
  id: string
  display_name: string
  avatar_url?: string | null
  bio?: string | null
}

export type SpinnerStatus = 'idle' | 'selecting' | 'speaking' | 'finished'

export default function useParticipantSpinner<T extends SpinnerParticipant>(participants: T[]) {
  const [status, setStatus] = useState<SpinnerStatus>('idle')
  const [remainingParticipants, setRemainingParticipants] = useState<T[]>(participants)
  const [completedParticipants, setCompletedParticipants] = useState<T[]>([])
  const [selectedParticipant, setSelectedParticipant] = useState<T | null>(null)
  const [flickerParticipant, setFlickerParticipant] = useState<T | null>(null)

  useEffect(() => {
    setRemainingParticipants(participants)
    setCompletedParticipants([])
    setStatus('idle')
    setSelectedParticipant(null)
    setFlickerParticipant(null)
  }, [participants])

  useEffect(() => {
    if (status !== 'selecting' || remainingParticipants.length === 0) return

    const pool = remainingParticipants
    setFlickerParticipant(pool[Math.floor(Math.random() * pool.length)])

    const interval = window.setInterval(() => {
      setFlickerParticipant(pool[Math.floor(Math.random() * pool.length)])
    }, 80)

    const timeout = window.setTimeout(() => {
      window.clearInterval(interval)

      const chosen = pool[Math.floor(Math.random() * pool.length)]
      setSelectedParticipant(chosen)
      setRemainingParticipants((current) => (
        current.filter((participant) => participant.id !== chosen.id)
      ))
      setStatus('speaking')
    }, 3000)

    return () => {
      window.clearInterval(interval)
      window.clearTimeout(timeout)
    }
  }, [remainingParticipants, status])

  const spinNext = useCallback(() => {
    if (status === 'selecting' || status === 'finished') return

    if (selectedParticipant) {
      setCompletedParticipants((current) => [...current, selectedParticipant])
    }

    if (remainingParticipants.length === 0) {
      setStatus('finished')
      return
    }

    setStatus('selecting')
  }, [remainingParticipants.length, selectedParticipant, status])

  const reset = useCallback(() => {
    setStatus('idle')
    setRemainingParticipants(participants)
    setCompletedParticipants([])
    setSelectedParticipant(null)
    setFlickerParticipant(null)
  }, [participants])

  return {
    status,
    remainingParticipants,
    completedParticipants,
    selectedParticipant,
    flickerParticipant,
    spinNext,
    reset,
  }
}

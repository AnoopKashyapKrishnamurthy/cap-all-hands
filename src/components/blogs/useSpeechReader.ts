'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { BlogSentence } from './BlogArticle'

export type SpeechReaderStatus =
  | 'idle'
  | 'loading-voices'
  | 'preparing'
  | 'playing'
  | 'paused'
  | 'stopped'
  | 'completed'
  | 'error'
  | 'unsupported'

export type PlaybackRate = 0.75 | 1 | 1.25 | 1.5

export interface VoiceOption {
  id: string
  name: string
  lang: string
  isDefault: boolean
}

const RATE_STORAGE_KEY = 'cap-blog-reader-rate'
const VOICE_STORAGE_KEY = 'cap-blog-reader-voice'
const PREPARATION_TIMEOUT_MS = 8_000
const VOICE_TIMEOUT_MS = 6_000
const validRates: PlaybackRate[] = [0.75, 1, 1.25, 1.5]

const getVoiceId = (voice: SpeechSynthesisVoice) =>
  voice.voiceURI || `${voice.name}::${voice.lang}`

const preferVoice = (voices: SpeechSynthesisVoice[]) => {
  const preferredNames = ['Google UK English Female', 'Google US English']
  return (
    voices.find((voice) => preferredNames.includes(voice.name)) ||
    voices.find((voice) => voice.default && voice.lang.toLowerCase().startsWith('en')) ||
    voices.find((voice) => voice.lang.toLowerCase() === 'en-gb') ||
    voices.find((voice) => voice.lang.toLowerCase().startsWith('en')) ||
    voices[0]
  )
}

const toVoiceOptions = (voices: SpeechSynthesisVoice[]): VoiceOption[] =>
  voices.map((voice) => ({
    id: getVoiceId(voice),
    name: voice.name,
    lang: voice.lang,
    isDefault: voice.default,
  }))

export function useSpeechReader(sentences: BlogSentence[]) {
  const [status, setStatus] = useState<SpeechReaderStatus>('idle')
  const [supported, setSupported] = useState<boolean | null>(null)
  const [voices, setVoices] = useState<VoiceOption[]>([])
  const [selectedVoiceId, setSelectedVoiceIdState] = useState('')
  const [rate, setRateState] = useState<PlaybackRate>(1)
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0)
  const [activeSentenceIndex, setActiveSentenceIndex] = useState<number | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const mountedRef = useRef(true)
  const supportedRef = useRef(false)
  const statusRef = useRef<SpeechReaderStatus>('idle')
  const sentencesRef = useRef(sentences)
  const browserVoicesRef = useRef<SpeechSynthesisVoice[]>([])
  const selectedVoiceIdRef = useRef('')
  const savedVoiceIdRef = useRef('')
  const rateRef = useRef<PlaybackRate>(1)
  const currentSentenceIndexRef = useRef(0)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const generationRef = useRef(0)
  const preparationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const voiceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingSentenceRef = useRef<number | null>(null)
  const restartPausedSentenceRef = useRef(false)
  const startSentenceRef = useRef<(index: number) => void>(() => undefined)

  const updateStatus = useCallback((nextStatus: SpeechReaderStatus) => {
    statusRef.current = nextStatus
    if (mountedRef.current) setStatus(nextStatus)
  }, [])

  const clearTimers = useCallback(() => {
    if (preparationTimerRef.current) clearTimeout(preparationTimerRef.current)
    if (voiceTimerRef.current) clearTimeout(voiceTimerRef.current)
    preparationTimerRef.current = null
    voiceTimerRef.current = null
  }, [])

  const invalidateSpeech = useCallback(() => {
    generationRef.current += 1
    clearTimers()
    utteranceRef.current = null
    pendingSentenceRef.current = null
    if (supportedRef.current) window.speechSynthesis.cancel()
  }, [clearTimers])

  const startSentence = useCallback((requestedIndex: number) => {
    if (!supportedRef.current || !sentencesRef.current.length) return

    const index = Math.min(Math.max(requestedIndex, 0), sentencesRef.current.length - 1)
    const synthesis = window.speechSynthesis
    const availableVoices = synthesis.getVoices()
    browserVoicesRef.current = availableVoices
    setVoices(toVoiceOptions(availableVoices))

    invalidateSpeech()
    restartPausedSentenceRef.current = false
    currentSentenceIndexRef.current = index
    setCurrentSentenceIndex(index)
    setActiveSentenceIndex(null)
    setErrorMessage(null)

    if (!availableVoices.length) {
      pendingSentenceRef.current = index
      updateStatus('loading-voices')
      const generation = generationRef.current
      voiceTimerRef.current = setTimeout(() => {
        if (!mountedRef.current || generation !== generationRef.current) return
        pendingSentenceRef.current = null
        updateStatus('error')
        setActiveSentenceIndex(null)
        setErrorMessage('No voice is available for readout on this device.')
      }, VOICE_TIMEOUT_MS)
      return
    }

    let voice = availableVoices.find(
      (candidate) => getVoiceId(candidate) === selectedVoiceIdRef.current,
    )
    if (!voice) {
      voice = preferVoice(availableVoices)
      const fallbackId = getVoiceId(voice)
      selectedVoiceIdRef.current = fallbackId
      setSelectedVoiceIdState(fallbackId)
    }

    const generation = generationRef.current
    const utterance = new SpeechSynthesisUtterance(sentencesRef.current[index].text)
    utterance.voice = voice
    utterance.rate = rateRef.current
    utterance.pitch = 1
    utterance.volume = 1

    utterance.onstart = () => {
      if (!mountedRef.current || generation !== generationRef.current) return
      if (preparationTimerRef.current) clearTimeout(preparationTimerRef.current)
      preparationTimerRef.current = null
      updateStatus('playing')
      setActiveSentenceIndex(index)
    }

    utterance.onboundary = () => {
      // Boundary delivery is inconsistent across engines. Sentence playback and
      // highlighting are intentionally driven by utterance lifecycle events.
    }

    utterance.onend = () => {
      if (!mountedRef.current || generation !== generationRef.current) return
      clearTimers()
      utteranceRef.current = null

      const nextIndex = index + 1
      if (nextIndex < sentencesRef.current.length) {
        startSentenceRef.current(nextIndex)
      } else {
        setActiveSentenceIndex(null)
        updateStatus('completed')
      }
    }

    utterance.onerror = (event) => {
      if (!mountedRef.current || generation !== generationRef.current) return
      clearTimers()
      utteranceRef.current = null
      setActiveSentenceIndex(null)
      if (event.error === 'canceled' || event.error === 'interrupted') {
        updateStatus('stopped')
        return
      }
      updateStatus('error')
      setErrorMessage('Voice readout could not continue. Please try again.')
    }

    utteranceRef.current = utterance
    updateStatus('preparing')
    preparationTimerRef.current = setTimeout(() => {
      if (!mountedRef.current || generation !== generationRef.current) return
      generationRef.current += 1
      synthesis.cancel()
      utteranceRef.current = null
      setActiveSentenceIndex(null)
      updateStatus('error')
      setErrorMessage('Voice readout took too long to start. Please try again.')
    }, PREPARATION_TIMEOUT_MS)

    try {
      synthesis.speak(utterance)
    } catch {
      generationRef.current += 1
      clearTimers()
      utteranceRef.current = null
      setActiveSentenceIndex(null)
      updateStatus('error')
      setErrorMessage('Voice readout could not start in this browser.')
    }
  }, [clearTimers, invalidateSpeech, updateStatus])

  startSentenceRef.current = startSentence

  useEffect(() => {
    sentencesRef.current = sentences
    if (!sentences.length) {
      currentSentenceIndexRef.current = 0
      setCurrentSentenceIndex(0)
      return
    }
    if (currentSentenceIndexRef.current >= sentences.length) {
      const finalIndex = sentences.length - 1
      currentSentenceIndexRef.current = finalIndex
      setCurrentSentenceIndex(finalIndex)
    }
  }, [sentences])

  useEffect(() => {
    mountedRef.current = true
    if (
      typeof window === 'undefined' ||
      !('speechSynthesis' in window) ||
      !('SpeechSynthesisUtterance' in window)
    ) {
      supportedRef.current = false
      setSupported(false)
      updateStatus('unsupported')
      return
    }

    supportedRef.current = true
    setSupported(true)

    try {
      const storedRate = Number(window.localStorage.getItem(RATE_STORAGE_KEY))
      if (validRates.includes(storedRate as PlaybackRate)) {
        rateRef.current = storedRate as PlaybackRate
        setRateState(storedRate as PlaybackRate)
      }
      savedVoiceIdRef.current = window.localStorage.getItem(VOICE_STORAGE_KEY) ?? ''
    } catch {
      // Browser storage is optional; defaults remain usable.
    }

    const synthesis = window.speechSynthesis
    const refreshVoices = () => {
      if (!mountedRef.current) return
      const availableVoices = synthesis.getVoices()
      browserVoicesRef.current = availableVoices
      setVoices(toVoiceOptions(availableVoices))
      if (!availableVoices.length) return

      const previousId = selectedVoiceIdRef.current
      const savedVoice = availableVoices.find(
        (voice) => getVoiceId(voice) === savedVoiceIdRef.current,
      )
      const currentVoice = availableVoices.find((voice) => getVoiceId(voice) === previousId)
      const selectedVoice = currentVoice || savedVoice || preferVoice(availableVoices)
      const nextId = getVoiceId(selectedVoice)
      selectedVoiceIdRef.current = nextId
      setSelectedVoiceIdState(nextId)

      const pendingIndex = pendingSentenceRef.current
      if (pendingIndex !== null) {
        pendingSentenceRef.current = null
        startSentenceRef.current(pendingIndex)
      } else if (
        previousId &&
        previousId !== nextId &&
        (statusRef.current === 'playing' || statusRef.current === 'preparing')
      ) {
        startSentenceRef.current(currentSentenceIndexRef.current)
      }
    }

    refreshVoices()
    synthesis.addEventListener('voiceschanged', refreshVoices)

    return () => {
      mountedRef.current = false
      generationRef.current += 1
      clearTimers()
      synthesis.removeEventListener('voiceschanged', refreshVoices)
      synthesis.cancel()
      utteranceRef.current = null
      pendingSentenceRef.current = null
    }
  }, [clearTimers, updateStatus])

  const play = useCallback(() => {
    if (statusRef.current === 'playing' || statusRef.current === 'preparing' || statusRef.current === 'loading-voices') return
    if (statusRef.current === 'paused') {
      if (restartPausedSentenceRef.current) {
        startSentenceRef.current(currentSentenceIndexRef.current)
      } else {
        window.speechSynthesis.resume()
        updateStatus('playing')
      }
      return
    }
    const index = statusRef.current === 'completed' ? 0 : currentSentenceIndexRef.current
    startSentenceRef.current(index)
  }, [updateStatus])

  const pause = useCallback(() => {
    if (!supportedRef.current || statusRef.current !== 'playing') return
    window.speechSynthesis.pause()
    updateStatus('paused')
  }, [updateStatus])

  const stop = useCallback(() => {
    invalidateSpeech()
    restartPausedSentenceRef.current = false
    currentSentenceIndexRef.current = 0
    setCurrentSentenceIndex(0)
    setActiveSentenceIndex(null)
    setErrorMessage(null)
    updateStatus('stopped')
  }, [invalidateSpeech, updateStatus])

  const moveToSentence = useCallback((offset: -1 | 1) => {
    if (!sentencesRef.current.length) return
    const target = Math.min(
      Math.max(currentSentenceIndexRef.current + offset, 0),
      sentencesRef.current.length - 1,
    )
    if (target === currentSentenceIndexRef.current) return

    const wasActive = statusRef.current === 'playing' || statusRef.current === 'preparing' || statusRef.current === 'loading-voices'
    const wasPaused = statusRef.current === 'paused'
    currentSentenceIndexRef.current = target
    setCurrentSentenceIndex(target)
    setErrorMessage(null)

    if (wasActive) {
      startSentenceRef.current(target)
    } else if (wasPaused) {
      invalidateSpeech()
      restartPausedSentenceRef.current = true
      setActiveSentenceIndex(target)
      updateStatus('paused')
    } else {
      setActiveSentenceIndex(null)
      updateStatus('stopped')
    }
  }, [invalidateSpeech, updateStatus])

  const setRate = useCallback((nextRate: PlaybackRate) => {
    if (!validRates.includes(nextRate)) return
    rateRef.current = nextRate
    setRateState(nextRate)
    try {
      window.localStorage.setItem(RATE_STORAGE_KEY, String(nextRate))
    } catch {
      // The setting remains active for this page session.
    }

    if (statusRef.current === 'playing' || statusRef.current === 'preparing' || statusRef.current === 'loading-voices') {
      startSentenceRef.current(currentSentenceIndexRef.current)
    } else if (statusRef.current === 'paused') {
      invalidateSpeech()
      restartPausedSentenceRef.current = true
      setActiveSentenceIndex(currentSentenceIndexRef.current)
      updateStatus('paused')
    }
  }, [invalidateSpeech, updateStatus])

  const setVoice = useCallback((voiceId: string) => {
    if (!browserVoicesRef.current.some((voice) => getVoiceId(voice) === voiceId)) return
    if (selectedVoiceIdRef.current === voiceId) return
    selectedVoiceIdRef.current = voiceId
    savedVoiceIdRef.current = voiceId
    setSelectedVoiceIdState(voiceId)
    try {
      window.localStorage.setItem(VOICE_STORAGE_KEY, voiceId)
    } catch {
      // Voice availability and storage both vary by browser.
    }

    if (statusRef.current === 'playing' || statusRef.current === 'preparing' || statusRef.current === 'loading-voices') {
      startSentenceRef.current(currentSentenceIndexRef.current)
    } else if (statusRef.current === 'paused') {
      invalidateSpeech()
      restartPausedSentenceRef.current = true
      setActiveSentenceIndex(currentSentenceIndexRef.current)
      updateStatus('paused')
    }
  }, [invalidateSpeech, updateStatus])

  return {
    status,
    supported,
    voices,
    selectedVoiceId,
    rate,
    currentSentenceIndex,
    activeSentenceIndex,
    sentenceCount: sentences.length,
    errorMessage,
    play,
    pause,
    resume: play,
    stop,
    previous: () => moveToSentence(-1),
    next: () => moveToSentence(1),
    setRate,
    setVoice,
  }
}

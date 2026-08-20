'use client'

import type { RefObject } from 'react'
import { Maximize2, Minimize2, Pause, Play, SkipBack, SkipForward, Square } from 'lucide-react'
import { ButtonLoader } from '@/components/loading/LoadingPrimitives'
import type { PlaybackRate, SpeechReaderStatus, VoiceOption } from './useSpeechReader'
import type { FontSizePreference, LineSpacingPreference } from './useReadingPreferences'

interface BlogReaderControlsProps {
  status: SpeechReaderStatus
  supported: boolean | null
  voices: VoiceOption[]
  selectedVoiceId: string
  rate: PlaybackRate
  currentSentenceIndex: number
  sentenceCount: number
  errorMessage: string | null
  fontSize: FontSizePreference
  lineSpacing: LineSpacingPreference
  focusMode: boolean
  focusToggleRef: RefObject<HTMLButtonElement | null>
  onPlay(): void
  onPause(): void
  onStop(): void
  onPrevious(): void
  onNext(): void
  onRateChange(rate: PlaybackRate): void
  onVoiceChange(voiceId: string): void
  onFontSizeChange(value: FontSizePreference): void
  onLineSpacingChange(value: LineSpacingPreference): void
  onFocusModeChange(): void
}

const rates: PlaybackRate[] = [0.75, 1, 1.25, 1.5]

const statusLabels: Record<SpeechReaderStatus, string> = {
  idle: 'Ready to read',
  'loading-voices': 'Loading browser voices',
  preparing: 'Preparing voice readout',
  playing: 'Reading aloud',
  paused: 'Readout paused',
  stopped: 'Readout stopped',
  completed: 'Readout completed',
  error: 'Readout unavailable',
  unsupported: 'Voice readout is not supported in this browser',
}

const iconButtonClass = 'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2'
const segmentButtonClass = 'rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-1'

export default function BlogReaderControls({
  status,
  supported,
  voices,
  selectedVoiceId,
  rate,
  currentSentenceIndex,
  sentenceCount,
  errorMessage,
  fontSize,
  lineSpacing,
  focusMode,
  focusToggleRef,
  onPlay,
  onPause,
  onStop,
  onPrevious,
  onNext,
  onRateChange,
  onVoiceChange,
  onFontSizeChange,
  onLineSpacingChange,
  onFocusModeChange,
}: BlogReaderControlsProps) {
  const isPreparing = status === 'preparing' || status === 'loading-voices'
  const isPlaying = status === 'playing'
  const isPaused = status === 'paused'
  const speechDisabled = supported !== true || sentenceCount === 0
  const hasPrevious = currentSentenceIndex > 0
  const hasNext = currentSentenceIndex < sentenceCount - 1

  return (
    <section
      aria-label="Reading controls"
      className="mt-8 rounded-2xl border border-slate-200 bg-slate-50/80 p-3 shadow-sm sm:p-4"
    >
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onPrevious}
          disabled={speechDisabled || !hasPrevious}
          className={iconButtonClass}
          aria-label="Previous sentence"
          title="Previous sentence"
        >
          <SkipBack size={17} aria-hidden="true" />
        </button>

        {isPreparing ? (
          <button
            type="button"
            disabled
            className={`${iconButtonClass} w-auto gap-2 px-3`}
            aria-label="Preparing voice readout"
          >
            <ButtonLoader label="Preparing voice readout" />
            <span className="text-sm">Preparing</span>
          </button>
        ) : isPlaying ? (
          <button
            type="button"
            onClick={onPause}
            className={`${iconButtonClass} w-auto gap-2 px-3`}
            aria-label="Pause voice readout"
          >
            <Pause size={17} aria-hidden="true" />
            <span className="text-sm">Pause</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onPlay}
            disabled={speechDisabled}
            className={`${iconButtonClass} w-auto gap-2 px-3`}
            aria-label={isPaused ? 'Resume voice readout' : 'Play voice readout'}
          >
            <Play size={17} aria-hidden="true" />
            <span className="text-sm">{isPaused ? 'Resume' : 'Play'}</span>
          </button>
        )}

        <button
          type="button"
          onClick={onStop}
          disabled={speechDisabled || status === 'idle' || status === 'stopped'}
          className={iconButtonClass}
          aria-label="Stop and reset voice readout"
          title="Stop"
        >
          <Square size={15} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={speechDisabled || !hasNext}
          className={iconButtonClass}
          aria-label="Next sentence"
          title="Next sentence"
        >
          <SkipForward size={17} aria-hidden="true" />
        </button>

        <span className="min-w-0 text-xs text-slate-500" role="status" aria-live="polite">
          {statusLabels[status]}
          {sentenceCount > 0 && ` · ${Math.min(currentSentenceIndex + 1, sentenceCount)} of ${sentenceCount}`}
        </span>

        <button
          ref={focusToggleRef}
          type="button"
          onClick={onFocusModeChange}
          className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2"
          aria-pressed={focusMode}
        >
          {focusMode ? <Minimize2 size={15} aria-hidden="true" /> : <Maximize2 size={15} aria-hidden="true" />}
          {focusMode ? 'Exit focus mode' : 'Focus mode'}
        </button>
      </div>

      {supported === false && (
        <p className="mt-3 text-sm text-amber-800">
          Voice readout is not supported by this browser. You can still use the reading controls below.
        </p>
      )}
      {errorMessage && <p className="mt-3 text-sm text-red-700" role="alert">{errorMessage}</p>}

      <div className="mt-4 grid gap-3 border-t border-slate-200 pt-4 sm:grid-cols-2">
        <label className="min-w-0 text-xs font-medium text-slate-600">
          Voice
          <select
            value={selectedVoiceId}
            onChange={(event) => onVoiceChange(event.target.value)}
            disabled={supported !== true || voices.length === 0}
            className="mt-1 block w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-600 disabled:cursor-not-allowed disabled:bg-slate-100"
            aria-label="Voice for blog readout"
          >
            {voices.length === 0 ? (
              <option value="">{supported === false ? 'No voice support' : 'Loading voices…'}</option>
            ) : (
              voices.map((voice) => (
                <option key={voice.id} value={voice.id}>
                  {voice.name} ({voice.lang}){voice.isDefault ? ' — default' : ''}
                </option>
              ))
            )}
          </select>
        </label>

        <fieldset className="min-w-0">
          <legend className="text-xs font-medium text-slate-600">Playback speed</legend>
          <div className="mt-1 flex flex-wrap gap-1 rounded-lg bg-slate-200/70 p-1">
            {rates.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => onRateChange(option)}
                disabled={supported !== true}
                aria-pressed={rate === option}
                className={`${segmentButtonClass} ${rate === option ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:bg-white/70'} disabled:opacity-40`}
              >
                {option}×
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="min-w-0">
          <legend className="text-xs font-medium text-slate-600">Article font size</legend>
          <div className="mt-1 flex gap-1 rounded-lg bg-slate-200/70 p-1">
            {(['small', 'medium', 'large'] as FontSizePreference[]).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => onFontSizeChange(option)}
                aria-pressed={fontSize === option}
                aria-label={`${option} article font size`}
                className={`${segmentButtonClass} flex-1 capitalize ${fontSize === option ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:bg-white/70'}`}
              >
                {option === 'small' ? 'A' : option === 'medium' ? 'A+' : 'A++'}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="min-w-0">
          <legend className="text-xs font-medium text-slate-600">Article line spacing</legend>
          <div className="mt-1 flex gap-1 rounded-lg bg-slate-200/70 p-1">
            {(['compact', 'comfortable', 'spacious'] as LineSpacingPreference[]).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => onLineSpacingChange(option)}
                aria-pressed={lineSpacing === option}
                className={`${segmentButtonClass} min-w-0 flex-1 capitalize ${lineSpacing === option ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:bg-white/70'}`}
              >
                <span className="sm:hidden" aria-hidden="true">{option.charAt(0).toUpperCase()}</span>
                <span className="sr-only sm:not-sr-only">{option}</span>
              </button>
            ))}
          </div>
        </fieldset>
      </div>
    </section>
  )
}

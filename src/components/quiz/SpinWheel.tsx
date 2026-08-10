'use client'

import { motion } from 'framer-motion'
import type { QuizCategory } from '@/lib/quizQuestions'

interface SpinWheelProps {
  categories: QuizCategory[]
  rotation: number
  isSpinning: boolean
  reduceMotion: boolean
  selectedCategoryId: string | null
  onSpin: () => void
  onSpinComplete: () => void
}

const SEGMENT_COLORS = [
  '#4f46e5',
  '#2563eb',
  '#0891b2',
  '#059669',
  '#65a30d',
  '#d97706',
  '#ea580c',
  '#db2777',
]

const LABEL_LINES: Record<string, string[]> = {
  basics: ['Basics'],
  'under-the-hood': ['Under the', 'Hood'],
  'prompt-craft': ['Prompt', 'Craft'],
  'agents-and-tools': ['Agents &', 'Tools'],
  'data-and-memory': ['Data &', 'Memory'],
  'risks-and-guardrails': ['Risks &', 'Guardrails'],
  'buzzword-bingo': ['Buzzword', 'Bingo'],
  wildcard: ['Wildcard'],
}

function pointOnCircle(angle: number, radius: number) {
  const radians = ((angle - 90) * Math.PI) / 180
  return {
    x: 200 + radius * Math.cos(radians),
    y: 200 + radius * Math.sin(radians),
  }
}

function segmentPath(index: number) {
  const start = pointOnCircle(index * 45 - 22.5, 190)
  const end = pointOnCircle(index * 45 + 22.5, 190)

  return `M 200 200 L ${start.x} ${start.y} A 190 190 0 0 1 ${end.x} ${end.y} Z`
}

export default function SpinWheel({
  categories,
  rotation,
  isSpinning,
  reduceMotion,
  selectedCategoryId,
  onSpin,
  onSpinComplete,
}: SpinWheelProps) {
  return (
    <div className="relative mx-auto w-full max-w-[min(86vw,580px)] px-3 pt-5 sm:px-5 sm:pt-7">
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-0 z-30 -translate-x-1/2 drop-shadow-lg"
      >
        <div className="h-0 w-0 border-x-[18px] border-t-[34px] border-x-transparent border-t-slate-950 sm:border-x-[22px] sm:border-t-[42px]" />
        <div className="absolute left-1/2 top-1.5 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-white/90 sm:h-3 sm:w-3" />
      </div>

      <div className="relative aspect-square rounded-full bg-slate-950 p-2.5 shadow-[0_24px_60px_-22px_rgba(15,23,42,0.65)] ring-1 ring-slate-950/20 sm:p-4">
        <div className="relative h-full w-full overflow-hidden rounded-full bg-slate-900 ring-4 ring-white/15">
          <motion.div
            className="h-full w-full will-change-transform"
            animate={{ rotate: rotation }}
            initial={false}
            transition={{
              duration: reduceMotion ? 0 : 4.6,
              ease: [0.12, 0.72, 0.08, 1],
            }}
            onAnimationComplete={onSpinComplete}
          >
            <svg
              aria-hidden="true"
              className="h-full w-full"
              viewBox="0 0 400 400"
            >
              <defs>
                <filter id="wheel-label-shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="1" stdDeviation="1.4" floodColor="#0f172a" floodOpacity="0.7" />
                </filter>
              </defs>
              {categories.map((category, index) => {
                const selected = category.id === selectedCategoryId
                const labelPoint = pointOnCircle(index * 45, 125)
                const lines = LABEL_LINES[category.id] ?? [category.name]

                return (
                  <g key={category.id}>
                    <path
                      d={segmentPath(index)}
                      fill={SEGMENT_COLORS[index]}
                      opacity={selectedCategoryId && !selected ? 0.72 : 1}
                      stroke={selected ? '#ffffff' : '#0f172a'}
                      strokeWidth={selected ? 7 : 3}
                      className="transition-[opacity,stroke-width] duration-300"
                    />
                    <text
                      x={labelPoint.x}
                      y={labelPoint.y - (lines.length - 1) * 7}
                      fill="white"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      filter="url(#wheel-label-shadow)"
                      className="select-none text-[11px] font-black uppercase tracking-[0.04em] sm:text-[12px]"
                    >
                      {lines.map((line, lineIndex) => (
                        <tspan
                          key={line}
                          x={labelPoint.x}
                          dy={lineIndex === 0 ? 0 : 15}
                        >
                          {line}
                        </tspan>
                      ))}
                    </text>
                  </g>
                )
              })}
            </svg>
          </motion.div>

          <div className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_28%,rgba(255,255,255,0.18),transparent_36%)]" />
        </div>

        <button
          type="button"
          onClick={onSpin}
          disabled={isSpinning}
          aria-label={isSpinning ? 'Category wheel is spinning' : 'Spin the category wheel'}
          className="absolute left-1/2 top-1/2 z-20 flex aspect-square w-[25%] min-w-[76px] max-w-[112px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[5px] border-white bg-slate-950 text-sm font-black tracking-[0.16em] text-white shadow-[0_10px_28px_rgba(15,23,42,0.55)] transition hover:scale-105 hover:bg-slate-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-300 focus-visible:ring-offset-4 focus-visible:ring-offset-slate-950 active:scale-95 disabled:cursor-not-allowed disabled:text-white/65 disabled:hover:scale-100 sm:text-lg"
        >
          {isSpinning ? 'WAIT' : 'SPIN'}
        </button>
      </div>
    </div>
  )
}

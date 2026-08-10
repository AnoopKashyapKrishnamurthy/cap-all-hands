'use client'

import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Eye, RotateCcw, Sparkles } from 'lucide-react'
import type { QuizCategory, QuizRiddle } from '@/lib/quizQuestions'

interface RiddleCardProps {
  category: QuizCategory
  riddle: QuizRiddle
  answerRevealed: boolean
  reduceMotion: boolean
  onReveal: () => void
  onNextSpin: () => void
  onReset: () => void
}

export default function RiddleCard({
  category,
  riddle,
  answerRevealed,
  reduceMotion,
  onReveal,
  onNextSpin,
  onReset,
}: RiddleCardProps) {
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    headingRef.current?.focus()
  }, [riddle.id])

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -12, scale: 0.98 }}
      transition={{ duration: reduceMotion ? 0 : 0.35, ease: 'easeOut' }}
      className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_70px_-35px_rgba(15,23,42,0.4)]"
    >
      <div className="h-2 bg-gradient-to-r from-primary-600 via-blue-500 to-orange-500" />
      <div className="p-6 sm:p-9 lg:p-12">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-primary-700">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            {category.name}
          </span>
          <span className="text-sm font-semibold text-slate-400">Riddle {riddle.id}</span>
        </div>

        <div className="py-10 sm:py-14">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-orange-600">Can you name the term?</p>
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="text-2xl font-bold leading-snug tracking-tight text-slate-900 outline-none sm:text-3xl lg:text-4xl"
          >
            “{riddle.prompt}”
          </h2>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {!answerRevealed ? (
            <motion.div
              key="reveal-control"
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
              className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center sm:p-6"
            >
              <p className="mb-4 text-sm text-slate-500">Give the room a moment, then reveal the answer.</p>
              <button
                type="button"
                onClick={onReveal}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white shadow-md shadow-orange-500/20 transition hover:bg-orange-600 focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-200 active:scale-[0.98]"
              >
                <Eye className="h-4 w-4" aria-hidden="true" />
                Reveal Answer
              </button>
            </motion.div>
          ) : (
            <motion.section
              key="answer"
              aria-live="polite"
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 sm:p-7"
            >
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Answer</p>
              <h3 className="mt-2 text-2xl font-black tracking-tight text-emerald-950 sm:text-3xl">
                {riddle.answer}
              </h3>
              <p className="mt-4 border-t border-emerald-200 pt-4 text-base leading-relaxed text-emerald-950/80 sm:text-lg">
                {riddle.explanation}
              </p>
            </motion.section>
          )}
        </AnimatePresence>

        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset Round
          </button>
          <button
            type="button"
            onClick={onNextSpin}
            className="btn-primary min-h-12 gap-2 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/25"
          >
            Next Spin
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </motion.article>
  )
}

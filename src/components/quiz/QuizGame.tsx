'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { RotateCcw } from 'lucide-react'
import RiddleCard from '@/components/quiz/RiddleCard'
import SpinWheel from '@/components/quiz/SpinWheel'
import {
  quizCategories,
  type QuizCategory,
  type QuizRiddle,
} from '@/lib/quizQuestions'

type GameView = 'wheel' | 'riddle'
type UsedRiddlesByCategory = Record<string, string[]>

const SEGMENT_ANGLE = 360 / quizCategories.length

function randomItem<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)]
}

export default function QuizGame() {
  const reduceMotion = Boolean(useReducedMotion())
  const [view, setView] = useState<GameView>('wheel')
  const [isSpinning, setIsSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [pendingCategoryIndex, setPendingCategoryIndex] = useState<number | null>(null)
  const [lastCategoryIndex, setLastCategoryIndex] = useState<number | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<QuizCategory | null>(null)
  const [selectedRiddle, setSelectedRiddle] = useState<QuizRiddle | null>(null)
  const [answerRevealed, setAnswerRevealed] = useState(false)
  const [usedRiddleIds, setUsedRiddleIds] = useState<UsedRiddlesByCategory>({})
  const transitionTimer = useRef<number | null>(null)

  const clearTransitionTimer = useCallback(() => {
    if (transitionTimer.current !== null) {
      window.clearTimeout(transitionTimer.current)
      transitionTimer.current = null
    }
  }, [])

  useEffect(() => clearTransitionTimer, [clearTransitionTimer])

  const spin = () => {
    if (isSpinning) return

    clearTransitionTimer()
    const eligibleCategoryIndexes = quizCategories
      .map((_, index) => index)
      .filter((index) => index !== lastCategoryIndex)
    const categoryIndex = randomItem(eligibleCategoryIndexes)
    const normalizedRotation = ((rotation % 360) + 360) % 360
    const targetPosition = ((-categoryIndex * SEGMENT_ANGLE) % 360 + 360) % 360
    const alignmentDelta = (targetPosition - normalizedRotation + 360) % 360
    const fullRotations = reduceMotion ? 0 : 5 + Math.floor(Math.random() * 3)
    const reducedMotionNudge = reduceMotion && alignmentDelta === 0 ? 360 : 0

    setSelectedCategory(null)
    setPendingCategoryIndex(categoryIndex)
    setIsSpinning(true)
    setRotation((current) => current + fullRotations * 360 + alignmentDelta + reducedMotionNudge)
  }

  const completeSpin = () => {
    if (!isSpinning || pendingCategoryIndex === null) return

    const category = quizCategories[pendingCategoryIndex]
    const usedInCurrentCycle = usedRiddleIds[category.id] ?? []
    const unusedRiddles = category.riddles.filter(
      (riddle) => !usedInCurrentCycle.includes(riddle.id),
    )
    const availableRiddles = unusedRiddles.length > 0 ? unusedRiddles : category.riddles
    const riddle = randomItem(availableRiddles)

    setUsedRiddleIds((current) => ({
      ...current,
      [category.id]: unusedRiddles.length > 0
        ? [...(current[category.id] ?? []), riddle.id]
        : [riddle.id],
    }))
    setSelectedCategory(category)
    setSelectedRiddle(riddle)
    setLastCategoryIndex(pendingCategoryIndex)
    setPendingCategoryIndex(null)
    setAnswerRevealed(false)
    setIsSpinning(false)

    transitionTimer.current = window.setTimeout(
      () => setView('riddle'),
      reduceMotion ? 150 : 700,
    )
  }

  const nextSpin = () => {
    clearTransitionTimer()
    setView('wheel')
    setSelectedCategory(null)
    setSelectedRiddle(null)
    setAnswerRevealed(false)
  }

  const resetRound = () => {
    clearTransitionTimer()
    setView('wheel')
    setIsSpinning(false)
    setRotation(0)
    setPendingCategoryIndex(null)
    setLastCategoryIndex(null)
    setSelectedCategory(null)
    setSelectedRiddle(null)
    setAnswerRevealed(false)
    setUsedRiddleIds({})
  }

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {view === 'wheel' ? (
          <motion.section
            key="wheel"
            aria-labelledby="wheel-heading"
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
            className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white px-3 py-7 shadow-soft sm:px-8 sm:py-10"
          >
            <div className="pointer-events-none absolute -left-28 top-8 h-72 w-72 rounded-full bg-primary-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -right-24 bottom-0 h-64 w-64 rounded-full bg-orange-400/10 blur-3xl" />

            <div className="relative text-center">
              <h2 id="wheel-heading" className="text-lg font-bold text-slate-900 sm:text-xl">
                Spin for a category
              </h2>
              <p className="mt-1 text-sm text-slate-500">The pointer decides what the room gets next.</p>
            </div>

            <SpinWheel
              categories={quizCategories}
              rotation={rotation}
              isSpinning={isSpinning}
              reduceMotion={reduceMotion}
              selectedCategoryId={selectedCategory?.id ?? null}
              onSpin={spin}
              onSpinComplete={completeSpin}
            />

            <div className="relative mt-7 min-h-10 text-center" role="status" aria-live="polite">
              {isSpinning ? (
                <p className="font-semibold text-slate-600">Finding the next category…</p>
              ) : selectedCategory ? (
                <p className="inline-flex rounded-full bg-slate-950 px-5 py-2 text-sm font-bold text-white shadow-lg">
                  {selectedCategory.name} selected
                </p>
              ) : (
                <p className="text-sm text-slate-500">Eight categories. Forty riddles. One room guessing.</p>
              )}
            </div>

            <button
              type="button"
              onClick={resetRound}
              disabled={isSpinning}
              className="relative mx-auto mt-3 flex min-h-10 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset Round
            </button>
          </motion.section>
        ) : selectedCategory && selectedRiddle ? (
          <RiddleCard
            key={selectedRiddle.id}
            category={selectedCategory}
            riddle={selectedRiddle}
            answerRevealed={answerRevealed}
            reduceMotion={reduceMotion}
            onReveal={() => setAnswerRevealed(true)}
            onNextSpin={nextSpin}
            onReset={resetRound}
          />
        ) : null}
      </AnimatePresence>
    </div>
  )
}

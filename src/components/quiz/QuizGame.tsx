'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { HelpCircle, Play, RotateCcw, Sparkles } from 'lucide-react'
import useParticipantSpinner, {
  type SpinnerParticipant,
} from '@/components/people/useParticipantSpinner'
import { quizQuestions } from '@/lib/quizQuestions'

interface QuizGameProps {
  participants: SpinnerParticipant[]
}

export default function QuizGame({ participants }: QuizGameProps) {
  const [questionIndex, setQuestionIndex] = useState(0)
  const {
    status,
    remainingParticipants,
    selectedParticipant,
    flickerParticipant,
    spinNext,
    reset: resetSpinner,
  } = useParticipantSpinner(participants)

  const currentQuestion = quizQuestions[questionIndex]
  const turnsTaken = participants.length - remainingParticipants.length
  const roundComplete = status === 'speaking' && remainingParticipants.length === 0
  const isSpinning = status === 'selecting'

  const nextQuestion = () => {
    setQuestionIndex((current) => (current + 1) % quizQuestions.length)
  }

  const resetQuiz = () => {
    setQuestionIndex(0)
    resetSpinner()
  }

  if (participants.length === 0) {
    return (
      <div className="bg-white border border-dashed rounded-2xl p-12 text-center">
        <p className="text-gray-700 font-medium">No participants available</p>
        <p className="text-sm text-gray-500 mt-2">
          Team members will appear here once they complete their profiles.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
      <div className="h-1.5 bg-gray-100">
        <motion.div
          className="h-full bg-orange-500"
          animate={{ width: `${(turnsTaken / participants.length) * 100}%` }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        />
      </div>

      <div className="grid lg:grid-cols-2">
        <section className="relative min-h-[360px] overflow-hidden border-b lg:border-b-0 lg:border-r p-6 sm:p-8 flex flex-col items-center justify-center text-center">
          <AnimatePresence>
            {isSpinning && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-orange-50 to-red-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            )}
          </AnimatePresence>

          <div className="relative z-10 w-full max-w-sm">
            <p className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-6">
              {isSpinning ? 'Picking a participant...' : 'Participant spinner'}
            </p>

            <AnimatePresence mode="wait">
              {isSpinning ? (
                <motion.div
                  key="spinning"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1, y: [-4, 4, -4] }}
                  exit={{ opacity: 0, scale: 1.15, filter: 'blur(8px)' }}
                  transition={{ y: { repeat: Infinity, duration: 0.2 } }}
                >
                  <ParticipantAvatar participant={flickerParticipant} muted />
                  <h2 className="mt-5 text-2xl sm:text-3xl font-extrabold tracking-wide text-gray-400 break-words">
                    {flickerParticipant?.display_name.toUpperCase()}
                  </h2>
                </motion.div>
              ) : selectedParticipant ? (
                <motion.div
                  key={selectedParticipant.id}
                  initial={{ opacity: 0, scale: 0.6, rotate: -8 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', damping: 12, stiffness: 100 }}
                >
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-wider mb-5">
                    <Sparkles className="w-3 h-3" /> Selected participant
                  </span>
                  <ParticipantAvatar participant={selectedParticipant} />
                  <h2 className="mt-5 text-3xl sm:text-4xl font-black tracking-tight text-gray-900 break-words">
                    {selectedParticipant.display_name}
                  </h2>
                  <p className="mt-2 text-sm text-gray-500">
                    {roundComplete
                      ? 'Everyone has had a turn. Reset to start a new round.'
                      : `${remainingParticipants.length} participant${remainingParticipants.length === 1 ? '' : 's'} left this round`}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="ready"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="w-28 h-28 mx-auto rounded-full bg-orange-50 border-4 border-orange-100 flex items-center justify-center text-5xl">
                    ?
                  </div>
                  <h2 className="mt-5 text-2xl sm:text-3xl font-bold text-gray-900">Who will answer?</h2>
                  <p className="mt-2 text-sm text-gray-500">Spin to choose from {participants.length} team members.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        <section className="p-6 sm:p-8 lg:p-10 flex flex-col min-h-[360px]">
          <div className="flex items-center justify-between gap-4 mb-8">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600">
              <HelpCircle className="w-5 h-5" />
              Question {questionIndex + 1} of {quizQuestions.length}
            </span>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              {currentQuestion.category}
            </span>
          </div>

          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex items-center"
          >
            <h2 className="text-2xl sm:text-3xl font-bold leading-tight text-gray-900">
              {currentQuestion.prompt}
            </h2>
          </motion.div>

          <div className="mt-10 grid sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={spinNext}
              disabled={isSpinning || roundComplete}
              className="inline-flex items-center justify-center gap-2 bg-orange-500 text-white px-5 py-3 rounded-xl font-semibold shadow-md shadow-orange-500/20 hover:bg-orange-600 active:scale-[0.98] transition-all disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
            >
              <Play className="w-4 h-4 fill-current" />
              {isSpinning ? 'Spinning...' : roundComplete ? 'Round complete' : 'Spin'}
            </button>
            <button
              type="button"
              onClick={nextQuestion}
              disabled={isSpinning}
              className="btn-secondary disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next Question
            </button>
          </div>

          <button
            type="button"
            onClick={resetQuiz}
            disabled={isSpinning}
            className="mt-4 self-center inline-flex items-center gap-1.5 py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RotateCcw className="w-4 h-4" /> Reset quiz
          </button>
        </section>
      </div>
    </div>
  )
}

function ParticipantAvatar({
  participant,
  muted = false,
}: {
  participant: SpinnerParticipant | null
  muted?: boolean
}) {
  const avatarClassName = `w-28 h-28 sm:w-32 sm:h-32 mx-auto rounded-full border-4 border-white shadow-xl object-cover ${muted ? 'opacity-80' : ''}`

  if (participant?.avatar_url) {
    return (
      <img
        src={participant.avatar_url}
        alt={participant.display_name}
        className={avatarClassName}
      />
    )
  }

  return (
    <div className={`${avatarClassName} bg-orange-100 flex items-center justify-center text-4xl font-bold text-orange-600`}>
      {participant?.display_name.charAt(0).toUpperCase() || '?'}
    </div>
  )
}

'use client'

import { motion, useReducedMotion } from 'framer-motion'

interface LoadingProps {
  className?: string
  label?: string
}

export function Skeleton({ className = '' }: { className?: string }) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      aria-hidden="true"
      className={`overflow-hidden rounded-lg bg-slate-200/80 ${className}`}
      style={
        reduceMotion
          ? undefined
          : {
              backgroundImage:
                'linear-gradient(100deg, transparent 20%, rgba(255,255,255,0.65) 50%, transparent 80%)',
              backgroundSize: '220% 100%',
            }
      }
      animate={reduceMotion ? undefined : { backgroundPositionX: ['120%', '-120%'] }}
      transition={
        reduceMotion
          ? undefined
          : { duration: 1.5, ease: 'linear', repeat: Infinity }
      }
    />
  )
}

export function ButtonLoader({
  className = '',
  label = 'Loading',
}: LoadingProps) {
  const reduceMotion = useReducedMotion()

  return (
    <span className={`inline-flex shrink-0 items-center ${className}`}>
      <motion.span
        aria-hidden="true"
        className="block h-4 w-4 rounded-full border-2 border-current border-r-transparent"
        animate={reduceMotion ? undefined : { rotate: 360 }}
        transition={
          reduceMotion
            ? undefined
            : { duration: 0.75, ease: 'linear', repeat: Infinity }
        }
      />
      <span className="sr-only">{label}</span>
    </span>
  )
}

export function InlineLoader({
  className = '',
  label = 'Loading',
}: LoadingProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 text-sm text-slate-500 ${className}`}
      role="status"
      aria-live="polite"
    >
      <ButtonLoader label={label} />
      <span>{label}</span>
    </span>
  )
}

export function PageLoader({ label = 'Loading page' }: { label?: string }) {
  const reduceMotion = useReducedMotion()

  return (
    <div
      className="flex min-h-[45vh] items-center justify-center px-6"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <motion.div
        className="flex flex-col items-center gap-4"
        initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: reduceMotion ? 0 : 0.2, ease: 'easeOut' }}
      >
        <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-sm font-extrabold text-orange-500 shadow-sm ring-1 ring-slate-200">
          CAP
          <motion.span
            aria-hidden="true"
            className="absolute inset-[-5px] rounded-[1.15rem] border-2 border-orange-400/70 border-r-transparent"
            animate={reduceMotion ? undefined : { rotate: 360 }}
            transition={
              reduceMotion
                ? undefined
                : { duration: 1, ease: 'linear', repeat: Infinity }
            }
          />
        </div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
      </motion.div>
    </div>
  )
}

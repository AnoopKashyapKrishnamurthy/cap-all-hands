'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { Skeleton } from './LoadingPrimitives'

function Shell({
  children,
  className = '',
  label = 'Loading page content',
}: {
  children: React.ReactNode
  className?: string
  label?: string
}) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, scale: 0.995 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: reduceMotion ? 0 : 0.2, ease: 'easeOut' }}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
    >
      {children}
      <span className="sr-only">{label}</span>
    </motion.div>
  )
}

function HeaderSkeleton({ action = true }: { action?: boolean }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-3">
        <Skeleton className="h-10 w-52 max-w-full" />
        <Skeleton className="h-5 w-80 max-w-full" />
      </div>
      {action && <Skeleton className="h-11 w-36" />}
    </div>
  )
}

function CardSkeleton({ image = true }: { image?: boolean }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {image && <Skeleton className="h-44 w-full rounded-none" />}
      <div className="space-y-4 p-5">
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex items-center gap-3 pt-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <Shell className="mx-auto max-w-7xl space-y-10 px-4 py-8 sm:px-6 lg:px-8" label="Loading dashboard">
      <HeaderSkeleton action={false} />
      <div className="grid auto-rows-[minmax(240px,auto)] grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-3xl border bg-white p-6 md:col-span-2 md:row-span-2 sm:p-8">
          <div className="grid h-full gap-8 lg:grid-cols-2">
            <div className="space-y-5">
              <Skeleton className="h-12 w-12 rounded-2xl" />
              <Skeleton className="h-7 w-40" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="mt-8 h-10 w-40" />
            </div>
            <div className="space-y-3 rounded-2xl bg-slate-50 p-5">
              <Skeleton className="mb-5 h-4 w-28" />
              {[0, 1, 2, 3].map((item) => (
                <div key={item} className="flex gap-3 rounded-xl bg-white p-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-4/5" />
                    <Skeleton className="h-3 w-3/5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {[0, 1, 2].map((item) => (
          <div key={item} className="space-y-5 rounded-3xl border bg-white p-6">
            <Skeleton className="h-12 w-12 rounded-2xl" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-10 w-36" />
          </div>
        ))}
      </div>
    </Shell>
  )
}

export function BlogListSkeleton() {
  return (
    <Shell className="mx-auto max-w-6xl space-y-14 px-6 py-20" label="Loading blogs">
      <HeaderSkeleton />
      <section className="space-y-8">
        <Skeleton className="h-7 w-44" />
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((item) => <CardSkeleton key={item} />)}
        </div>
      </section>
    </Shell>
  )
}

export function ReviewsSkeleton() {
  return (
    <Shell className="mx-auto max-w-5xl space-y-10 px-6 py-12" label="Loading book reviews">
      <HeaderSkeleton />
      <div className="space-y-6">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="flex gap-6 rounded-2xl border bg-white p-5">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-3 w-36" />
              </div>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-9 w-24 rounded-full" />
            </div>
            <Skeleton className="hidden h-40 w-40 md:block" />
          </div>
        ))}
      </div>
    </Shell>
  )
}

export function EventsSkeleton() {
  return (
    <Shell className="mx-auto max-w-6xl space-y-12 px-6 py-10" label="Loading events">
      <HeaderSkeleton />
      <section className="space-y-6">
        <Skeleton className="h-6 w-40" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((item) => <CardSkeleton key={item} />)}
        </div>
      </section>
    </Shell>
  )
}

export function GallerySkeleton() {
  return (
    <Shell className="mx-auto max-w-4xl space-y-6 px-4 py-10" label="Loading gallery">
      <HeaderSkeleton />
      <div className="grid grid-cols-3 gap-0.5 sm:gap-1">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
          <Skeleton key={item} className="aspect-square w-full rounded-sm" />
        ))}
      </div>
    </Shell>
  )
}

export function PeopleSkeleton() {
  return (
    <Shell className="mx-auto max-w-6xl space-y-8 py-4" label="Loading people">
      <Skeleton className="h-24 w-full rounded-2xl" />
      <HeaderSkeleton action={false} />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((item) => (
          <div key={item} className="space-y-5 rounded-2xl border bg-white p-6">
            <div className="flex gap-4">
              <Skeleton className="h-14 w-14 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        ))}
      </div>
    </Shell>
  )
}

export function DetailSkeleton() {
  return (
    <Shell className="mx-auto max-w-4xl space-y-8 px-4 py-10 sm:px-6" label="Loading details">
      <Skeleton className="h-5 w-24" />
      <Skeleton className="aspect-[16/7] w-full rounded-3xl" />
      <Skeleton className="h-11 w-4/5" />
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="space-y-3 rounded-2xl border bg-white p-6 sm:p-8">
        {['w-full', 'w-[95%]', 'w-[88%]', 'w-full', 'w-[72%]'].map((width, index) => (
          <Skeleton key={index} className={`h-4 ${width}`} />
        ))}
      </div>
    </Shell>
  )
}

export function FormPageSkeleton() {
  return (
    <Shell className="mx-auto max-w-4xl space-y-10 px-6 py-10" label="Loading form">
      <div className="space-y-3">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-10 w-64 max-w-full" />
        <Skeleton className="h-5 w-96 max-w-full" />
      </div>
      <div className="space-y-6 rounded-2xl border bg-white p-8 sm:p-10">
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </Shell>
  )
}

export function ProfileSkeleton() {
  return (
    <Shell className="mx-auto max-w-5xl space-y-8 px-6 py-6" label="Loading profile">
      <HeaderSkeleton action={false} />
      <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
        <div className="space-y-5 rounded-2xl border bg-white p-8 text-center">
          <Skeleton className="mx-auto h-28 w-28 rounded-full" />
          <Skeleton className="mx-auto h-6 w-40" />
          <Skeleton className="mx-auto h-4 w-56" />
        </div>
        <div className="space-y-6 rounded-2xl border bg-white p-8">
          <Skeleton className="h-7 w-36" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-11 w-36" />
        </div>
      </div>
    </Shell>
  )
}

export function QuizSkeleton() {
  return (
    <Shell className="mx-auto max-w-6xl space-y-8 py-4" label="Loading quiz">
      <HeaderSkeleton action={false} />
      <div className="grid overflow-hidden rounded-2xl border bg-white lg:grid-cols-2">
        <div className="flex min-h-[360px] flex-col items-center justify-center gap-5 border-b p-8 lg:border-b-0 lg:border-r">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-32 w-32 rounded-full" />
          <Skeleton className="h-8 w-52" />
        </div>
        <div className="flex min-h-[360px] flex-col justify-between gap-8 p-8">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-20 w-full" />
          <div className="grid gap-3 sm:grid-cols-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    </Shell>
  )
}

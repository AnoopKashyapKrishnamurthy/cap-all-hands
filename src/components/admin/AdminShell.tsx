'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, useReducedMotion } from 'framer-motion'
import {
  BookOpen,
  CalendarDays,
  FileText,
  Images,
  LayoutDashboard,
  Users,
} from 'lucide-react'
import type { ReactNode } from 'react'

const items = [
  { href: '/admin', label: 'Control panel', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/blogs', label: 'Blogs', icon: FileText },
  { href: '/admin/reviews', label: 'Reviews', icon: BookOpen },
  { href: '/admin/events', label: 'Events', icon: CalendarDays },
  { href: '/admin/gallery', label: 'Gallery', icon: Images },
]

export default function AdminShell({
  adminName,
  children,
}: {
  adminName: string
  children: ReactNode
}) {
  const pathname = usePathname()
  const reduceMotion = useReducedMotion()

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-600">
            CAP All Hands
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Admin Control Center
          </h1>
        </div>
        <p className="hidden text-sm text-slate-500 sm:block">Signed in as {adminName}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <nav
            aria-label="Admin sections"
            className="flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm lg:flex-col"
          >
            {items.map(({ href, label, icon: Icon }) => {
              const active = href === '/admin' ? pathname === href : pathname.startsWith(href)
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={`relative flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    active ? 'text-orange-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="admin-nav-active"
                      className="absolute inset-0 rounded-xl bg-orange-50"
                      transition={{ duration: reduceMotion ? 0 : 0.2, ease: 'easeOut' }}
                    />
                  )}
                  <Icon className="relative h-4 w-4" aria-hidden="true" />
                  <span className="relative">{label}</span>
                </Link>
              )
            })}
          </nav>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  )
}

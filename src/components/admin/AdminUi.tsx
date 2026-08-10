import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import type { AdminFilterOption } from '@/lib/admin/types'

export function AdminPageHeader({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-950">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      {action}
    </header>
  )
}

export function AdminStatCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string
  value: number
  detail: string
  icon: LucideIcon
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className="rounded-xl bg-orange-50 p-2 text-orange-600"><Icon className="h-4 w-4" /></span>
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight text-slate-950">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </div>
  )
}

export function AdminBadge({ tone = 'slate', children }: { tone?: 'slate' | 'green' | 'orange' | 'blue' | 'red'; children: ReactNode }) {
  const tones = {
    slate: 'bg-slate-100 text-slate-700',
    green: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    orange: 'bg-orange-50 text-orange-700 ring-orange-200',
    blue: 'bg-blue-50 text-blue-700 ring-blue-200',
    red: 'bg-red-50 text-red-700 ring-red-200',
  }
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${tones[tone]}`}>{children}</span>
}

export function AdminFilters({
  search,
  filter,
  filterName,
  filterLabel,
  options,
}: {
  search: string
  filter?: string
  filterName?: string
  filterLabel?: string
  options?: AdminFilterOption[]
}) {
  return (
    <form className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row" role="search">
      <label className="min-w-0 flex-1">
        <span className="sr-only">Search</span>
        <input name="q" defaultValue={search} placeholder="Search…" className="input-field h-10 text-sm" />
      </label>
      {options && filterName && (
        <label>
          <span className="sr-only">{filterLabel ?? 'Filter'}</span>
          <select name={filterName} defaultValue={filter} className="input-field h-10 min-w-40 py-0 text-sm">
            {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
      )}
      <button className="h-10 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-700">Apply</button>
      {(search || filter) && <Link href="?" className="flex h-10 items-center justify-center px-2 text-sm font-medium text-slate-500 hover:text-slate-900">Clear</Link>}
    </form>
  )
}

export function AdminEmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
      <p className="font-semibold text-slate-800">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  )
}

export function AdminErrorState({ message = 'This admin data could not be loaded.' }: { message?: string }) {
  return (
    <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
      {message} Refresh the page to try again.
    </div>
  )
}


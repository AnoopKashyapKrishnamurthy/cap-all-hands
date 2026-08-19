'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Power, ShieldCheck, ShieldX, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { ButtonLoader } from '@/components/loading/LoadingPrimitives'
import {
  deleteBlog,
  deleteEvent,
  deleteGalleryItem,
  deleteReview,
  setBlogPublished,
  updateSiteSection,
  updateUserLoginAccess,
  updateUserRole,
} from '@/lib/admin/actions'
import type { AdminActionResult } from '@/lib/admin/types'
import type { SiteSectionSetting } from '@/lib/access-control'
import type { UserRole } from '@/lib/auth'

type DeleteKind = 'blog' | 'review' | 'event' | 'gallery item'

const deleteActions = {
  blog: deleteBlog,
  review: deleteReview,
  event: deleteEvent,
  'gallery item': deleteGalleryItem,
}

function Feedback({ result }: { result: AdminActionResult | null }) {
  if (!result) return null
  return <p role="status" aria-live="polite" className={`mt-2 text-xs ${result.ok ? 'text-emerald-700' : 'text-red-600'}`}>{result.message}</p>
}

function ConfirmDialog({
  title,
  description,
  pending,
  confirmLabel = 'Delete',
  pendingLabel = 'Deleting',
  danger = true,
  onCancel,
  onConfirm,
}: {
  title: string
  description: string
  pending: boolean
  confirmLabel?: string
  pendingLabel?: string
  danger?: boolean
  onCancel: () => void
  onConfirm: () => void
}) {
  const reduceMotion = useReducedMotion()
  return (
    <motion.div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-sm" initial={reduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="presentation" onMouseDown={(event) => event.target === event.currentTarget && !pending && onCancel()}>
      <motion.div role="alertdialog" aria-modal="true" aria-labelledby="admin-confirm-title" aria-describedby="admin-confirm-description" onKeyDown={(event) => { if (event.key === 'Escape' && !pending) onCancel() }} initial={reduceMotion ? false : { opacity: 0, scale: 0.98, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: reduceMotion ? 0 : 0.18, ease: 'easeOut' }} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h3 id="admin-confirm-title" className="text-lg font-bold text-slate-950">{title}</h3>
        <p id="admin-confirm-description" className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" autoFocus disabled={pending} onClick={onCancel} className="btn-secondary px-4 py-2 text-sm disabled:opacity-50">Cancel</button>
          <button type="button" disabled={pending} onClick={onConfirm} className={`${danger ? 'btn-danger' : 'btn-primary'} gap-2 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60`}>
            {pending && <ButtonLoader label={pendingLabel} />}
            {pending ? `${pendingLabel}…` : confirmLabel}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export function AdminDeleteButton({ id, kind, label }: { id: string; kind: DeleteKind; label: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [result, setResult] = useState<AdminActionResult | null>(null)

  const confirm = () => startTransition(async () => {
    const nextResult = await deleteActions[kind](id)
    setResult(nextResult)
    if (nextResult.ok) {
      setOpen(false)
      router.refresh()
    }
  })

  return (
    <div>
      <button type="button" onClick={() => setOpen(true)} disabled={pending} className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-800 disabled:opacity-50"><Trash2 className="h-3.5 w-3.5" />Delete</button>
      <Feedback result={result} />
      <AnimatePresence>{open && <ConfirmDialog title={`Delete ${kind}?`} description={`“${label}” will be permanently removed, including its related interactions and managed media. This cannot be undone.`} pending={pending} onCancel={() => setOpen(false)} onConfirm={confirm} />}</AnimatePresence>
    </div>
  )
}

export function BlogPublishButton({ id, published }: { id: string; published: boolean }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [result, setResult] = useState<AdminActionResult | null>(null)
  return (
    <div>
      <button type="button" disabled={pending} onClick={() => startTransition(async () => { const next = await setBlogPublished(id, !published); setResult(next); if (next.ok) router.refresh() })} className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 disabled:opacity-50">{pending && <ButtonLoader label="Updating blog" />}{pending ? 'Updating…' : published ? 'Unpublish' : 'Publish'}</button>
      <Feedback result={result} />
    </div>
  )
}

export function AdminRoleControl({ userId, currentRole, isCurrentAdmin }: { userId: string; currentRole: UserRole; isCurrentAdmin: boolean }) {
  const router = useRouter()
  const [selected, setSelected] = useState<UserRole>(currentRole)
  const [confirmedRole, setConfirmedRole] = useState<UserRole | null>(null)
  const [pending, startTransition] = useTransition()
  const [result, setResult] = useState<AdminActionResult | null>(null)

  const confirm = () => {
    if (!confirmedRole) return
    startTransition(async () => {
      const next = await updateUserRole(userId, confirmedRole)
      setResult(next)
      setConfirmedRole(null)
      if (next.ok) router.refresh()
      else setSelected(currentRole)
    })
  }

  return (
    <div className="min-w-36">
      <select aria-label="User role" value={selected} disabled={isCurrentAdmin || pending} onChange={(event) => { const next = event.target.value as UserRole; setSelected(next); setConfirmedRole(next) }} className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400">
        <option value="user">User</option><option value="moderator">Moderator</option><option value="admin">Admin</option>
      </select>
      {isCurrentAdmin && <p className="mt-1 text-[11px] text-slate-400">Current account</p>}
      <Feedback result={result} />
      <AnimatePresence>{confirmedRole && <ConfirmDialog title="Change user role?" description={`This will change the account from ${currentRole} to ${confirmedRole}. Role changes affect authorization immediately.`} pending={pending} confirmLabel="Change role" pendingLabel="Updating" danger={false} onCancel={() => { setSelected(currentRole); setConfirmedRole(null) }} onConfirm={confirm} />}</AnimatePresence>
    </div>
  )
}

export function AdminLoginAccessControl({ userId, enabled, isCurrentAdmin }: { userId: string; enabled: boolean; isCurrentAdmin: boolean }) {
  const router = useRouter()
  const [current, setCurrent] = useState(enabled)
  const [confirming, setConfirming] = useState(false)
  const [pending, startTransition] = useTransition()
  const [result, setResult] = useState<AdminActionResult | null>(null)
  const nextEnabled = !current

  const confirm = () => startTransition(async () => {
    const next = await updateUserLoginAccess(userId, nextEnabled)
    setResult(next)
    setConfirming(false)
    if (next.ok) {
      setCurrent(nextEnabled)
      router.refresh()
    }
  })

  return (
    <div className="min-w-32">
      <button type="button" role="switch" aria-checked={current} disabled={isCurrentAdmin || pending} onClick={() => { setResult(null); setConfirming(true) }} className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset transition disabled:cursor-not-allowed disabled:opacity-50 ${current ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-red-50 text-red-700 ring-red-200'}`}>
        {current ? <ShieldCheck className="h-3.5 w-3.5" /> : <ShieldX className="h-3.5 w-3.5" />}
        {current ? 'Enabled' : 'Blocked'}
      </button>
      {isCurrentAdmin && <p className="mt-1 text-[11px] text-slate-400">Current account</p>}
      <Feedback result={result} />
      <AnimatePresence>{confirming && <ConfirmDialog title={nextEnabled ? 'Enable login access?' : 'Disable login access?'} description={nextEnabled ? 'This user will be able to sign in and use enabled site sections again.' : 'This user will be signed out at their next protected request and all application data access will be denied immediately.'} pending={pending} confirmLabel={nextEnabled ? 'Enable access' : 'Disable access'} pendingLabel="Updating" danger={!nextEnabled} onCancel={() => setConfirming(false)} onConfirm={confirm} />}</AnimatePresence>
    </div>
  )
}

export function AdminSectionControls({ settings }: { settings: SiteSectionSetting[] }) {
  return (
    <section aria-labelledby="site-sections-heading" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 id="site-sections-heading" className="text-lg font-bold text-slate-950">Site sections</h3>
          <p className="mt-1 text-sm text-slate-500">Choose which areas are available to non-admin users.</p>
        </div>
        <Power className="h-5 w-5 text-orange-600" aria-hidden="true" />
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {settings.map((setting) => <AdminSectionControl key={setting.key} setting={setting} />)}
      </div>
    </section>
  )
}

function AdminSectionControl({ setting }: { setting: SiteSectionSetting }) {
  const router = useRouter()
  const [enabled, setEnabled] = useState(setting.enabled)
  const [confirming, setConfirming] = useState(false)
  const [pending, startTransition] = useTransition()
  const [result, setResult] = useState<AdminActionResult | null>(null)
  const nextEnabled = !enabled

  const confirm = () => startTransition(async () => {
    const next = await updateSiteSection(setting.key, nextEnabled)
    setResult(next)
    setConfirming(false)
    if (next.ok) {
      setEnabled(nextEnabled)
      router.refresh()
    }
  })

  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-semibold text-slate-900">{setting.label}</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">{setting.description}</p>
        </div>
        <button type="button" role="switch" aria-label={`${setting.label} access`} aria-checked={enabled} disabled={pending} onClick={() => { setResult(null); setConfirming(true) }} className={`relative h-7 w-12 shrink-0 rounded-full transition disabled:cursor-not-allowed disabled:opacity-60 ${enabled ? 'bg-emerald-500' : 'bg-slate-300'}`}>
          <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${enabled ? 'left-6' : 'left-1'}`} />
        </button>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <span className={`text-xs font-semibold ${enabled ? 'text-emerald-700' : 'text-slate-500'}`}>{enabled ? 'Enabled for users' : 'Admin only'}</span>
        {pending && <ButtonLoader label={`Updating ${setting.label}`} />}
      </div>
      <Feedback result={result} />
      <AnimatePresence>{confirming && <ConfirmDialog title={`${nextEnabled ? 'Enable' : 'Disable'} ${setting.label}?`} description={nextEnabled ? `Users will regain access to ${setting.label} pages and data.` : `Non-admin users will lose access to ${setting.label} pages and related data immediately.`} pending={pending} confirmLabel={nextEnabled ? 'Enable section' : 'Disable section'} pendingLabel="Updating" danger={!nextEnabled} onCancel={() => setConfirming(false)} onConfirm={confirm} />}</AnimatePresence>
    </div>
  )
}

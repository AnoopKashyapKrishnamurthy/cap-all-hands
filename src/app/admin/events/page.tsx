import Link from 'next/link'
import AdminPage from '@/components/admin/AdminPage'
import AdminPagination from '@/components/admin/AdminPagination'
import { AdminDeleteButton } from '@/components/admin/AdminActions'
import { AdminBadge, AdminEmptyState, AdminErrorState, AdminFilters, AdminPageHeader } from '@/components/admin/AdminUi'
import { cleanSearch, getPageRange, parseAdminPage, totalPages } from '@/lib/admin/query'
import { protectAdminRoute } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

type SearchParams = Promise<Record<string, string | string[] | undefined>>
type Creator = { display_name: string }
const creatorOf = (value: unknown) => (Array.isArray(value) ? value[0] : value) as Creator | undefined

export default async function AdminEventsPage({ searchParams }: { searchParams: SearchParams }) {
  await protectAdminRoute()
  const params = await searchParams
  const page = parseAdminPage(params.page)
  const search = cleanSearch(params.q)
  const status = params.status === 'upcoming' || params.status === 'past' ? params.status : ''
  const now = new Date().toISOString()
  const { from, to } = getPageRange(page)
  const supabase = await createClient()

  let creatorIds: string[] = []
  if (search) {
    const { data } = await supabase.from('user_profiles').select('id').ilike('display_name', `%${search}%`).limit(100)
    creatorIds = (data ?? []).map((profile) => profile.id)
  }
  let query = supabase.from('events').select('id, title, event_date, location, created_at, creator_id, profile:user_profiles(display_name)', { count: 'exact' })
  if (search) {
    const fields = [`title.ilike.%${search}%`, `location.ilike.%${search}%`]
    if (creatorIds.length) fields.push(`creator_id.in.(${creatorIds.join(',')})`)
    query = query.or(fields.join(','))
  }
  if (status === 'upcoming') query = query.gte('event_date', now)
  if (status === 'past') query = query.lt('event_date', now)
  const { data, count, error } = await query.order('event_date', { ascending: status !== 'past' }).range(from, to)
  const pages = totalPages(count)

  return (
    <AdminPage>
      <AdminPageHeader title="Events" description="Manage upcoming and past team events." action={<Link href="/events/new" className="btn-primary text-sm">Create event</Link>} />
      <AdminFilters search={search} filter={status} filterName="status" filterLabel="Event timing" options={[{ label: 'All events', value: '' }, { label: 'Upcoming', value: 'upcoming' }, { label: 'Past', value: 'past' }]} />
      {error ? <AdminErrorState /> : !data?.length ? <AdminEmptyState title="No events found" description="Try a different title, location, creator, or timing filter." /> : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm"><table className="w-full min-w-[800px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Event</th><th className="px-5 py-3">Timing</th><th className="px-5 py-3">Location</th><th className="px-5 py-3">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{data.map((event) => { const upcoming = event.event_date >= now; return <tr key={event.id} className="align-top"><td className="px-5 py-4"><p className="max-w-md truncate font-semibold text-slate-900">{event.title}</p><p className="mt-1 text-xs text-slate-500">Created by {creatorOf(event.profile)?.display_name ?? 'Unknown user'}</p></td><td className="px-5 py-4"><AdminBadge tone={upcoming ? 'green' : 'slate'}>{upcoming ? 'Upcoming' : 'Past'}</AdminBadge><p className="mt-1 text-xs text-slate-500">{new Date(event.event_date).toLocaleString()}</p></td><td className="px-5 py-4 text-slate-500">{event.location || 'Not specified'}</td><td className="px-5 py-4"><div className="flex items-start gap-4"><Link href={`/events/${event.id}`} className="text-xs font-semibold text-slate-600 hover:text-slate-950">View</Link><Link href={`/events/edit/${event.id}`} className="text-xs font-semibold text-slate-600 hover:text-slate-950">Edit</Link><AdminDeleteButton id={event.id} kind="event" label={event.title} /></div></td></tr> })}</tbody></table></div>
      )}
      <AdminPagination page={page} pages={pages} searchParams={{ ...(search ? { q: search } : {}), ...(status ? { status } : {}) }} />
    </AdminPage>
  )
}

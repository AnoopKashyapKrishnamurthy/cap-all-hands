import Link from 'next/link'
import AdminPage from '@/components/admin/AdminPage'
import AdminPagination from '@/components/admin/AdminPagination'
import { AdminDeleteButton } from '@/components/admin/AdminActions'
import { AdminEmptyState, AdminErrorState, AdminFilters, AdminPageHeader } from '@/components/admin/AdminUi'
import FadeInImage from '@/components/loading/FadeInImage'
import { ADMIN_GALLERY_PAGE_SIZE, cleanSearch, getPageRange, parseAdminPage, totalPages } from '@/lib/admin/query'
import { protectAdminRoute } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

type SearchParams = Promise<Record<string, string | string[] | undefined>>
type Uploader = { display_name: string }
const uploaderOf = (value: unknown) => (Array.isArray(value) ? value[0] : value) as Uploader | undefined

export default async function AdminGalleryPage({ searchParams }: { searchParams: SearchParams }) {
  await protectAdminRoute()
  const params = await searchParams
  const page = parseAdminPage(params.page)
  const search = cleanSearch(params.q)
  const { from, to } = getPageRange(page, ADMIN_GALLERY_PAGE_SIZE)
  const supabase = await createClient()

  let uploaderIds: string[] = []
  if (search) {
    const { data } = await supabase.from('user_profiles').select('id').ilike('display_name', `%${search}%`).limit(100)
    uploaderIds = (data ?? []).map((profile) => profile.id)
  }
  let query = supabase.from('gallery_items').select('id, title, description, image_url, created_at, uploaded_by, profile:user_profiles(display_name)', { count: 'exact' })
  if (search) {
    const fields = [`title.ilike.%${search}%`, `description.ilike.%${search}%`]
    if (uploaderIds.length) fields.push(`uploaded_by.in.(${uploaderIds.join(',')})`)
    query = query.or(fields.join(','))
  }
  const { data, count, error } = await query.order('created_at', { ascending: false }).range(from, to)
  const pages = totalPages(count, ADMIN_GALLERY_PAGE_SIZE)

  return (
    <AdminPage>
      <AdminPageHeader title="Gallery" description="Visually review and moderate shared photos." action={<Link href="/gallery/upload" className="btn-primary text-sm">Upload photo</Link>} />
      <AdminFilters search={search} />
      {error ? <AdminErrorState /> : !data?.length ? <AdminEmptyState title="No gallery items found" description="Try a different title, description, or uploader." /> : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{data.map((item) => <article key={item.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><FadeInImage src={item.image_url} alt={item.title} containerClassName="aspect-[4/3] bg-slate-100" className="h-full w-full object-cover" /><div className="p-4"><p className="truncate font-semibold text-slate-900">{item.title}</p><p className="mt-1 line-clamp-2 min-h-10 text-sm text-slate-500">{item.description || 'No description'}</p><p className="mt-3 text-xs text-slate-400">By {uploaderOf(item.profile)?.display_name ?? 'Unknown user'} · {new Date(item.created_at).toLocaleDateString()}</p><div className="mt-4"><AdminDeleteButton id={item.id} kind="gallery item" label={item.title} /></div></div></article>)}</div>
      )}
      <AdminPagination page={page} pages={pages} searchParams={search ? { q: search } : {}} />
    </AdminPage>
  )
}

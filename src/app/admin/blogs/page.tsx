import Link from 'next/link'
import AdminPage from '@/components/admin/AdminPage'
import AdminPagination from '@/components/admin/AdminPagination'
import { AdminDeleteButton, BlogPublishButton } from '@/components/admin/AdminActions'
import { AdminBadge, AdminEmptyState, AdminErrorState, AdminFilters, AdminPageHeader } from '@/components/admin/AdminUi'
import { cleanSearch, getPageRange, parseAdminPage, totalPages } from '@/lib/admin/query'
import { protectAdminRoute } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

type SearchParams = Promise<Record<string, string | string[] | undefined>>
type Author = { display_name: string }
const authorOf = (value: unknown) => (Array.isArray(value) ? value[0] : value) as Author | undefined

export default async function AdminBlogsPage({ searchParams }: { searchParams: SearchParams }) {
  await protectAdminRoute()
  const params = await searchParams
  const page = parseAdminPage(params.page)
  const search = cleanSearch(params.q)
  const status = params.status === 'published' || params.status === 'draft' ? params.status : ''
  const { from, to } = getPageRange(page)
  const supabase = await createClient()

  let authorIds: string[] = []
  if (search) {
    const { data } = await supabase.from('user_profiles').select('id').ilike('display_name', `%${search}%`).limit(100)
    authorIds = (data ?? []).map((profile) => profile.id)
  }

  let query = supabase.from('blogs').select('id, title, slug, published, created_at, author_id, profile:user_profiles(display_name)', { count: 'exact' })
  if (search) query = query.or(authorIds.length ? `title.ilike.%${search}%,author_id.in.(${authorIds.join(',')})` : `title.ilike.%${search}%`)
  if (status) query = query.eq('published', status === 'published')
  const { data, count, error } = await query.order('created_at', { ascending: false }).range(from, to)
  const pages = totalPages(count)

  return (
    <AdminPage>
      <AdminPageHeader title="Blogs" description="Review drafts, control publishing, edit posts, or remove content." action={<Link href="/blogs/new" className="btn-primary text-sm">Create blog</Link>} />
      <AdminFilters search={search} filter={status} filterName="status" filterLabel="Publication status" options={[{ label: 'All statuses', value: '' }, { label: 'Published', value: 'published' }, { label: 'Drafts', value: 'draft' }]} />
      {error ? <AdminErrorState /> : !data?.length ? <AdminEmptyState title="No blogs found" description="Try a different title, author, or publication filter." /> : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[780px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Blog</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Created</th><th className="px-5 py-3">Actions</th></tr></thead>
            <tbody className="divide-y divide-slate-100">{data.map((blog) => <tr key={blog.id} className="align-top"><td className="px-5 py-4"><p className="max-w-md truncate font-semibold text-slate-900">{blog.title}</p><p className="mt-1 text-xs text-slate-500">By {authorOf(blog.profile)?.display_name ?? 'Unknown author'}</p></td><td className="px-5 py-4"><AdminBadge tone={blog.published ? 'green' : 'orange'}>{blog.published ? 'Published' : 'Draft'}</AdminBadge></td><td className="px-5 py-4 text-slate-500">{new Date(blog.created_at).toLocaleDateString()}</td><td className="px-5 py-4"><div className="flex flex-wrap items-start gap-x-4 gap-y-2"><Link href={`/blogs/${blog.slug}`} className="text-xs font-semibold text-slate-600 hover:text-slate-950">View</Link><Link href={`/blogs/edit/${blog.id}`} className="text-xs font-semibold text-slate-600 hover:text-slate-950">Edit</Link><BlogPublishButton id={blog.id} published={blog.published} /><AdminDeleteButton id={blog.id} kind="blog" label={blog.title} /></div></td></tr>)}</tbody>
          </table>
        </div>
      )}
      <AdminPagination page={page} pages={pages} searchParams={{ ...(search ? { q: search } : {}), ...(status ? { status } : {}) }} />
    </AdminPage>
  )
}

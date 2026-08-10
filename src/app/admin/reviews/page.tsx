import Link from 'next/link'
import AdminPage from '@/components/admin/AdminPage'
import AdminPagination from '@/components/admin/AdminPagination'
import { AdminDeleteButton } from '@/components/admin/AdminActions'
import { AdminBadge, AdminEmptyState, AdminErrorState, AdminFilters, AdminPageHeader } from '@/components/admin/AdminUi'
import { cleanSearch, getPageRange, parseAdminPage, totalPages } from '@/lib/admin/query'
import { protectAdminRoute } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

type SearchParams = Promise<Record<string, string | string[] | undefined>>
type Reviewer = { display_name: string }
const reviewerOf = (value: unknown) => (Array.isArray(value) ? value[0] : value) as Reviewer | undefined

export default async function AdminReviewsPage({ searchParams }: { searchParams: SearchParams }) {
  await protectAdminRoute()
  const params = await searchParams
  const page = parseAdminPage(params.page)
  const search = cleanSearch(params.q)
  const ratingValue = typeof params.rating === 'string' ? Number(params.rating) : 0
  const rating = Number.isInteger(ratingValue) && ratingValue >= 1 && ratingValue <= 5 ? ratingValue : 0
  const { from, to } = getPageRange(page)
  const supabase = await createClient()

  let reviewerIds: string[] = []
  if (search) {
    const { data } = await supabase.from('user_profiles').select('id').ilike('display_name', `%${search}%`).limit(100)
    reviewerIds = (data ?? []).map((profile) => profile.id)
  }
  let query = supabase.from('book_reviews').select('id, review_title, book_title, book_author, rating, created_at, user_id, profile:user_profiles(display_name)', { count: 'exact' })
  if (search) {
    const fields = [`review_title.ilike.%${search}%`, `book_title.ilike.%${search}%`, `book_author.ilike.%${search}%`]
    if (reviewerIds.length) fields.push(`user_id.in.(${reviewerIds.join(',')})`)
    query = query.or(fields.join(','))
  }
  if (rating) query = query.eq('rating', rating)
  const { data, count, error } = await query.order('created_at', { ascending: false }).range(from, to)
  const pages = totalPages(count)

  return (
    <AdminPage>
      <AdminPageHeader title="Book reviews" description="Find and moderate reviews shared by the team." action={<Link href="/reviews/new" className="btn-primary text-sm">Write review</Link>} />
      <AdminFilters search={search} filter={rating ? String(rating) : ''} filterName="rating" filterLabel="Rating" options={[{ label: 'All ratings', value: '' }, ...[5, 4, 3, 2, 1].map((value) => ({ label: `${value} stars`, value: String(value) }))]} />
      {error ? <AdminErrorState /> : !data?.length ? <AdminEmptyState title="No reviews found" description="Try a different title, author, reviewer, or rating." /> : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm"><table className="w-full min-w-[780px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Review</th><th className="px-5 py-3">Rating</th><th className="px-5 py-3">Created</th><th className="px-5 py-3">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{data.map((review) => <tr key={review.id} className="align-top"><td className="px-5 py-4"><p className="max-w-md truncate font-semibold text-slate-900">{review.review_title}</p><p className="mt-1 max-w-md truncate text-xs text-slate-500">{review.book_title} by {review.book_author} · reviewed by {reviewerOf(review.profile)?.display_name ?? 'Unknown user'}</p></td><td className="px-5 py-4"><AdminBadge tone="orange">{review.rating} / 5</AdminBadge></td><td className="px-5 py-4 text-slate-500">{new Date(review.created_at).toLocaleDateString()}</td><td className="px-5 py-4"><div className="flex items-start gap-4"><Link href={`/reviews/${review.id}`} className="text-xs font-semibold text-slate-600 hover:text-slate-950">View</Link><AdminDeleteButton id={review.id} kind="review" label={review.review_title} /></div></td></tr>)}</tbody></table></div>
      )}
      <AdminPagination page={page} pages={pages} searchParams={{ ...(search ? { q: search } : {}), ...(rating ? { rating: String(rating) } : {}) }} />
    </AdminPage>
  )
}

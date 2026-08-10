import Link from 'next/link'
import { BookOpen, CalendarDays, FileText, Images, Users } from 'lucide-react'
import AdminPage from '@/components/admin/AdminPage'
import { AdminBadge, AdminErrorState, AdminPageHeader, AdminStatCard } from '@/components/admin/AdminUi'
import { protectAdminRoute } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

function profileOf(value: unknown): { display_name: string } | null {
  if (Array.isArray(value)) return (value[0] as { display_name: string } | undefined) ?? null
  return (value as { display_name: string } | null) ?? null
}

export default async function AdminOverviewPage() {
  await protectAdminRoute()
  const supabase = await createClient()
  const now = new Date().toISOString()

  const [
    users,
    admins,
    moderators,
    blogs,
    publishedBlogs,
    reviews,
    events,
    upcomingEvents,
    gallery,
    recentBlogs,
    recentReviews,
    recentEvents,
  ] = await Promise.all([
    supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
    supabase.from('user_profiles').select('*', { count: 'exact', head: true }).eq('role', 'admin'),
    supabase.from('user_profiles').select('*', { count: 'exact', head: true }).eq('role', 'moderator'),
    supabase.from('blogs').select('*', { count: 'exact', head: true }),
    supabase.from('blogs').select('*', { count: 'exact', head: true }).eq('published', true),
    supabase.from('book_reviews').select('*', { count: 'exact', head: true }),
    supabase.from('events').select('*', { count: 'exact', head: true }),
    supabase.from('events').select('*', { count: 'exact', head: true }).gte('event_date', now),
    supabase.from('gallery_items').select('*', { count: 'exact', head: true }),
    supabase.from('blogs').select('id, title, slug, published, created_at, profile:user_profiles(display_name)').order('created_at', { ascending: false }).limit(4),
    supabase.from('book_reviews').select('id, review_title, book_title, created_at, profile:user_profiles(display_name)').order('created_at', { ascending: false }).limit(4),
    supabase.from('events').select('id, title, event_date, profile:user_profiles(display_name)').order('created_at', { ascending: false }).limit(4),
  ])

  const hasError = [users, admins, moderators, blogs, publishedBlogs, reviews, events, upcomingEvents, gallery, recentBlogs, recentReviews, recentEvents].some((result) => result.error)

  return (
    <AdminPage>
      <AdminPageHeader title="Overview" description="A concise view of your community and its newest content." />
      {hasError && <AdminErrorState message="Some overview data could not be loaded." />}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <AdminStatCard label="People" value={users.count ?? 0} detail={`${admins.count ?? 0} admins · ${moderators.count ?? 0} moderators`} icon={Users} />
        <AdminStatCard label="Blogs" value={blogs.count ?? 0} detail={`${publishedBlogs.count ?? 0} published · ${(blogs.count ?? 0) - (publishedBlogs.count ?? 0)} drafts`} icon={FileText} />
        <AdminStatCard label="Reviews" value={reviews.count ?? 0} detail="Book reviews shared" icon={BookOpen} />
        <AdminStatCard label="Events" value={events.count ?? 0} detail={`${upcomingEvents.count ?? 0} upcoming`} icon={CalendarDays} />
        <AdminStatCard label="Gallery" value={gallery.count ?? 0} detail="Photos shared" icon={Images} />
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <RecentPanel title="Recent blogs" href="/admin/blogs">
          {(recentBlogs.data ?? []).map((blog) => (
            <Link key={blog.id} href={`/blogs/${blog.slug}`} className="block rounded-xl p-3 hover:bg-slate-50">
              <div className="flex items-start justify-between gap-3"><p className="truncate text-sm font-semibold text-slate-800">{blog.title}</p><AdminBadge tone={blog.published ? 'green' : 'orange'}>{blog.published ? 'Published' : 'Draft'}</AdminBadge></div>
              <p className="mt-1 text-xs text-slate-500">{profileOf(blog.profile)?.display_name ?? 'Unknown author'} · {new Date(blog.created_at).toLocaleDateString()}</p>
            </Link>
          ))}
        </RecentPanel>
        <RecentPanel title="Recent reviews" href="/admin/reviews">
          {(recentReviews.data ?? []).map((review) => (
            <Link key={review.id} href={`/reviews/${review.id}`} className="block rounded-xl p-3 hover:bg-slate-50">
              <p className="truncate text-sm font-semibold text-slate-800">{review.review_title}</p>
              <p className="mt-1 truncate text-xs text-slate-500">{review.book_title} · {profileOf(review.profile)?.display_name ?? 'Unknown reviewer'}</p>
            </Link>
          ))}
        </RecentPanel>
        <RecentPanel title="Recent events" href="/admin/events">
          {(recentEvents.data ?? []).map((event) => (
            <Link key={event.id} href={`/events/${event.id}`} className="block rounded-xl p-3 hover:bg-slate-50">
              <p className="truncate text-sm font-semibold text-slate-800">{event.title}</p>
              <p className="mt-1 text-xs text-slate-500">{new Date(event.event_date).toLocaleString()} · {profileOf(event.profile)?.display_name ?? 'Unknown creator'}</p>
            </Link>
          ))}
        </RecentPanel>
      </div>
    </AdminPage>
  )
}

function RecentPanel({ title, href, children }: { title: string; href: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between px-3 py-2"><h3 className="font-bold text-slate-900">{title}</h3><Link href={href} className="text-xs font-semibold text-orange-600 hover:text-orange-800">View all</Link></div>
      <div className="divide-y divide-slate-100">{children}</div>
    </section>
  )
}

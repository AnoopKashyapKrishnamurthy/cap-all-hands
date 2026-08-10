import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { protectRoute } from '@/lib/auth'
import { BookOpen, PenSquare, Image, CalendarDays } from 'lucide-react'
import FadeInImage from '@/components/loading/FadeInImage'

export const metadata = {
  title: 'Dashboard - CAP All-Hands',
}

export default async function DashboardPage() {
  const user = await protectRoute()
  const supabase = await createClient()

  const { data: latestReviews } = await supabase
    .from('book_reviews')
    .select(`
    id,
    review_title,
    book_title,
    book_author,
    rating,
    profile:user_profiles (
      display_name,
      avatar_url,
      email
    )
  `)
    .order('created_at', { ascending: false })
    .limit(4)
  const safeReviews = latestReviews ?? []

  const cards = [
    {
      title: 'Book Reviews',
      icon:  <BookOpen className="w-5 h-5" />,
      size: 'lg',
      desc: 'Browse community reviews or write your own. Discover what your teammates are reading this month.',
      links: [
        { href: '/reviews', label: 'Browse Reviews' },
        { href: '/reviews/new', label: 'Write a Review' },
      ],
    },
    {
      title: 'Blogs',
      icon: <PenSquare className="w-5 h-5" />,
      size: 'md',
      desc: 'Share insights, updates, and ideas with the team.',
      links: [
        { href: '/blogs', label: 'Browse Blogs' },
        { href: '/blogs/new', label: 'Create Blog' },
      ],
    },
    {
      title: 'Gallery',
      icon:  <Image className="w-5 h-5" />,
      size: 'md',
      desc: 'Create posts and share photos with the team.',
      links: [
        { href: '/gallery', label: 'Browse Gallery' },
        { href: '/gallery/upload', label: 'Create Post' },
      ],
    },
    {
      title: 'Events',
      icon: <CalendarDays className="w-5 h-5" />,
      size: 'wide',
      desc: 'Discover and join upcoming team events. Never miss a gathering.',
      links: [
        { href: '/events', label: 'Browse Events' },
        { href: '/events/new', label: 'Create Event' },
      ],
    },
  ]

  type LinkItem = {
    href: string
    label: string
  }

  const CardActions = ({ links }: { links: LinkItem[] }) => (
    <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-6">
      {links.map((link, idx) => {
        const isPrimary = idx === 0
        return (
          <Link
            key={idx}
            href={link.href}
            className={`
              group/link relative inline-flex items-center justify-center gap-2 
              px-4 py-2.5 text-sm font-semibold transition-all duration-200 
              rounded-xl active:scale-95
              
              ${isPrimary
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-200/50 hover:bg-blue-700 hover:shadow-md'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }
            `}
          >
            {link.label}
            {!isPrimary && (
              <svg
                className="w-4 h-4 transition-transform duration-300 group-hover/link:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </Link>
        )
      })}
    </div>
  )

  return (
    <section className="space-y-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
            Dashboard
          </h1>
          <p className="text-gray-500 mt-2 text-base sm:text-lg">
            Welcome back,{' '}
            <span className="font-semibold text-gray-800">
              {user.email}
            </span>
          </p>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[minmax(240px,auto)] grid-flow-row-dense">

        {cards.map((card, i) => (
          <div
            key={i}
            className={`
              group relative flex flex-col justify-between overflow-hidden
              bg-white rounded-3xl p-6 sm:p-8
              shadow-sm ring-1 ring-gray-900/5 transition-all duration-300
              hover:shadow-xl hover:-translate-y-1 hover:ring-gray-900/10

              ${card.size === 'lg' ? 'md:col-span-2 md:row-span-2 bg-gradient-to-br from-white to-gray-50/50' : ''}
              ${card.size === 'wide' ? 'md:col-span-2' : ''}
            `}
          >

            {/* Ambient Icon */}
            {card.size === 'lg' && (
              <div className="absolute -bottom-8 -left-8 text-[180px] opacity-[0.02] pointer-events-none transform transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-6">
                {card.icon}
              </div>
            )}

            {card.size === 'lg' ? (
              <div className="relative z-10 flex flex-col lg:flex-row gap-8 h-full">

                {/* LEFT */}
                <div className="flex flex-col justify-between flex-1">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white ring-1 ring-gray-900/5 text-2xl shadow-sm">
                        {card.icon}
                      </span>
                      <h3 className="text-2xl font-bold tracking-tight text-gray-900">
                        {card.title}
                      </h3>
                    </div>
                    <p className="text-gray-500 text-base leading-relaxed mb-8 max-w-sm">
                      {card.desc}
                    </p>
                  </div>

                  <CardActions links={card.links} />
                </div>

                {/* RIGHT → REAL REVIEWS */}
                <div className="flex flex-col flex-1 bg-white/60 backdrop-blur-sm rounded-2xl p-5 ring-1 ring-gray-900/5 shadow-inner">

                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Latest Reviews
                    </h4>
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                      Live
                    </span>
                  </div>

                  <div className="flex flex-col gap-3">


                    {

                      card.title === 'Book Reviews' && safeReviews.length > 0 ? (
                        safeReviews.map((review) => {
                          const profile = Array.isArray(review.profile)
                            ? review.profile[0]
                            : review.profile

                          return (
                            <Link
                              key={review.id}
                              href={`/reviews/${review.id}`}
                              className="block group"
                            >
                              <div
                                className="flex items-center gap-4 p-3 rounded-xl bg-white border border-gray-100 shadow-sm 
          hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
                              >
                                {/* Avatar */}
                                <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 flex-shrink-0 bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-600">
                                  {profile?.avatar_url ? (
                                    <FadeInImage
                                      src={profile.avatar_url}
                                      alt={profile?.display_name || 'User'}
                                      containerClassName="h-full w-full rounded-full"
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    profile?.display_name?.charAt(0)?.toUpperCase() || '?'
                                  )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold text-gray-900 truncate group-hover:text-blue-600 transition">
                                    {review.review_title}
                                  </p>

                                  <p className="text-xs text-gray-500 truncate mb-1">
                                    {review.book_title} by {review.book_author}
                                  </p>

                                  <p className="text-xs text-gray-500 truncate mb-1">
                                    {profile?.display_name || profile?.email || 'Unknown'}
                                  </p>

                                  <div className="text-[10px] tracking-widest">
                                    {'⭐'.repeat(review.rating || 0)}
                                  </div>
                                </div>
                              </div>
                            </Link>
                          )
                        })
                      ) : (
                        <p className="text-sm text-gray-400 text-center py-6">
                          No reviews yet
                        </p>
                      )}
                  </div>

                </div>

              </div>
            ) : (

              <div className="flex flex-col h-full relative z-10">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gray-50 ring-1 ring-gray-900/5 text-2xl shadow-sm">
                      {card.icon}
                    </span>
                    <h3 className="text-xl font-bold tracking-tight text-gray-900">
                      {card.title}
                    </h3>
                  </div>

                  <p className="text-gray-500 text-sm sm:text-base leading-relaxed mb-6 max-w-sm">
                    {card.desc}
                  </p>
                </div>

                <CardActions links={card.links} />
              </div>
            )}

          </div>
        ))}

      </div>

      {/* Footer */}
      <div className="pt-8 mt-12 border-t border-gray-200/60 text-center text-gray-400 text-sm font-medium">
        © {new Date().getFullYear()} CAP All-Hands · Internal Platform
      </div>

    </section>
  )
}

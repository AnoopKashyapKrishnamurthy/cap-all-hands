import Link from 'next/link'
import { protectRoute } from '@/lib/auth'

export const metadata = {
  title: 'Dashboard - CAP All-Hands',
}

export default async function DashboardPage() {
  const user = await protectRoute()

  const cards = [
    {
      title: 'Book Reviews',
      icon: '📚',
      size: 'lg',
      desc: 'Browse community reviews or write your own. Discover what your teammates are reading.',
      links: [
        { href: '/reviews', label: 'Browse Reviews', color: 'blue' },
        { href: '/reviews/new', label: 'Write a Review', color: 'green' },
      ],
    },
    {
      title: 'Blogs',
      icon: '✍',
      size: 'md',
      desc: 'Share insights, updates, and ideas with the team.',
      links: [
        { href: '/blogs', label: 'Browse Blogs', color: 'blue' },
        { href: '/blogs/new', label: 'Create Blog', color: 'green' },
      ],
    },
    {
      title: 'Gallery',
      icon: '🖼️',
      size: 'md',
      desc: 'Create posts and share photos with the team.',
      links: [
        { href: '/gallery', label: 'Browse Gallery', color: 'blue' },
        { href: '/gallery/upload', label: 'Create Post', color: 'green' },
      ],
    },
    {
      title: 'Events',
      icon: '🗓️',
      size: 'wide',
      desc: 'Discover and join upcoming team events. Never miss a gathering.',
      links: [
        { href: '/events', label: 'Browse Events', color: 'blue' },
        { href: '/events/new', label: 'Create Event', color: 'green' },
      ],
    },
  ]

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

      {/* Modern Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[minmax(240px,auto)] grid-flow-row-dense">

        {cards.map((card, i) => (
          <div
            key={i}
            className={`
              group relative flex flex-col justify-between overflow-hidden
              bg-white rounded-3xl p-6 sm:p-8
              shadow-sm ring-1 ring-gray-900/5 transition-all duration-300
              hover:shadow-xl hover:-translate-y-1 hover:ring-gray-900/10

              ${card.size === 'lg' ? 'md:col-span-2 md:row-span-2' : ''}
              ${card.size === 'wide' ? 'md:col-span-2' : ''}
              ${card.size === 'md' ? 'col-span-1' : ''}
            `}
          >
            {/* Ambient Background Icon for Large Cards */}
            {card.size === 'lg' && (
              <div className="absolute -bottom-8 -right-8 text-[140px] opacity-[0.03] pointer-events-none transform transition-transform duration-700 group-hover:scale-110">
                {card.icon}
              </div>
            )}

            {/* Content Top */}
            <div className="relative z-10">
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

            {/* Content Bottom (Buttons) */}
            <div className={`relative z-10 mt-auto flex flex-col gap-3 ${card.size === 'md' ? '' : 'sm:flex-row'}`}>
              {card.links.map((link, idx) => (
                <Link
                  key={idx}
                  href={link.href}
                  className={`
                    inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold rounded-xl
                    transition-all duration-200 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
                    
                    ${
                      link.color === 'blue'
                        ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-500 focus-visible:outline-blue-600'
                        : 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200/60 hover:bg-emerald-100 hover:text-emerald-800'
                    }
                    ${card.size === 'md' ? 'w-full' : 'w-full sm:w-auto'}
                  `}
                >
                  {link.label}
                </Link>
              ))}
            </div>

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
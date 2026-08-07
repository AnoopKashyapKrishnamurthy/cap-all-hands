'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import LogoutButton from './auth/LogoutButton'
import ProfileDropdown from './auth/ProfieDropdown'
import Logo from './Logo'

export default function Navbar({
  user,
  profile
}: {
  user: any
  profile: any
}) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState(user)

  useEffect(() => {
    setCurrentUser(user)
  }, [user])

  const email = currentUser?.email || ''
  const avatarUrl = profile?.avatar_url || null

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', authRequired: true },
    { name: 'Events', href: '/events', authRequired: true },
    { name: 'Book-Reviews', href: '/reviews', authRequired: true },
    { name: 'Blogs', href: '/blogs', authRequired: true },
    { name: 'People', href: '/people', authRequired: true },
    { name: 'Quiz', href: '/quiz', authRequired: true },
    { name: 'Gallery', href: '/gallery', authRequired: true },
    { name: 'Profile', href: '/profile', authRequired: true },
  ]

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex justify-between items-center h-16">

          <Logo />

          {/* DESKTOP NAV */}
          <div className="hidden lg:flex items-center gap-6">
            <nav className="flex items-center gap-5 mr-2">
              {navItems.map((item) => (
                (!item.authRequired || currentUser) && (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`text-sm font-medium transition-all relative group/link ${pathname === item.href
                      ? 'text-accent-600'
                      : 'text-slate-600 hover:text-accent-600'
                      }`}
                  >
                    {item.name}

                    <span
                      className={`absolute -bottom-1 left-0 h-[2px] rounded-full bg-accent-500 transition-all duration-300 ${pathname === item.href
                        ? 'w-full'
                        : 'w-0 group-hover/link:w-full'
                        }`}
                    />
                  </Link>
                )
              ))}
            </nav>

            {!currentUser ? (
              <Link
                href="/login"
                className="bg-transparent text-base px-5 py-2 rounded-lg font-medium 
                hover:bg-gray-300 hover:shadow-lg  
                active:scale-[0.97] transition-all duration-200"
              >
                Login
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                <ProfileDropdown email={email} avatarUrl={avatarUrl} />
              </div>
            )}
          </div>

          {/* MOBILE TOGGLE */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-accent-50 active:scale-95 text-slate-600 transition"
            aria-label="Toggle Menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

        </div>
      </div>

      {/* MOBILE MENU */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${mobileOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
          }`}
      >
        <div className="bg-white border-t border-slate-200 px-5 py-5 flex flex-col gap-1 shadow-inner">

          {currentUser && (
            <div className="pb-4 mb-3 border-b border-slate-200">
              <p className="text-xs uppercase tracking-wider text-accent-600 font-semibold mb-1">
                Account
              </p>
              <p className="text-sm font-medium text-slate-900 truncate">
                {email}
              </p>
            </div>
          )}

          <Link
            href="/"
            className={`block text-base font-medium py-2.5 px-3 rounded-md transition ${pathname === '/'
              ? 'bg-accent-100 text-accent-700'
              : 'text-slate-700 hover:bg-accent-50'
              }`}
          >
            Home
          </Link>

          {navItems.map((item) => (
            (!item.authRequired || currentUser) && (
              <Link
                key={item.href}
                href={item.href}
                className={`block text-base font-medium py-2.5 px-3 rounded-md transition ${pathname === item.href
                  ? 'bg-accent-100 text-accent-700'
                  : 'text-slate-700 hover:bg-accent-50'
                  }`}
              >
                {item.name}
              </Link>
            )
          ))}

          {currentUser ? (
            <div className="pt-4 mt-3 border-t border-slate-200">
              <LogoutButton variant="minimal" />
            </div>
          ) : (
            <Link
              href="/login"
              className="text-slate-900 font-extrabold text-2xl tracking-tight hover:text-orange-500 transition-colors duration-300"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

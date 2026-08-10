'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, ShieldCheck, X } from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import type { UserRole } from '@/lib/auth'
import LogoutButton from './auth/LogoutButton'
import ProfileDropdown from './auth/ProfieDropdown'
import Logo from './Logo'

export default function Navbar({
  user,
  profile
}: {
  user: User | null
  profile: {
    display_name: string | null
    avatar_url: string | null
    role: UserRole
  } | null
}) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState(user)

  useEffect(() => {
    setCurrentUser(user)
  }, [user])

  const email = currentUser?.email || ''
  const avatarUrl = profile?.avatar_url || null
  const isAdmin = profile?.role === 'admin'

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', authRequired: true, adminOnly: false },
    { name: 'Events', href: '/events', authRequired: true, adminOnly: false },
    { name: 'Book-Reviews', href: '/reviews', authRequired: true, adminOnly: false },
    { name: 'Blogs', href: '/blogs', authRequired: true, adminOnly: false },
    { name: 'People', href: '/people', authRequired: true, adminOnly: false },
    { name: 'Quiz', href: '/quiz', authRequired: true, adminOnly: false },
    { name: 'Gallery', href: '/gallery', authRequired: true, adminOnly: false },
    { name: 'Profile', href: '/profile', authRequired: true, adminOnly: false },
    { name: 'Admin', href: '/admin', authRequired: true, adminOnly: true },
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
                (!item.authRequired || currentUser) && (!item.adminOnly || isAdmin) && (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`text-sm font-medium transition-all relative group/link ${(pathname === item.href || (item.adminOnly && pathname.startsWith('/admin')))
                      ? 'text-accent-600'
                      : 'text-slate-600 hover:text-accent-600'
                      }`}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      {item.adminOnly && <ShieldCheck className="h-3.5 w-3.5" />}
                      {item.name}
                    </span>

                    <span
                      className={`absolute -bottom-1 left-0 h-[2px] rounded-full bg-accent-500 transition-all duration-300 ${(pathname === item.href || (item.adminOnly && pathname.startsWith('/admin')))
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
            (!item.authRequired || currentUser) && (!item.adminOnly || isAdmin) && (
              <Link
                key={item.href}
                href={item.href}
                className={`block text-base font-medium py-2.5 px-3 rounded-md transition ${(pathname === item.href || (item.adminOnly && pathname.startsWith('/admin')))
                  ? 'bg-accent-100 text-accent-700'
                  : 'text-slate-700 hover:bg-accent-50'
                  }`}
              >
                <span className="inline-flex items-center gap-2">
                  {item.adminOnly && <ShieldCheck className="h-4 w-4" />}
                  {item.name}
                </span>
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

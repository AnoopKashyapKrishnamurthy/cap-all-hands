'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import LogoutButton from './auth/LogoutButton'
import ProfileDropdown from './auth/ProfieDropdown'


export default function Navbar({ user }: { user: any }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const email =
     user?.email || ''

  const avatarUrl = user?.profile?.avatar_url

  /* Close mobile menu on route change */
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  return (
    <header className="sticky top-0 z-50 backdrop-blur bg-white/80 border-b">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link
            href="/"
            className="group inline-flex items-center text-lg md:text-xl font-bold tracking-tight transition duration-300"
          >
            <span className="text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
              CAP
            </span>
            <span className="ml-1 text-orange-600 group-hover:text-blue-700 transition-colors duration-300">
              All-Hands
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4">
            {!user ? (
              <Link
                href="/login"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Login
              </Link>
            ) : (
              <ProfileDropdown
                email={email}
                avatarUrl={avatarUrl}
              />
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          mobileOpen
            ? 'max-h-[600px] opacity-100'
            : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-white border-t px-6 py-6 space-y-4">

          {user && (
            <div className="pb-4 border-b">
              <p className="text-sm font-medium">
                {email}
              </p>
              <p className="text-xs text-gray-500 break-all">
                {user.email}
              </p>
            </div>
          )}

          <Link href="/" className="block text-lg font-medium py-2">
            Home
          </Link>

          {user ? (
            <>
              <Link
                href="/profile"
                className="block text-lg font-medium py-2"
              >
                Profile
              </Link>

              <Link
                href="/dashboard"
                className="block text-lg font-medium py-2"
              >
                Dashboard
              </Link>

              <div className="pt-4 border-t">
                <LogoutButton variant="minimal" />
              </div>
            </>
          ) : (
            <Link
              href="/login"
              className="block bg-blue-600 text-white text-center py-3 rounded-xl font-medium"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { logoutAction } from '@/lib/auth/actions'
import Link from 'next/link'

interface ProfileDropdownProps {
  
  email: string
  avatarUrl?: string | null
}

export default function ProfileDropdown({
  email,
  avatarUrl,
}: ProfileDropdownProps) {
  const [open, setOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const dropdownRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  const initial = email?.charAt(0).toUpperCase()

  /* -------------------- CLOSE ON OUTSIDE CLICK -------------------- */
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }

      if (
        modalRef.current &&
        !modalRef.current.contains(e.target as Node)
      ) {
        setConfirmOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () =>
      document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  /* -------------------- CLOSE ON ESC -------------------- */
  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false)
        setConfirmOpen(false)
      }
    }

    document.addEventListener('keydown', handleEsc)
    return () =>
      document.removeEventListener('keydown', handleEsc)
  }, [])

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction()
    })
  }

  return (
    <>
      {/* ==================== AVATAR TRIGGER ==================== */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="relative flex items-center justify-center w-10 h-10 rounded-full overflow-hidden bg-gray-100 text-white font-semibold hover:scale-105 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={email}
              className="w-full h-full object-cover"
            />
          ) : (
            initial
          )}
        </button>

        {/* ==================== DROPDOWN ==================== */}
        {open && (
          <div className="absolute right-0 mt-3 w-80 max-w-[90vw] bg-white rounded-2xl shadow-xl border p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">

            {/* User Info Section */}
            <div className="space-y-1 pb-4 border-b">

              

              {/* Long email handled cleanly */}
              <p className="text-xs text-gray-500 break-all leading-relaxed">
                {email}
              </p>

            </div>

            {/* Links */}
            <div className="pt-3 space-y-1">

              <Link
                href="/profile"
                onClick={() => setOpen(false)}
                className="block px-3 py-2 text-sm rounded-lg hover:bg-gray-100 transition"
              >
                Profile
              </Link>

              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="block px-3 py-2 text-sm rounded-lg hover:bg-gray-100 transition"
              >
                Dashboard
              </Link>

              <Link
                href="/people"
                onClick={() => setOpen(false)}
                className="block px-3 py-2 text-sm rounded-lg hover:bg-gray-100 transition"
              >
                People
              </Link>

              <button
                onClick={() => {
                  setOpen(false)
                  setConfirmOpen(true)
                }}
                className="w-full text-left px-3 py-2 text-sm rounded-lg text-red-600 hover:bg-red-50 transition"
              >
                Logout
              </button>

            </div>
          </div>
        )}
      </div>

      {/* ==================== CONFIRMATION MODAL ==================== */}
      {confirmOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">

          <div
            ref={modalRef}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-6 animate-in fade-in zoom-in-95 duration-200"
          >
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Confirm Logout
              </h2>
              <p className="text-sm text-gray-600 mt-2">
                Are you sure you want to logout?
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmOpen(false)}
                className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-50 transition"
              >
                Cancel
              </button>

              <button
                onClick={handleLogout}
                disabled={isPending}
                className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50"
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Logging out...
                  </span>
                ) : (
                  'Logout'
                )}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  )
}
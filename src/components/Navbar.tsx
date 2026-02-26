'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import LogoutButton from './auth/LogoutButton'

export default function Navbar({ user }: { user: any }) {
    const pathname = usePathname()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setDropdownOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    return (
        <header className="sticky top-0 z-50 backdrop-blur bg-white/70 border-b">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex justify-between items-center h-16">

                    {/* Logo */}
                    <Link
                        href="/"
                        className={`text-xl font-bold ${pathname === '/' ? 'text-blue-600' : 'text-gray-900'
                            }`}
                    >
                        CAP All-Hands
                    </Link>

                    {/* Desktop Right Section */}
                    <div className="hidden md:flex items-center gap-4">

                        {!user && (
                            <Link
                                href="/login"
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                            >
                                Login
                            </Link>
                        )}

                        {user && (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold hover:bg-blue-700 transition"
                                >
                                    {user.email?.charAt(0).toUpperCase()}
                                </button>

                                {dropdownOpen && (
                                    <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-lg border p-3 space-y-2">

                                        {/* Email - fixed overflow */}
                                        <p className="text-sm text-gray-500 break-all leading-snug">
                                            {user.email}
                                        </p>

                                        <div className="border-t pt-2 space-y-1">
                                            <Link
                                                href="/profile"
                                                className="block px-3 py-2 text-sm rounded-lg hover:bg-gray-100 transition"
                                            >
                                                Profile
                                            </Link>

                                            <Link
                                                href="/dashboard"
                                                className="block px-3 py-2 text-sm rounded-lg hover:bg-gray-100 transition"
                                            >
                                                Dashboard
                                            </Link>

                                            <div className="flex items-center px-3 py-2 rounded-lg hover:bg-gray-100 transition w-full">
                                                <LogoutButton variant="minimal" />
                                            </div>
                                        </div>

                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Mobile Toggle */}
                    <button
                        className="md:hidden"
                        onClick={() => setMobileOpen(!mobileOpen)}
                    >
                        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="md:hidden bg-white border-t px-6 py-4 space-y-4">
                    <Link href="/">Home</Link>

                    {user ? (
                        <>
                            <Link href="/profile">Profile</Link>
                            <Link href="/dashboard">Dashboard</Link>
                        </>
                    ) : (
                        <Link href="/login">Login</Link>
                    )}
                </div>
            )}
        </header>
    )
}
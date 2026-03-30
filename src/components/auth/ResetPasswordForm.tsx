'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function ResetPasswordForm() {
  const router = useRouter()
  const supabase = createClient()
  const [isPending, startTransition] = useTransition()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid'>('loading')

  useEffect(() => {
    // We check the session once. Supabase recovery links automatically 
    // sign the user in with a "recovery" session.
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setStatus('valid')
      } else {
        // Small delay to prevent flickering if the URL fragment 
        // is still being processed by the client SDK
        setTimeout(async () => {
          const { data: { session: retrySession } } = await supabase.auth.getSession()
          setStatus(retrySession ? 'valid' : 'invalid')
        }, 500)
      }
    }

    checkSession()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    // 1. Robust Validation
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      // 2. Update User
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      })

      if (updateError) throw updateError

      // 3. Force Sign out to clear the recovery session completely
      await supabase.auth.signOut()

      // 4. Use startTransition for smoother Next.js navigation
      startTransition(() => {
        router.push('/login?message=Your password has been updated. Please sign in with your new password.')
        router.refresh()
      })
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.')
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="animate-pulse rounded-lg border border-gray-200 bg-gray-50 p-4">
        <p className="text-sm font-medium text-gray-700">Validating security token...</p>
      </div>
    )
  }

  if (status === 'invalid') {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-800">
            This password reset link is invalid or has expired.
          </p>
        </div>
        <Link href="/forgot-password" title="Request new link" className="text-sm font-semibold text-blue-600 hover:text-blue-500">
          ← Request a new reset link
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4" role="alert">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      <div className="space-y-1">
        <label htmlFor="password" title="New Password" className="block text-sm font-medium text-gray-900">
          New Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            required
            disabled={loading || isPending}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:bg-gray-100"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="confirmPassword" title="Confirm Password" className="block text-sm font-medium text-gray-900">
          Confirm New Password
        </label>
        <input
          id="confirmPassword"
          type={showPassword ? 'text' : 'password'}
          required
          disabled={loading || isPending}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:bg-gray-100"
        />
      </div>

      <div className="flex items-center">
        <input
          id="show-pw"
          type="checkbox"
          className="h-4 w-4 rounded border-gray-300 text-blue-600"
          onChange={() => setShowPassword(!showPassword)}
        />
        <label htmlFor="show-pw" className="ml-2 block text-sm text-gray-700 select-none">
          Show passwords
        </label>
      </div>

      <button
        type="submit"
        disabled={loading || isPending}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {loading ? 'Updating...' : 'Update Password'}
      </button>
    </form>
  )
}
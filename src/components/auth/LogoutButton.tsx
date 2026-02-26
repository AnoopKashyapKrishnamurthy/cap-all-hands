'use client'

import { useState, useTransition } from 'react'
import { logoutAction } from '@/lib/auth/actions'

interface LogoutButtonProps {
  variant?: 'default' | 'minimal'
}

export default function LogoutButton({
  variant = 'default',
}: LogoutButtonProps) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleLogout = () => {
    if (isPending) return

    setError(null)

    startTransition(async () => {
      try {
        await logoutAction()
      } catch (err) {
        console.error(err)
        setError('Failed to logout. Please try again.')
      }
    })
  }

  const baseClasses =
    'inline-flex items-center justify-center rounded-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed'

  const styles =
    variant === 'minimal'
      ? 'text-red-600 hover:underline text-sm'
      : 'bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm'

  return (
    <div className="space-y-2">
      {error && (
        <p className="text-red-600 text-sm">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleLogout}
        disabled={isPending}
        className={`${baseClasses} ${styles}`}
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
  )
}
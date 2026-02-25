import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'

export default async function Home() {
  const user = await getCurrentUser()

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          CAP All-Hands
        </h1>
        <p className="text-xl text-gray-600 mb-12">
          Internal team collaboration platform for seamless communication
        </p>

        <div className="flex gap-4 justify-center flex-wrap">
          {user ? (
            <Link
              href="/dashboard"
              className="btn-primary text-lg px-6 py-3"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="btn-primary text-lg px-6 py-3"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="btn-secondary text-lg px-6 py-3"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
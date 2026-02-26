import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'

export default async function Home() {
  const user = await getCurrentUser()

  return (
    <section className="flex flex-col items-center justify-center text-center min-h-[80vh]">
      <h1 className="text-4xl sm:text-6xl font-bold mb-6 tracking-tight">
        Internal Team Collaboration
      </h1>

      <p className="text-lg text-gray-600 max-w-2xl mb-10">
        CAP All-Hands helps teams collaborate, track updates,
        and communicate seamlessly across the organization.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        {user ? (
          <Link
            href="/dashboard"
            className="bg-blue-600 text-white px-6 py-3 rounded-xl text-lg hover:bg-blue-700 transition"
          >
            Go to Dashboard
          </Link>
        ) : (
          <>
            <Link
              href="/login"
              className="bg-blue-600 text-white px-6 py-3 rounded-xl text-lg hover:bg-blue-700 transition"
            >
              Sign In
            </Link>

            <Link
              href="/register"
              className="border border-gray-300 px-6 py-3 rounded-xl text-lg hover:bg-gray-100 transition"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </section>
  )
}
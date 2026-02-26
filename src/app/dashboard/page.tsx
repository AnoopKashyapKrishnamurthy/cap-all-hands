import Link from 'next/link'
import { protectRoute } from '@/lib/auth'
// import LogoutButton from '@/components/auth/LogoutButton'

export const metadata = {
  title: 'Dashboard - CAP All-Hands',
}

export default async function DashboardPage() {
  const user = await protectRoute()

  return (
    <section className="space-y-10">

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Welcome back, <span className="font-medium">{user.email}</span>
          </p>
        </div>


      </div>

      {/* Overview Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">



        {/* Book Reviews Card */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 hover:shadow-md transition">
          <h3 className="text-lg font-semibold mb-4">
            📚 Book Reviews
          </h3>

          <p className="text-gray-600 text-sm mb-5">
            Browse community reviews or write your own.
          </p>

          <div className="flex flex-col gap-3">
            <Link
              href="/reviews"
              className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition text-center"
            >
              Browse Reviews
            </Link>

            <Link
              href="/reviews/new"
              className="bg-green-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-green-700 transition text-center"
            >
              Write a Review
            </Link>
          </div>
        </div>



      </div>

      {/* Footer */}
      <div className="pt-10 border-t text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} CAP All-Hands · Internal Platform
      </div>

    </section>
  )
}
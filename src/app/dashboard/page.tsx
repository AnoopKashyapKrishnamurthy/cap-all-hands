import { protectRoute } from '@/lib/auth'
import LogoutButton from '@/components/auth/LogoutButton'

export const metadata = {
  title: 'Dashboard - CAP All-Hands',
}

export default async function DashboardPage() {
  // Validates user and redirects if not authenticated
  const user = await protectRoute()

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">
              CAP All-Hands
            </h1>

            <div className="flex items-center gap-4">
              <span className="text-gray-600 font-medium">
                {user.email}
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Welcome Card */}
          <div className="md:col-span-3 card">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to CAP All-Hands
            </h2>
            <p className="text-gray-600 text-lg mb-6">
              You're successfully authenticated.
            </p>

            <LogoutButton />
          </div>

          {/* User Info Card */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              👤 Profile Information
            </h3>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900 break-all">
                  {user.email}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">User ID</p>
                <p className="font-mono text-sm text-gray-900">
                  {user.id}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Account Created</p>
                <p className="text-gray-900">
                  {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Book Review Links */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📚 Book Reviews
            </h3>

            <p className="text-gray-600 mb-4">
              Read reviews from the community or share your own thoughts.
            </p>

            <div className="flex space-x-2">
              <a
                href="/reviews"
                className="px-3 py-1 bg-blue-500 text-white rounded"
              >
                Browse Reviews
              </a>

              <a
                href="/reviews/new"
                className="px-3 py-1 bg-green-500 text-white rounded"
              >
                Write a Review
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-center text-gray-600 text-sm">
            CAP All-Hands
          </p>
        </div>
      </div>
    </main>
  )
}
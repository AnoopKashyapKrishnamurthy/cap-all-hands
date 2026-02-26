import { protectRoute } from '@/lib/auth'

export const metadata = {
  title: 'Profile - CAP All-Hands',
}

export default async function ProfilePage() {
  const user = await protectRoute()

  return (
    <section className="max-w-4xl mx-auto space-y-10">

      {/* Page Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Profile
        </h1>
        <p className="text-gray-600 mt-2">
          Manage your account information
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm border p-8 space-y-8">

        {/* Avatar Section */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold">
            {user.email?.charAt(0).toUpperCase()}
          </div>

          <div>
            <p className="text-lg font-semibold">{user.email}</p>
            <p className="text-sm text-gray-500">
              User ID: {user.id}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t pt-6">

          <h2 className="text-xl font-semibold mb-6">
            Account Details
          </h2>

          <div className="grid gap-6 sm:grid-cols-2">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="text"
                value={user.email}
                disabled
                className="w-full px-4 py-2 border rounded-lg bg-gray-100 text-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Created
              </label>
              <input
                type="text"
                value={new Date(user.created_at).toLocaleDateString()}
                disabled
                className="w-full px-4 py-2 border rounded-lg bg-gray-100 text-gray-700"
              />
            </div>

          </div>
        </div>

      </div>

      {/* Security Section
      <div className="bg-white rounded-2xl shadow-sm border p-8 space-y-6">
        <h2 className="text-xl font-semibold">
          Security
        </h2>

        <div className="flex flex-col sm:flex-row gap-4">
          <button className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Change Password
          </button>

          <button className="px-5 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition">
            Delete Account
          </button>
        </div>
      </div> */}

    </section>
  )
}
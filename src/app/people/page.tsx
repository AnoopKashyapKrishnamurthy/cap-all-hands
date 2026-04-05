import { protectRoute } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import UserCard, { DirectoryUser } from '@/components/profile/UserCard'
import PopcornStandup from '@/components/people/PopcornStandup'

export const metadata = {
  title: 'People - CAP All-Hands',
}

export default async function PeoplePage() {
  await protectRoute()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('user_profiles')
    .select('id, email, display_name, avatar_url, bio, created_at')
    .order('display_name', { ascending: true })

  if (error) {
    return (
      <section className="max-w-6xl mx-auto py-8">
        <div className="bg-white border rounded-2xl shadow-sm p-8 text-center">
          <p className="text-red-600 font-medium">Unable to load team members</p>
          <p className="text-sm text-gray-500 mt-2">Please try again in a moment.</p>
        </div>
      </section>
    )
  }

  const users = (data ?? []) as DirectoryUser[]

  return (
    <section className="max-w-6xl mx-auto space-y-8 py-4">

      {/* MINIMAL CHANGE: Native HTML Collapsible */}
      <details className="bg-white border rounded-2xl shadow-sm overflow-hidden group">
        <summary className="flex items-center justify-between p-4 sm:p-6 cursor-pointer hover:bg-gray-50 transition-colors list-none [&::-webkit-details-marker]:hidden">
          <div className="flex items-center gap-4">

            <div>
              <h2 className="font-semibold text-gray-900 text-lg">Popcorn Standup Mode</h2>
              <p className="text-xs sm:text-sm text-gray-500 font-normal">Click to expand and select team members</p>
            </div>
          </div>
          <span className="text-gray-400 group-open:rotate-180 transition-transform duration-200">
            ▼
          </span>
        </summary>
        <div className="border-t bg-gray-50/30 p-2 sm:p-4">
          <PopcornStandup users={users} />
        </div>
      </details>

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">People</h1>
          <p className="text-gray-600 mt-2">
            Browse team members who have completed profiles.
          </p>
        </div>
        <p className="text-sm text-gray-500">
          {users.length} member{users.length === 1 ? '' : 's'}
        </p>
      </div>

      {users.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-dashed rounded-2xl p-12 text-center">
          <p className="text-gray-700 font-medium">No profiles found</p>
          <p className="text-sm text-gray-500 mt-2">
            Team members will appear here once they complete their profile.
          </p>
        </div>
      )}
    </section>
  )
}
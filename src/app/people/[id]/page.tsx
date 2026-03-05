import { notFound } from 'next/navigation'
import Link from 'next/link'
import { protectRoute } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

interface PeopleProfilePageProps {
  params: Promise<{ id: string }>
}

export default async function PeopleProfilePage({ params }: PeopleProfilePageProps) {
  await protectRoute()

  const { id } = await params
  const supabase = await createClient()

  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('id, email, display_name, avatar_url, bio, created_at')
    .eq('id', id)
    .maybeSingle()

  if (error || !profile) {
    notFound()
  }

  const initial = (profile.display_name || profile.email || 'U')
    .charAt(0)
    .toUpperCase()

  const createdDate = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    : 'Unknown'

  return (<section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">

    
    {/* Back Link */}
    <div>
      <Link
        href="/people"
        className="text-sm font-medium text-blue-600 hover:text-blue-700 transition"
      >
        ← Back to People
      </Link>
    </div>

    {/* Profile Card */}
    <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">

      {/* Cover */}
      <div className="h-36 sm:h-40 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-400" />

      <div className="px-5 sm:px-10 pb-10">

        {/* Header */}
        <div className="-mt-16 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">

          <div className="flex flex-col sm:flex-row sm:items-end gap-5">

            {/* Avatar */}
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={`${profile.display_name || 'User'} avatar`}
                className="h-24 w-24 sm:h-28 sm:w-28 rounded-full object-cover ring-4 ring-white bg-white shadow"
              />
            ) : (
              <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-full bg-blue-600 text-white text-3xl font-semibold flex items-center justify-center ring-4 ring-white shadow">
                {initial}
              </div>
            )}

            {/* Name + Email */}
            <div className="min-w-0 pb-2">

              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 break-words">
                {profile.display_name || 'Unnamed User'}
              </h1>


            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-10 grid gap-8 sm:grid-cols-2">

          {/* Bio */}
          <div className="sm:col-span-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
              Bio
            </h2>

            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
              {profile.bio?.trim() || 'This user has not added a bio yet.'}
            </p>
          </div>

          {/* Member Since */}
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Member Since
            </h2>

            <p className="text-gray-700 break-words">
              {createdDate}
            </p>
          </div>

          {/* Contact */}
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Contact
            </h2>

            <p className="text-gray-700 break-all">
              {profile.email}
            </p>
          </div>

        </div>

      </div>
    </div>

    {/* Activity Section */}
    <div className="bg-white border rounded-2xl shadow-sm p-6 sm:p-8 text-center">
      <p className="text-gray-800 font-semibold">
        Activity
      </p>

      <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
        Blogs, reviews, and other contributions from this user will appear here.
      </p>
    </div>

  </section>


  )
}

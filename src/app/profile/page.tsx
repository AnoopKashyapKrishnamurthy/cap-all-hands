import { protectRoute } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import ProfileForm from '@/components/profile/ProfileForm'

export const metadata = {
  title: 'Profile - CAP All-Hands',
}

export default async function ProfilePage() {
  const user = await protectRoute()
  const supabase = await createClient()

  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('id, email, display_name, avatar_url, bio, created_at')
    .eq('id', user.id)
    .maybeSingle()

  if (error) {
    console.error('Profile fetch error:', error)
  }

  const fallbackDisplayName =
    user.user_metadata?.display_name ??
    user.email?.split('@')[0] ??
    'User'

  const initialProfile = {
    id: user.id,
    email: profile?.email || user.email || '',
    display_name: profile?.display_name || fallbackDisplayName,
    avatar_url: profile?.avatar_url || null,
    bio: profile?.bio || '',
    created_at: profile?.created_at || user.created_at || null,
  }

  return (
    <section className="max-w-5xl mx-auto space-y-8 py-6 px-6">

      <div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Profile
        </h1>

        <p className="text-gray-600 mt-2">
          Manage your account details and public profile.
        </p>
      </div>

      <ProfileForm initialProfile={initialProfile} />

    </section>
  )
}
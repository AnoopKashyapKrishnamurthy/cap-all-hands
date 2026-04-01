import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { protectRoute } from '@/lib/auth'
import GalleryGrid from '@/components/gallery/GalleryGrid'

export const metadata = {
  title: 'Gallery - CAP All-Hands',
}

export const revalidate = 0

export default async function GalleryPage() {
  const user = await protectRoute()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('gallery_items')
    .select(`
      *,
      profile:user_profiles (
        display_name,
        avatar_url
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Gallery fetch error:', error)
    return (
      <div className="flex items-center justify-center py-24">
        <div className="bg-white border rounded-2xl shadow-sm p-8 text-center">
          <p className="text-red-600 font-medium mb-2">Unable to load gallery</p>
          <p className="text-sm text-gray-500">Please try again later.</p>
        </div>
      </div>
    )
  }

  const items = (data ?? []).map((item) => ({
    ...item,
    profile: Array.isArray(item.profile) ? item.profile[0] : item.profile ?? undefined,
  }))

  return (
    <section className="max-w-6xl mx-auto space-y-10 py-12 px-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            🖼️ Gallery
          </h1>
          <p className="text-gray-600 mt-2">
            Photos and visuals shared by the team.
          </p>
        </div>

        <Link
          href="/gallery/upload"
          className="bg-blue-600 text-white px-5 py-2 rounded-xl hover:bg-blue-700 transition text-sm font-medium text-center"
        >
          + Upload Photo
        </Link>
      </div>

      <GalleryGrid items={items} currentUserId={user.id} />
    </section>
  )
}
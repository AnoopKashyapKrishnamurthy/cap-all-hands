import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { protectRoute } from '@/lib/auth'
import GalleryGrid from '@/components/gallery/GalleryGrid'
import { GalleryItem, Interaction } from '@/lib/types'

export const metadata = { title: 'Gallery - CAP All-Hands' }
export const revalidate = 0

export default async function GalleryPage() {
  const user = await protectRoute()
  const supabase = await createClient()

  const { data: galleryData, error: galleryError } = await supabase
    .from('gallery_items')
    .select(`*, profile:user_profiles ( display_name, avatar_url )`)
    .order('created_at', { ascending: false })

  if (galleryError) {
    console.error('Gallery fetch error:', galleryError)
    return (
      <div className="flex items-center justify-center py-24">
        <div className="bg-white border rounded-2xl shadow-sm p-8 text-center">
          <p className="text-red-600 font-medium mb-2">Unable to load gallery</p>
          <p className="text-sm text-gray-500">Please try again later.</p>
        </div>
      </div>
    )
  }

  const galleryIds = (galleryData ?? []).map((i) => i.id)

  const { data: interactionsData } = await supabase
    .from('interactions')
    .select(`*, profile:user_profiles ( display_name, avatar_url )`)
    .eq('target_type', 'gallery')
    .in('target_id', galleryIds.length > 0 ? galleryIds : [''])
    .order('created_at', { ascending: true })

  const interactionsByItem: Record<string, Interaction[]> = {}
  for (const interaction of interactionsData ?? []) {
    if (!interactionsByItem[interaction.target_id]) {
      interactionsByItem[interaction.target_id] = []
    }
    interactionsByItem[interaction.target_id].push({
      ...interaction,
      profile: Array.isArray(interaction.profile)
        ? interaction.profile[0]
        : interaction.profile ?? undefined,
    })
  }

  const items: GalleryItem[] = (galleryData ?? []).map((item) => ({
    ...item,
    profile: Array.isArray(item.profile) ? item.profile[0] : item.profile ?? undefined,
    interactions: interactionsByItem[item.id] ?? [],
  }))

  return (
    <section className="max-w-4xl mx-auto space-y-6 py-10 px-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Team Gallery</h1>
          <p className="text-gray-500 mt-1 text-sm">
            {items.length} {items.length === 1 ? 'photo' : 'photos'} shared by the team
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